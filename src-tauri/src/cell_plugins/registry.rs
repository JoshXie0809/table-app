use std::collections::HashMap;
use std::sync::Arc;

use crate::cell_plugins::null_cell::NullCellPlugin;

use super::CellPlugin;
use super::text_cell::TextCellPlugin; // 引入 TextCellPlugin


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
        let type_id = plugin.get_type_id().to_string(); // 獲取插件的類型 ID
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
        
        // 當你創建更多 CellPlugin 時，你可以在這裡註冊它們
        // self.register(AnotherCellPlugin);
    }
}