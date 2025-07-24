use std::sync::atomic::{AtomicU32, Ordering};
use duckdb::{Connection, Result};

#[derive(Debug)]
pub struct MyConnection {
    conn: duckdb::Connection,
    path: String,
    index: u32,
}

static COUNT: AtomicU32 = AtomicU32::new(0);

impl MyConnection {
    pub fn new_no_path() -> Result<Self, Box<dyn std::error::Error>> {
        let conn = Connection::open_in_memory()?;
        let index = Self::conn_accumulator();
        Ok( Self { conn, path: "".to_string(), index } )
    }

    pub fn new(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        // 建立 in-memory 連線
        let conn = Connection::open_in_memory()?;
        let index = Self::conn_accumulator();
        // attach 外部 db 為 schema "db"
        let sql = format!("ATTACH '{}' AS db_{};", path, index);
        conn.execute(&sql, [])?;
        conn.execute_batch("CHECKPOINT;")?;
        Ok( Self { conn, path: path.to_string(), index } )
    }

    fn conn_accumulator () -> u32 {
        COUNT.fetch_add(1, Ordering::Relaxed) + 1
    }

    fn give_connection(&self) -> &Connection {
        &self.conn
    }

    fn connection_db_path(&self) -> &String {
        &self.path
    }

    pub fn list_tables(&self) -> Result<Vec<String>, Box<dyn std::error::Error>> {
        let conn = self.give_connection();
       // 取得 db 內所有的 table
        let sql = format!(
            "select table_name from information_schema.tables where table_catalog = 'db_{}';",
            self.index
        );
        let mut stmt = conn.prepare(&sql)?;
        let mut rows = stmt.query([])?;
        let mut names = vec![];
        while let Some(row) =  rows.next()? {
            let name: String = row.get(0)?;
            names.push(name);
        }
        conn.execute_batch("CHECKPOINT;")?;
        Ok(names)
    }

    pub fn table_info(&self, table_name: &str) 
        -> Result<Option<Vec<arrow::record_batch::RecordBatch>>, Box<dyn std::error::Error>>
    {
        let table_names = self.list_tables()?;
        let is_contained = table_names.contains(&table_name.to_string());
        if !is_contained { return Ok(None); }
        let conn = self.give_connection();
        let id = self.index;
        let sql = format!("pragma table_info('db_{id}.{table_name}')");
        // let sql = format!("select * from db_{id}.{table_name}");
        let record_batchs: Vec<arrow::record_batch::RecordBatch> = conn
            .prepare(&sql)?
            .query_arrow([])?
            .collect();
        
        conn.execute_batch("CHECKPOINT;")?;
        if record_batchs.len() == 0 { return  Ok(None); }
        Ok(Some(record_batchs))
    }

    pub fn show_all_table(&self, table_name: &str)
        -> Result<Option<Vec<arrow::record_batch::RecordBatch>>, Box<dyn std::error::Error>>
    {
        let table_names = self.list_tables()?;
        let is_contained = table_names.contains(&table_name.to_string());
        if !is_contained { return Ok(None); }
        let conn = self.give_connection();
        let id = self.index;
        let sql = format!("select * from db_{id}.{table_name};");
        let record_batchs: Vec<arrow::record_batch::RecordBatch> = conn
            .prepare(&sql)?
            .query_arrow([])?
            .collect();
        
        conn.execute_batch("CHECKPOINT;")?;
        if record_batchs.len() == 0 { return  Ok(None); }
        Ok(Some(record_batchs))
    }

    pub fn sql_query(&self, sql: &str) 
        -> Result<Option<Vec<arrow::record_batch::RecordBatch>>, Box<dyn std::error::Error>>
    {
        let conn = self.give_connection();
        let record_batchs: Vec<arrow::record_batch::RecordBatch> = conn
            .prepare(&sql)?
            .query_arrow([])?
            .collect();
        
        conn.execute_batch("CHECKPOINT;")?;
        if record_batchs.len() == 0 { return  Ok(None); }
        Ok(Some(record_batchs))
    }
}

#[cfg(test)]
mod tests {
    use crate::sql::conn::MyConnection;
    #[test]
    fn test2() -> Result<(), Box<dyn std::error::Error>>
    {
        let conn = MyConnection::new("../data.duckdb")?;
        let rbs = conn.table_info("cells")?;
        println!("{rbs:#?}");
        Ok(())
    }

    #[test]
    fn test() -> Result<(), Box<dyn std::error::Error>>
    {
        let conn = MyConnection::new("../data.duckdb")?;
        let table_names = conn.list_tables()?;
        for table in table_names {
            let rb = conn.table_info(&table)?;
            if let Some(batches) = rb {
                let schema = batches[0].schema();
                let mut buffer = Vec::with_capacity(1024); 
                {
                    let mut writer = 
                        arrow::ipc::writer::StreamWriter::try_new(&mut buffer, &schema)?;
                    for batch in &batches {
                        writer.write(batch)?;
                    }
                }
                println!("{table:#?}");
                {
                    let mut cursor = std::io::Cursor::new(&buffer);
                    let reader = arrow::ipc::reader::StreamReader::try_new(&mut cursor, None)?;
                    for maybe_batch in reader {
                        let batch = maybe_batch?;
                        println!("{batch:#?}");
                    }
                }
            }
        }
        Ok(())
    }
}