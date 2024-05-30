import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "../pages/error-page";
import admin from "./admin.route";
import consumer from "./consumer.route";

const router = createBrowserRouter([
  {
    path: "/",
    children: consumer,
    errorElement: <ErrorPage />,
  },
  {
    path: "admin",
    children: admin,
    errorElement: <ErrorPage />,
  },
]);

export default router;
