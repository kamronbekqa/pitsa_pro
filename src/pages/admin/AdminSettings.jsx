import React, { useState, useContext } from 'react';
import { User, Bell, Lock, Globe, Save } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import './AdminSettings.css';

const AdminSettings = () => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  const [notifSettings, setNotifSettings] = useState({
    emailOnNewOrder: true,
    emailOnNewMessage: true,
  });

  const [savedMsg, setSavedMsg] = useState('');

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotifChange = (e) => {
    const { name, checked } = e.target;
    setNotifSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavedMsg('Profile settings saved! (Changes are local only in this demo)');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setSavedMsg('Notification settings saved! (Changes are local only in this demo)');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="admin-settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">Configure your admin panel preferences</p>
      </div>

      {savedMsg && <div className="settings-success-msg">{savedMsg}</div>}

      <div className="settings-sections">

        {/* Profile Settings */}
        <section className="settings-section">
          <div className="section-header">
            <User size={20} />
            <h2 className="section-title">Profile</h2>
          </div>
          <form className="settings-form" onSubmit={handleSaveProfile}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={profileForm.username}
                  onChange={handleProfileChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className="form-input"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              Save Profile
            </button>
          </form>
        </section>

        {/* Appearance */}
        <section className="settings-section">
          <div className="section-header">
            <Globe size={20} />
            <h2 className="section-title">Appearance</h2>
          </div>
          <div className="appearance-settings">
            <div className="setting-row">
              <div className="setting-info">
                <h3 className="setting-name">Theme</h3>
                <p className="setting-desc">Switch between light and dark mode</p>
              </div>
              <button className="theme-toggle-btn" onClick={toggleTheme}>
                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-section">
          <div className="section-header">
            <Bell size={20} />
            <h2 className="section-title">Notifications</h2>
          </div>
          <form className="settings-form" onSubmit={handleSaveNotifications}>
            <div className="toggle-group">
              <label className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-label">Email on new orders</span>
                  <span className="toggle-desc">Receive an email when a new order is placed</span>
                </div>
                <input
                  type="checkbox"
                  name="emailOnNewOrder"
                  checked={notifSettings.emailOnNewOrder}
                  onChange={handleNotifChange}
                  className="toggle-checkbox"
                />
              </label>

              <label className="toggle-item">
                <div className="toggle-info">
                  <span className="toggle-label">Email on new messages</span>
                  <span className="toggle-desc">Receive an email when a customer sends a message</span>
                </div>
                <input
                  type="checkbox"
                  name="emailOnNewMessage"
                  checked={notifSettings.emailOnNewMessage}
                  onChange={handleNotifChange}
                  className="toggle-checkbox"
                />
              </label>
            </div>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              Save Notifications
            </button>
          </form>
        </section>

        {/* Security */}
        <section className="settings-section">
          <div className="section-header">
            <Lock size={20} />
            <h2 className="section-title">Security</h2>
          </div>
          <div className="security-info">
            <p>Password management is handled through the Django admin panel.</p>
            <a
              href="/api/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Open Django Admin
            </a>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminSettings;
