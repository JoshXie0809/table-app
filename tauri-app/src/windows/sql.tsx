import React from "react";
import { createRoot } from "react-dom/client";
import { SQLApp } from "./SQLApp";


const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <SQLApp />    
    </React.StrictMode>
  );
}
