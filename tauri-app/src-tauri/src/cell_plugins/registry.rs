use std::collections::HashMap;
use std::sync::Arc;

use crate::cell_plugins::cell::CellMeta;

use super::null_cell::NullCellPlugin;
use super::text_cell::TextCellPlugin; // 引入 TextCellPlugin
use super::CellPlugin;

pub struct CellPluginRegistry {
    // 使用 HashMap 來儲存插件，key 是插件的 type_id，value 是 Arc<dyn CellPlugin>
    // Arc 是為了允許多個所有權，dyn CellPlugin 則允許我們儲存任何實現 CellPlugin trait 的類型
    plugins: HashMap<String, Arc<dyn CellPlugin>>,
}

impl CellPluginRegistry {
    // 構造函數，創建一個新的註冊表並自動註冊預設插件
    pub fn new() -> Self {
        let mut registry = CellPluginRegistry {
            plugins: HashMap::new(),
        };
        registry.register_default_plugins(); // 註冊預設插件，例如 TextCellPlugin
        registry
    }

    // 註冊插件的方法
    // P 必須實現 CellPlugin trait，並且是 'static 生命周期，表示它在整個程序生命週期內都是有效的

    pub fn register<P: CellPlugin + 'static>(&mut self, plugin: P) {
        let cell_config = plugin.default_cell_config();
        let cell_content = plugin
            .to_cell_content(cell_config)
            .expect("transform error in register");

        let type_id = cell_content.cell_type_id;
        self.plugins.insert(type_id, Arc::new(plugin)); // 將插件儲存到 HashMap 中
    }

    // 根據 type_id 獲取插件的方法
    pub fn get_plugin(&self, type_id: &str) -> Option<Arc<dyn CellPlugin>> {
        self.plugins.get(type_id).cloned() // 返回插件的一個克隆 (因為是 Arc，所以只是增加引用計數)
    }

    // 內部方法，用於註冊所有預設的插件
    fn register_default_plugins(&mut self) {
        self.register(TextCellPlugin); // 註冊 TextCellPlugin
        self.register(NullCellPlugin);
    }

    // fn register_custom_plugins(&mut self) {
    //     // 未來提供路徑動態讀取
    // }

    pub fn get_all_css(&self) -> HashMap<String, String> {
        let mut css_map = HashMap::new();

        for (type_id, plugin) in &self.plugins {
            css_map.insert(type_id.clone(), plugin.get_css());
        }

        css_map
    }

    pub fn get_all_cell_meta(&self) -> HashMap<String, CellMeta> {
        let mut cell_meta_map = HashMap::new();

        for (type_id, plugin) in &self.plugins {
            let cell_meta_val = plugin.get_meta();
            let cell_meta = CellMeta::from_value_to_cell_meta(cell_meta_val);
            cell_meta_map.insert(type_id.clone(), cell_meta);
        }

        cell_meta_map
    }
}
