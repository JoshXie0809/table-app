import React from "react";
import { createRoot } from "react-dom/client";
import { EditorApp } from "./EditorApp";

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <EditorApp />
    </React.StrictMode>
  );
}