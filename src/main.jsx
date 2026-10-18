import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/main.css";
import App from "./App.jsx";
import { hydrateStore, startPersistence, store } from "./store";

/* Restore validated persisted state before first paint (no auth flash). */
hydrateStore(store);
startPersistence(store);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
