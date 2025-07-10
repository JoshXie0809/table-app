use duckdb::{Connection, Result};

/// 執行查詢並列印每一列資料
pub fn read_duckdb(path: &str, sql: &str) -> Result<()> {
    // 開啟資料庫（如果檔案不存在會建立）
    let conn = Connection::open(path)?;

    // 執行查詢
    let mut stmt = conn.prepare(sql)?;
    let mut rows = stmt.query([])?;

    // 動態列印每一列資料
    while let Some(row) = rows.next()? {
        // 假設你查的是單欄
        let value: duckdb::types::ValueRef = row.get_ref_unwrap(4 );
        println!("Value: {:?}", value);
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_read_duckdb() -> Result<()>
    {
        read_duckdb("../data.duckdb", "select * from cells")?;
        Ok(())
    }
}
