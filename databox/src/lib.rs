use arrow::array::RecordBatch;
use axum::{body::Body, http::Response, response::IntoResponse, routing::get, Router};
use tokio::net::TcpListener;

/// 建立 Arrow RecordBatch
fn create_arrow_batch()
    -> Result<Vec<RecordBatch>, Box<dyn std::error::Error>>
{
    let conn = duckdb::Connection::open_in_memory()?;
    conn.execute("attach 'C:/Users/USER/Desktop/dotnet_test/React-test/my-workspace/data/data.duckdb' as db;", [])?;
    let sql = "SELECT * FROM db.cars;";
    let record_batches: Vec<RecordBatch> = conn
        .prepare(&sql)?
        .query_arrow([])?
        .collect();
    
    conn.execute_batch("CHECKPOINT;")?;
    Ok(record_batches)
}

/// 回傳 Arrow IPC Stream 的 HTTP handler
async fn arrow_handler() -> Result<impl IntoResponse, impl IntoResponse> {
    match create_arrow_batch() {
        Ok(batches) => {
            let batch = match batches.get(0) {
                Some(rb) => rb,
                None => return Err(Response::builder().status(404).body(Body::from("No data")).unwrap()),
            };

            let mut buf = Vec::new();
            {
                let mut writer = arrow::ipc::writer::StreamWriter::try_new(&mut buf, &batch.schema()).unwrap();
                for batch in batches {
                    writer.write(&batch).unwrap();
                }
                writer.finish().unwrap();
            }

            Ok(
                Response::builder()
                    .header("content-type", "application/vnd.apache.arrow.stream")
                    .body(Body::from(buf))
                    .unwrap()
            )
        }
        Err(err) => Err(Response::builder()
            .status(500)
            .body(Body::from(format!("Error: {}", err)))
            .unwrap()),
    }
}

/// 建立 Router
pub fn build_arrow_router() -> Router {
    Router::new().route("/arrow", get(arrow_handler))
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
    let app = build_arrow_router();
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
