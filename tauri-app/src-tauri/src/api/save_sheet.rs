use serde::Deserialize;
use ts_rs::TS;

use crate::api::load_sheet::ICell;


#[derive(Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SaveSheetRequest {
    pub sheet_path: String,
    pub cells: Vec<ICell>,
}