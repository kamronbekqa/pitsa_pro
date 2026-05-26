import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Bell, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import './SharedLayout.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { apiUrl } from '../api';

export default function SharedLayout() {
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead, clearNotifications } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const displayName = user?.username?.includes('@') ? user.username.split('@')[0] : user?.username;

  const getNotificationMeta = (status) => {
    if (status === 'approved' || status === 'delivering' || status === 'completed') {
      return { label: 'Tasdiqlandi', className: 'approved', Icon: CheckCircle2 };
    }
    if (status === 'cancelled') {
      return { label: 'Bekor qilindi', className: 'cancelled', Icon: XCircle };
    }
    return { label: 'Kutilmoqda', className: 'waiting', Icon: Clock3 };
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((open) => !open);
    if (!isNotificationsOpen) markAllRead();
  };

  return (
    <div className="layout-wrapper">
      <header className="header">
        <div className="container header-container">
          <Link to="/" className="header-logo">PitsaMaster</Link>
          
          <nav className="header-nav">
            <Link to="/">Bosh sahifa</Link>
            <Link to="/menu">Menyu</Link>
            <Link to="/about">Biz haqimizda</Link>
            <Link to="/offers">Chegirmalar</Link>
            <Link to="/contact">Aloqa</Link>
            <a href={apiUrl('/admin/')} target="_blank" rel="noreferrer" className="admin-nav-link">Admin</a>
            <Link to="/cart" className="header-cart-link">
              Savatcha {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </nav>
          
          <div className="header-right">
            <div className="notification-wrap">
              <button
                type="button"
                className="notification-button"
                onClick={toggleNotifications}
                aria-label="Bildirishnomalar"
                title="Bildirishnomalar"
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
              {isNotificationsOpen && (
                <div className="notification-panel">
                  <div className="notification-panel-head">
                    <strong>Bildirishnomalar</strong>
                    {notifications.length > 0 && (
                      <button type="button" onClick={clearNotifications}>Tozalash</button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="notification-empty">Hozircha notification yo'q.</p>
                  ) : (
                    <div className="notification-list">
                      {notifications.slice(0, 8).map((item) => (
                        <div key={item.id} className={`notification-item ${getNotificationMeta(item.status).className}`}>
                          {(() => {
                            const meta = getNotificationMeta(item.status);
                            const Icon = meta.Icon;
                            return (
                              <>
                                <div className="notification-item-top">
                                  <span>{item.title}</span>
                                  <strong className={`notification-status ${meta.className}`}>
                                    <Icon size={13} />
                                    {meta.label}
                                  </strong>
                                </div>
                                <p>{item.message}</p>
                                {item.status === 'cancelled' && item.cancellationReason && (
                                  <small>Sabab: {item.cancellationReason}</small>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="auth-buttons">
              {user ? (
                <>
                  <span className="user-welcome" title={user.username}>Salom, {displayName}!</span>
                  <button onClick={logout} className="auth-btn auth-login">Chiqish</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="auth-btn auth-login">Kirish</Link>
                  <Link to="/register" className="auth-btn auth-signup">Ro'yxatdan o'tish</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <p className="footer-promo-text">
              Hoziroq buyurtma bering va 10% chegirmaga ega bo'ling!
            </p>
            <div className="footer-contact-grid">
              <div className="footer-contact-item">
                <span>📞 +998 (90) 123-45-67</span>
              </div>
              <div className="footer-contact-item">
                <span>✉️ info@pitsa.uz</span>
              </div>
              <div className="footer-contact-item">
                <span>📍 Toshkent shahri, O'zbekiston</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-links">
              <Link to="/about">Biz haqimizda</Link>
              <Link to="/contact">Aloqa</Link>
              <Link to="/menu">Menyu</Link>
            </div>
            <p className="footer-copyright">
              &copy; 2025 PitsaMaster. Barcha huquqlar himoyalangan.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
