use std::{collections::HashMap, sync::atomic::{AtomicU32, Ordering}};
use duckdb::{Connection, Result};

#[derive(Debug)]
pub struct MyConnection {
    conn: duckdb::Connection,
    attach_map: HashMap<String, u32>,
}

static COUNT: AtomicU32 = AtomicU32::new(0);

impl MyConnection {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let conn = Connection::open_in_memory()?;
        Ok( Self { conn, attach_map: HashMap::new() } )
    }

    fn conn_accumulator () -> u32 {
        COUNT.fetch_add(1, Ordering::Relaxed) + 1
    }

    pub fn attach_db(&mut self, path: &str) -> Result<(), Box<dyn std::error::Error>>
    {
        let index = Self::conn_accumulator();
        let sql = format!("attach '{path}' as db_{index}");
        let conn = self.give_connection();
        conn.execute(&sql, [])?;
        conn.execute_batch("CHECKPOINT;")?;
        self.attach_map.insert(path.to_string(), index);
        Ok(())
    }

    fn give_connection(&self) -> &Connection {
        &self.conn
    }

    fn get_db_index(&self, path: &str) -> Option<u32>
    {
        self.attach_map.get(&path.to_string()).map(|u| u.clone())
    }

    pub fn list_db_tables(&self, path: &str) -> Result<Vec<String>, Box<dyn std::error::Error>> {
        let conn = self.give_connection();
        let index = match self.get_db_index(path) {
            Some(u) => u,
            None => return Err("connection does not contained this db.".into())
        }; 

        // 取得 db 內所有的 table
        let sql = format!(
            "select table_name from information_schema.tables where table_catalog = 'db_{}';",
            index
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

    pub fn table_info(&self, path: &str, table_name: &str) 
        -> Result<Option<Vec<arrow::record_batch::RecordBatch>>, Box<dyn std::error::Error>>
    {
        let table_names = self.list_db_tables(path)?;
        let is_contained = table_names.contains(&table_name.to_string());
        if !is_contained { return Ok(None); }
        let conn = self.give_connection();
        let id = match self.get_db_index(path) {
            Some(id) => id,
            None => return Err("connection does not contained this db.".into())
        };
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

    pub fn show_all_table(&self, path: &str, table_name: &str)
        -> Result<Option<Vec<arrow::record_batch::RecordBatch>>, Box<dyn std::error::Error>>
    {
        let table_names = self.list_db_tables(path)?;
        let is_contained = table_names.contains(&table_name.to_string());
        if !is_contained { return Ok(None); }
        let conn = self.give_connection();
        let id = match self.get_db_index(path) {
            Some(id) => id,
            None => return Err("connection does not contained this db.".into())
        };
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
        let conn: &Connection = self.give_connection();
        let statements = split_sql_statements(&sql);

        if statements.is_empty() {
            return Err("No SQL statements provided".into());
        }

        // 最後一段用 query_arrow，其餘用 execute_batch
        for stmt in &statements[..statements.len() - 1] {
            conn.execute_batch(stmt)?;
        }

        // 執行最後一段並轉換為 Arrow RecordBatch
        let last_sql = statements.last().unwrap();
        let record_batches: Vec<arrow::record_batch::RecordBatch> = conn
            .prepare(last_sql)?
            .query_arrow([])?
            .collect();
        
        conn.execute_batch("CHECKPOINT;")?;
        if record_batches.len() == 0 { return  Ok(None); }
        Ok(Some(record_batches))
    }
}

fn split_sql_statements(sql: &str) -> Vec<&str> {
    sql.split(';')
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .collect()
}

#[cfg(test)]
mod tests {
    use crate::sql::conn::MyConnection;
    #[test]
    fn test2() -> Result<(), Box<dyn std::error::Error>>
    {
        let mut conn = MyConnection::new()?;
        let path = "C:/Users/USER/Desktop/dotnet_test/React-test/my-workspace/data/data.duckdb";
        conn.attach_db(path)?;
        let rbs = conn.table_info(path, "cells")?;
        println!("{rbs:#?}");
        Ok(())
    }
}