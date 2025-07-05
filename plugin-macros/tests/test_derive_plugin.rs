
#[cfg(test)]
mod tests {
    use plugin_macros::Plugin;
    use plugin_core::Plugin;

    #[test]
    fn test_derive_plugin() {
        #[derive(Plugin)]
        struct HelloWorld;

        let hw = HelloWorld;

        println!("{}", hw.name());

    }
}