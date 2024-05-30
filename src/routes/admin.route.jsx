import AuthAdminLayout from "../layout/auth-admin-layout";
import Admins from "../pages/admin/admins/admins";
import CreateAdmin from "../pages/admin/admins/create-admin";
import Announcements from "../pages/admin/announcements/announcements";
import { Login } from "../pages/admin/auth/login";
import { Register } from "../pages/admin/auth/register";
import Configuration from "../pages/admin/configuration/configuration";
import Consumers from "../pages/admin/consumers/consumers";
import CreateConsumer from "../pages/admin/consumers/create-consumer";
import EditConsumer from "../pages/admin/consumers/edit-consumer";
import ViewConsumer from "../pages/admin/consumers/view-consumer";
import Dashboard from "../pages/admin/dashboard/dashboard";
import Notifications from "../pages/admin/notifications/notifications";
import Settings from "../pages/admin/settings/settings";


const admin = [
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "",
    element: <AuthAdminLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "consumers",
        element: <Consumers />,
      },
      {
        path: "consumers/create",
        element: <CreateConsumer />,
      },
      {
        path: "consumers/:id/edit",
        element: <EditConsumer />,
      },
      {
        path: "consumers/:id",
        element: <ViewConsumer />,
      },
      {
        path: "admins",
        element: <Admins />,
      },
      {
        path: "admins/:id/edit",
        element: <CreateAdmin />,
      },
      {
        path: "announcements",
        element: <Announcements />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "configuration",
        element: <Configuration />,
      },
      // {
      //   path: "notifications",
      //   element: <Notifications />,
      // },
    ],
  },
];

export default admin;
