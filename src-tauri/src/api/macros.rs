#[macro_export]
macro_rules! define_api_response {
    ($name:ident, $inner:ty, $path:expr) => {
        #[derive(Serialize, ts_rs::TS)]
        #[serde(rename_all = "camelCase")]
        #[ts(export_to = $path)]
        pub struct $name {
            pub success: bool,
            pub data: $inner,
            pub error: Option<String>,
        }
    };
}