use std::collections::HashMap;

use schemars::{schema_for, JsonSchema};
use serde::{Deserialize, Serialize};

use crate::{cell_plugins::cell::CellContent, sheet_plugins::{base_sheet::BaseSheet, SheetPlugin}};

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct DefaultGridSheetConfig {
    #[serde(flatten)]
    pub base: BaseSheet,
    pub cells: HashMap<(u32, u32), CellContent>,
}


pub struct DefaultGridSheet;

impl SheetPlugin for DefaultGridSheet {
    fn get_type_id(&self) -> &str {
        "DefaultGridSheet"
    }

    fn get_schema(&self) -> schemars::Schema {
        schema_for!(DefaultGridSheetConfig)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use schemars::schema_for;

    #[test]
    fn test_get_schema() {
        let schema = schema_for!(DefaultGridSheetConfig); 
        println!("{}", serde_json::to_string_pretty(&schema).unwrap());
        
    }
}
