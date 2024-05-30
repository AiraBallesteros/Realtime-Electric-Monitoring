import "leaflet/dist/leaflet.css";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";

import { Toaster } from "./components/ui/toaster";
import InitializeTheme from "./pages/initialize-theme";
import router from "./routes/router";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <InitializeTheme />
    <Toaster />
    <RouterProvider router={router} />
  </React.StrictMode>
);
