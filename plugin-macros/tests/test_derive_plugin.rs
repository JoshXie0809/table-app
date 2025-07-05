
#[cfg(test)]
mod tests {
    use plugin_macros::Plugin;

    pub trait Plugin {
        fn name(&self) -> &'static str;
    }

    #[test]
    fn test_derive_plugin() {
        #[derive(Plugin)]
        struct HelloWorld;

        let hw = HelloWorld;

        println!("{}", hw.name());

    }
}