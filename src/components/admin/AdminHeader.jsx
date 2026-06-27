import React, { useState, useContext } from "react";
import {
  Search,
  Bell,
  User,
  Settings,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import "./AdminHeader.css";

const AdminHeader = ({ onMenuToggle }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="admin-header">
      <div className="header-left">
        <button 
          className="menu-toggle-btn" 
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="header-actions">
        <button 
          className="icon-btn theme-switcher" 
          onClick={toggleTheme}
          aria-label="Switch theme"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button className="icon-btn notification-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="badge">2</span>
        </button>

        <div className="profile-menu">
          <button
            className="profile-btn"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="username">{user?.username}</span>
            <ChevronDown size={16} className={`chevron-icon ${profileOpen ? "open" : ""}`} />
          </button>

          {profileOpen && (
            <>
              <div className="profile-dropdown-overlay" onClick={() => setProfileOpen(false)} />
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <p className="user-name">{user?.username}</p>
                  <p className="user-email">{user?.email || "admin@pitsamaster.com"}</p>
                </div>
                <div className="dropdown-divider" />
                <a href="#profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                  <User size={16} />
                  <span>Profile</span>
                </a>
                <a href="#settings" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                  <Settings size={16} />
                  <span>Settings</span>
                </a>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item logout"
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
