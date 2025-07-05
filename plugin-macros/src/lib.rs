use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, DeriveInput};

#[proc_macro_derive(Plugin)]
pub fn derive_plugin(input: TokenStream) -> TokenStream
{
    let ast = parse_macro_input!(input as DeriveInput);
    let name = ast.ident;

    let expanded = quote! {
        impl ::plugin_core::Plugin for #name {
            fn name(&self) -> &'static str {
                stringify!(#name)
            }
        }
    };

    expanded.into()

}
