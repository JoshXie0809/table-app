use serde::Serialize;
use ts_rs::TS;

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ApiResponse<T>
where
    T: Serialize + TS,
{
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}
