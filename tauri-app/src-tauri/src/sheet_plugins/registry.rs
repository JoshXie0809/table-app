use std::{collections::HashMap, sync::Arc};

use super::default_grid_sheet::DefaultGridSheet;
use super::SheetPlugin;

pub struct SheetPluginRegistry {
    plugins: HashMap<String, Arc<dyn SheetPlugin>>,
}

impl SheetPluginRegistry {
    pub fn new() -> Self {
        let mut registry = Self {
            plugins: HashMap::new(),
        };

        registry.register_default_plugins();

        registry
    }

    pub fn get_plugin(&self, type_id: &str) -> Option<Arc<dyn SheetPlugin>> {
        self.plugins.get(type_id).cloned()
    }

    pub fn register<P: SheetPlugin + 'static>(&mut self, plugin: P) {
        let type_id = plugin.get_type_id().to_string();
        self.plugins.insert(type_id, Arc::new(plugin));
    }

    pub fn register_default_plugins(&mut self) {
        self.register(DefaultGridSheet);
    }
}
