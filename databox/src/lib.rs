use arrow::array::RecordBatch;
use axum::{body::Body, http::{HeaderMap, StatusCode}, response::Response, routing::get, Router};
use tokio::net::TcpListener;
use headers::{HeaderMapExt, Range}; // 提供 typed_try_get()
use std::ops::Bound;


/// 建立 Arrow RecordBatch
fn create_arrow_batch()
    -> Result<Vec<RecordBatch>, Box<dyn std::error::Error>>
{
    let conn = duckdb::Connection::open_in_memory()?;
    conn.execute("attach 'C:/Users/USER/Desktop/dotnet_test/React-test/my-workspace/data/data.duckdb' as db;", [])?;
    conn.execute("attach 'C:/Users/USER/Desktop/dotnet_test/React-test/my-workspace/data/vote.sqlite' as vote (type sqlite);", [])?;
    let sql = "SELECT * FROM vote.content_tbl;";
    let record_batches: Vec<RecordBatch> = conn
        .prepare(&sql)?
        .query_arrow([])?
        .collect();
    
    conn.execute_batch("CHECKPOINT;")?;
    Ok(record_batches)
}

async fn arrow_handler() -> Response {
    match create_arrow_batch() {
        Ok(batches) => {
            let batch = match batches.get(0) {
                Some(rb) => rb,
                None => {
                    return Response::builder()
                        .status(404)
                        .body(Body::from("No data"))
                        .unwrap();
                }
            };

            let mut buf = Vec::new();
            {
                let mut writer = arrow::ipc::writer::StreamWriter::try_new(&mut buf, &batch.schema()).unwrap();
                for batch in batches {
                    writer.write(&batch).unwrap();
                }
                writer.finish().unwrap();
            }

            Response::builder()
                .header("content-type", "application/vnd.apache.arrow.stream")
                .header("accept-ranges", "none")
                .body(Body::from(buf))
                .unwrap()
        }
        Err(err) => Response::builder()
            .status(500)
            .body(Body::from(format!("Error: {}", err)))
            .unwrap(),
    }
}

// ----------------- CSV Handler -----------------
async fn arrow_csv_handler() -> Response {
    match create_arrow_batch() {
        Ok(batches) => {
            let mut buf = Vec::new();
            {
                let mut writer = arrow::csv::Writer::new(&mut buf);
                for batch in batches {
                    writer.write(&batch).unwrap();
                }
            }

            Response::builder()
                .header("content-type", "text/csv; charset=utf-8")
                .header("accept-ranges", "none")
                .body(Body::from(buf))
                .unwrap()
        }
        Err(err) => Response::builder()
            .status(500)
            .body(Body::from(format!("Error: {}", err)))
            .unwrap(),
    }
}

async fn arrow_parquet_handler(headers: HeaderMap) -> Response {
    // Step 1: 建立 Parquet buffer
    let buf = match create_parquet_buffer() {
        Ok(buf) => buf,
        Err(err) => {
            return Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Body::from(format!("Error: {}", err)))
                .unwrap();
        }
    };

    let file_size = buf.len() as u64;

    // Step 2: 解析 Range header
    let range_opt = headers.typed_try_get::<Range>().ok().flatten();
    let (start, end) = if let Some(range) = range_opt {
        if let Some((start_bound, end_bound)) = range.satisfiable_ranges(file_size).next() {
            let start = match start_bound {
                Bound::Included(n) => n,
                _ => 0,
            };
            let end = match end_bound {
                Bound::Included(n) => n,
                Bound::Unbounded => file_size - 1,
                _ => file_size - 1,
            };
            (start, end)
        } else {
            // 無效範圍
            return Response::builder()
                .status(StatusCode::RANGE_NOT_SATISFIABLE)
                .header("Content-Range", format!("bytes */{}", file_size))
                .body(Body::empty())
                .unwrap();
        }
    } else {
        // 沒有 Range header → 全檔
        (0, file_size - 1)
    };

    // Step 3: 擷取指定範圍
    let start_usize = start as usize;
    let end_usize = end as usize;
    let body = buf[start_usize..=end_usize].to_vec();

    // Step 4: 回傳 206 或 200
    if start == 0 && end == file_size - 1 {
        // 全檔
        Response::builder()
            .status(StatusCode::OK)
            .header("Content-Length", body.len().to_string())
            .header("Content-Type", "application/x-parquet")
            .body(Body::from(body))
            .unwrap()
    } else {
        // Partial Content
        Response::builder()
            .status(StatusCode::PARTIAL_CONTENT)
            .header(
                "Content-Range",
                format!("bytes {}-{}/{}", start, end, file_size),
            )
            .header("Content-Length", body.len().to_string())
            .header("Content-Type", "application/x-parquet")
            .body(Body::from(body))
            .unwrap()
    }
}
/// 專門產生 Parquet buffer 的函數
fn create_parquet_buffer() -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let batches = create_arrow_batch()?;
    let schema = batches[0].schema();
    let mut buf = Vec::new();

    {
        let mut writer = parquet::arrow::ArrowWriter::try_new(&mut buf, schema, None)?;
        for batch in batches {
            writer.write(&batch)?;
        }
        writer.close()?;
    }

    Ok(buf)
}

/// 建立 Router
pub fn build_arrow_router() -> Router {
    Router::new()
        .route("/arrow", get(arrow_handler))
        .route("/arrow-csv", get(arrow_csv_handler))
        .route("/arrow-parquet", get(arrow_parquet_handler))
}


pub fn build_router() -> Router
{
    Router::new().route("/", get(|| async {
        "hello world"
    }))
}

/// 啟動伺服器（可供 Tauri 或獨立 bin 使用）
///
/// # Example
/// ```no_run
/// tokio::spawn(async { databox::start_server(3000).await });
/// ```
pub async fn start_server(port: u16) 
    -> Result<(), Box<dyn std::error::Error>>
{
    let app = 
        build_arrow_router()
        .route("/hello", get(|| async {
            "hello world"
        }));
    let addr = format!("127.0.0.1:{}", port);

    println!("Server running at http://{addr}");
    let listener = TcpListener::bind(addr).await?;
    println!("Server running at http://{}", listener.local_addr()?);
    axum::serve(listener, app).await?;
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn tes_start_server() 
        -> Result<(), String>
    {
        start_server(1688).await.map_err(|err| err.to_string())?;
        Ok(())
    }
}
