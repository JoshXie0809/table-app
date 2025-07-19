pub mod sql;

use std::error::Error;
use duckdb::{polars::{error::PolarsResult, frame::DataFrame, prelude::{AnyValue, SchemaExt}}, Connection};
use serde_json::{Value as JsonValue};

pub fn reduce_vstack(dfs: Vec<DataFrame>) -> PolarsResult<DataFrame> {
    let mut base = DataFrame::default();
    for df in dfs {
        base.vstack_mut(&df)?;
    }
    Ok(base)
}

pub fn query_all_as_polars_df(path: &str, sql: &str) -> Result<(), Box<dyn Error>> {
    let conn: Connection = Connection::open(path)?;
    let pls: Vec<DataFrame> = conn
        .prepare(sql)?
        .query_polars([])?
        .collect();

    // println!("{:#?}", pls);
    let pl = reduce_vstack(pls)?;

    for field in pl.schema().iter_fields() {
        println!("{}: {:?}", field.name(), field.dtype());
    }

    let (_, ncol) = pl.shape();
    
    
    let mut row_val = vec![];

    for i in 0..ncol {
        if let Some(av )= pl.get(i) {
            let av: Vec<JsonValue> = av.into_iter()
            .map(|av| {
                convert_any_value_to_json_value(av)
            })
            .collect();
            
            row_val.push(av);
        }
    }

    println!("{row_val:#?}");


    Ok(())
}

fn read_sqlite_via_duckdb(sqlite_path: &str, table: &str) -> Result<(), Box<dyn Error>> {
    let conn = Connection::open_in_memory()?; // 或用你自己的 .duckdb

    // ✅ 啟用 SQLite scanner
    conn.execute("INSTALL sqlite_scanner;", [])?;
    conn.execute("LOAD sqlite_scanner;", [])?;

    // ✅ 附加 SQLite 資料庫
    let attach_sql: String = format!("ATTACH '{}' AS sqlite_db (TYPE SQLITE);", sqlite_path);
    conn.execute(&attach_sql, [])?;

    // ✅ 查詢其中一個表格
    let query = format!("SELECT * FROM sqlite_db.{}  limit 1000;", table);
    let mut stmt = conn.prepare(&query)?;
    
    let pls: Vec<DataFrame> = stmt.query_polars([])?.collect();
    let pl = reduce_vstack(pls)?;
    
    println!("{pl:#?}");

    // let mask = pl.column("game")?.str()?.equal("Game1");
    // let filtered = pl.filter(&mask)?;

    let cols = ["game", "push"];
    let gb = pl.group_by(cols)?;
    
    let groups = gb.groups()?; // DataFrame, columns: "nameid", "groups"
    println!("{:#?}", groups);
    
    // let nameid_col = groups.column(col)?.str()?;
    // let idx_col: &duckdb::polars::prelude::ChunkedArray<duckdb::polars::prelude::ListType> = groups.column("groups")?.list()?; // 每一組是一個 ListChunked

    // for (maybe_name, maybe_idxs) in nameid_col.into_iter().zip(idx_col) {
    //     if let (Some(name), Some(idxs)) = (maybe_name, maybe_idxs) {
    //         // idxs 是 Series，裡面裝一個 u32 list
    //         let idxs = idxs.u32()?;
    //         let subdf = gb.df.take(idxs)?;
    //         println!("group {name:?}:\n{subdf:?}");
    //     }
    // }
    
    Ok(())
}

fn convert_any_value_to_json_value(av: AnyValue) -> JsonValue {
    match av {
        AnyValue::Null => JsonValue::Null,
        AnyValue::Boolean(b) => JsonValue::Bool(b),
        AnyValue::String(s) => JsonValue::String(s.to_string()),
        AnyValue::Int64(i) => JsonValue::from(i),
        AnyValue::Int32(i) => JsonValue::from(i),
        AnyValue::Int16(i) => JsonValue::from(i),
        AnyValue::Int8(i) => JsonValue::from(i),
        AnyValue::UInt64(u) => JsonValue::from(u),
        AnyValue::UInt32(u) => JsonValue::from(u),
        AnyValue::UInt16(u) => JsonValue::from(u),
        AnyValue::UInt8(u) => JsonValue::from(u),
        AnyValue::Float64(f) => JsonValue::from(f),
        AnyValue::Float32(f) => JsonValue::from(f),
        // 如有日期、時間戳等，可再補上
        _ => JsonValue::Null, // 其它型別暫時給 Null，實務請補齊！
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn read_pl() -> Result<(), Box<dyn Error>>
    {
        query_all_as_polars_df("../data.duckdb", "select * from cells")?;
        read_sqlite_via_duckdb("../vote.sqlite", "content_tbl")?;
        Ok(())
    }

}
