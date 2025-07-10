
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";

export const navItems = [
  {
    title: "Home",
    to: "/",
    page: <Index />,
  },
  {
    title: "Dashboard", 
    to: "/dashboard",
    page: <Dashboard />,
  },
];
