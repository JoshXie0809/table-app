use std::{collections::HashMap};
use duckdb::{Connection, Result};

#[derive(Debug)]
pub struct MyConnection {
    conn: duckdb::Connection,
    attach_map: HashMap<String, String>,
}

impl MyConnection {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let conn = Connection::open_in_memory()?;
        Ok( Self { conn, attach_map: HashMap::new() } )
    }

    pub fn attach_db(&mut self, path: &str, alias: &str) -> Result<(), Box<dyn std::error::Error>>
    {
        let sql = format!("attach '{path}' as {alias}");
        let conn = self.give_connection();
        conn.execute(&sql, [])?;
        conn.execute_batch("CHECKPOINT;")?;
        self.attach_map.insert(path.to_string(), alias.to_string());
        Ok(())
    }

    pub fn detach_db(&mut self, path: &str) -> Result<(), Box<dyn std::error::Error>>
    {
        let alias = match self.attach_map.get(path) {
            Some(a) => a,
            None => return Err("does not has this attached db".into())
        };
        
        let sql = format!("detach {alias};");
        let conn = self.give_connection();
        conn.execute(&sql, [])?;
        conn.execute_batch("CHECKPOINT;")?;
        self.attach_map.remove(path);
        Ok(())
    }

    fn give_connection(&self) -> &Connection {
        &self.conn
    }

    fn get_db_alias(&self, path: &str) -> Option<String>
    {
        self.attach_map.get(&path.to_string()).map(|u| u.clone())
    }

    // fn read_arrow_ipc_stream(&self, record_batches: Vec<arrow::record_batch::RecordBatch>) 
    // {
    //     let conn = self.give_connection();
    // }

    pub fn list_db(&self) -> Result<Vec<(String, Option<String>)>, Box<dyn std::error::Error>> {
        let conn = self.give_connection();
        let sql = "pragma database_list;";
        let mut stmt = conn.prepare(&sql)?;
        let mut rows = stmt.query([])?;
        let mut name_and_file_list = vec![];
        while let Some(row) =  rows.next()? {
            let name: String = row.get("name")?;
            let file: Option<String> = row.get("file")?;
            name_and_file_list.push((name, file));
        }
        conn.execute_batch("CHECKPOINT;")?;
        Ok(name_and_file_list)
    }

    pub fn list_db_tables(&self, alias: &str) -> Result<Vec<String>, Box<dyn std::error::Error>> {
        let conn = self.give_connection();
        // 取得 db 內所有的 table
        let sql = format!(
            "select table_name from information_schema.tables where table_catalog = '{}';",
            alias
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

    pub fn table_info(&self, alias: &str, table_name: &str) 
        -> Result<Option<Vec<arrow::record_batch::RecordBatch>>, Box<dyn std::error::Error>>
    {

        let conn = self.give_connection();
        let sql = format!("describe {alias}.{table_name}");
        let record_batchs: Vec<arrow::record_batch::RecordBatch> = conn
            .prepare(&sql)?
            .query_arrow([])?
            .collect();
        conn.execute_batch("CHECKPOINT;")?;
        if record_batchs.len() == 0 { return  Ok(None); }
        Ok(Some(record_batchs))
    }

    pub fn show_all_table(&self, alias: &str, table_name: &str)
        -> Result<Option<Vec<arrow::record_batch::RecordBatch>>, Box<dyn std::error::Error>>
    {
        let conn = self.give_connection();
        let sql = format!("select * from {alias}.{table_name};");
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
        conn.attach_db(path, "db")?;
        let rbs = conn.table_info(path, "cells")?;
        println!("{rbs:#?}");
        Ok(())
    }
}