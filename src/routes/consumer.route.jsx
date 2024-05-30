import AuthConsumerLayout from "../layout/auth-consumer-layout";
import Announcement from "../pages/consumer/announcements/announcements";
import { Login } from "../pages/consumer/auth/login";
import { Register } from "../pages/consumer/auth/register";
import Consumption from "../pages/consumer/consumption/consumption";
import Dashboard from "../pages/consumer/dashboard/dashboard";
import Notifications from "../pages/consumer/notifications/notifications";
import Settings from "../pages/consumer/settings/settings";

const consumer = [
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "",
    element: <AuthConsumerLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "announcements",
        element: <Announcement />,
      },
      {
        path: "consumption",
        element: <Consumption />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
    ],
  },
];

export default consumer;
