import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import React from "react";
import { createRoot } from "react-dom/client";

const SQLApp = () => {
  console.log("strict hello")
  return <h1>這是 SQL 工具</h1>
};

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <FluentProvider theme={webLightTheme}>
        <SQLApp />    
      </FluentProvider>
    </React.StrictMode>
  );
}
