use crate::sheet_plugins::base_sheet::BaseSheet;
use schemars::{generate::SchemaSettings, SchemaGenerator};
use std::fs;

pub fn export_json_schema() {
    let out_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("src")
        .join("schemas")
        .join("base_sheet.schema.json");

    let settings = SchemaSettings::draft07();
    let generator = SchemaGenerator::from(settings);

    let schema = generator.into_root_schema_for::<BaseSheet>();

    let schema_json = serde_json::to_string_pretty(&schema).expect("Failed to serialize schema");
    fs::write(out_dir, schema_json).expect("Failed to write schema to file");
}
