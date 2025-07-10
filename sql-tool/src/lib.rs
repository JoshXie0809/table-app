use std::error::Error;
use duckdb::{polars::{error::{PolarsError, PolarsResult}, frame::DataFrame}, Connection};

fn reduce_vstack(mut dfs: Vec<DataFrame>) -> PolarsResult<DataFrame> {
    let mut base = dfs
        .pop()
        .ok_or_else(|| PolarsError::NoData("無資料可合併".into()))?;

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
    println!("{:#?}", pl);

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn read_pl() -> Result<(), Box<dyn Error>>
    {
        query_all_as_polars_df("../data.duckdb", "select * from cells")?;
        Ok(())
    }

}
