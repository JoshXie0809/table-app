use serde::{Deserialize, Serialize};

pub struct Sheet {

}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type", content = "payload")]
pub enum Cell {
    Text {
        value: String,
        label: String,
    },

    Integer {
        value: i64,
        label: String,
    },

    Null {
        value: String,
        label: String,
    },


}