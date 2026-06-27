import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Pizza,
  Ticket,
  Mail,
  Users,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import "./AdminSidebar.css";

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { path: "/admin/pizzas", label: "Pizzas", icon: Pizza },
    { path: "/admin/promos", label: "Promos", icon: Ticket },
    { path: "/admin/messages", label: "Messages", icon: Mail },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-badge">PM</div>
          <div>
            <div className="logo-text">PitsaMaster</div>
            <div className="logo-sub">Admin Dashboard</div>
          </div>
        </div>
        <button 
          className="sidebar-close-btn" 
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen && setIsOpen(false)}
              className={`nav-link ${isActive(item.path) ? "active" : ""}`}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-link" onClick={logout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
