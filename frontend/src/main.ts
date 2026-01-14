import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { App } from "./ui/App";

ReactDOM.createRoot(
  document.querySelector<HTMLDivElement>("#app") as HTMLDivElement
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
