use arrow::buffer;
use duckdb::{Connection, Result};

pub struct MyConnection {
    conn: duckdb::Connection
}

impl MyConnection {
    pub fn new(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        // 建立 in-memory 連線
        let conn = Connection::open_in_memory()?;
        // attach 外部 db 為 schema "db"
        let sql = format!("ATTACH '{}' AS db;", path);
        conn.execute(&sql, [])?;
        conn.execute_batch("CHECKPOINT;")?;
        Ok( Self { conn } )
    }

    fn give_connection(&self) -> &Connection {
        &self.conn
    }

    pub fn list_tables(&self) -> Result<Vec<String>, Box<dyn std::error::Error>> {
        let conn = self.give_connection();
       // 取得 db 內所有的 table
        let sql = "select table_name from information_schema.tables where table_catalog = 'db'";
        let mut stmt = conn.prepare(sql)?;
        let mut rows = stmt.query([])?;
        let mut names = vec![];
        while let Some(row) =  rows.next()? {
            let name: String = row.get(0)?;
            names.push(name);
        }
        conn.execute_batch("CHECKPOINT;")?;
        Ok(names)
    }

    pub fn table_info(&self, table_name: &str) -> Result<(), Box<dyn std::error::Error>>
    {
        let table_names = self.list_tables()?;
        let is_contained = table_names.contains(&table_name.to_string());
        if !is_contained {
            return Err(format!("database does not contain this table '{table_name}'").into());
        }
        let conn = &self.conn;
        let sql = format!("pragma table_info('db.{table_name}')");
        let record_batchs: Vec<arrow::record_batch::RecordBatch> = conn.prepare(&sql)?.query_arrow([])?.collect();
        let mut buffer = Vec::with_capacity(1024);
        {
            let mut writer = arrow::csv::Writer::new(&mut buffer);
            for batch in &record_batchs {
                writer.write(batch)?;
            }
        }
        let path = format!("../table_info-{}.csv", table_name);
        std::fs::write(path, buffer)?;
        conn.execute_batch("CHECKPOINT;")?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use crate::sql::conn::MyConnection;
    #[test]
    fn test() -> Result<(), Box<dyn std::error::Error>>
    {
        let conn = MyConnection::new("../data.duckdb")?;
        let table_names = conn.list_tables()?;
        for table in table_names {
            conn.table_info(&table)?;
        }
        Ok(())
    }
}