import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { apiUrl } from '../api';

const NotificationContext = createContext();

const storageKey = (user) => `notifications:${user?.id || 'guest'}`;

const notificationFromOrder = (order) => ({
  id: `order-${order.id}`,
  orderId: order.id,
  status: order.status,
  statusDisplay: order.status_display,
  cancellationReason: order.cancellation_reason || '',
  title: `Buyurtma #${order.id}`,
  message: order.notification_message || order.status_display || 'Buyurtma holati yangilandi.',
  createdAt: order.updated_at || order.created_at || new Date().toISOString(),
  read: false,
});

export const NotificationProvider = ({ children }) => {
  const { user, token, loading, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey(user));
    setNotifications(saved ? JSON.parse(saved) : []);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(storageKey(user), JSON.stringify(notifications));
  }, [notifications, user]);

  const mergeNotifications = (incoming) => {
    setNotifications((prev) => {
      const byId = new Map(
        prev
          .filter((item) => item.id && !/^order-\d+-/.test(item.id))
          .map((item) => [item.id, item])
      );
      incoming.forEach((item) => {
        const existing = byId.get(item.id);
        const statusChanged = existing && existing.status !== item.status;
        byId.set(item.id, existing ? { ...item, read: statusChanged ? false : existing.read } : item);
      });
      return Array.from(byId.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });
  };

  const addOrderNotification = (order) => {
    if (!order?.id) return;
    mergeNotifications([notificationFromOrder(order)]);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    if (loading || !user?.id || !token) return undefined;

    const loadOrders = async () => {
      try {
        const response = await fetch(apiUrl('/api/store/my-orders/'), {
          headers: { Authorization: `Token ${token}` },
        });
        if (response.status === 401 || response.status === 403) {
          logout();
          return;
        }
        if (!response.ok) return;
        const orders = await response.json();
        mergeNotifications(orders.map(notificationFromOrder));
      } catch (error) {
        console.error('Notificationlarni olishda xatolik:', error);
      }
    };

    loadOrders();
    const timer = window.setInterval(loadOrders, 10000);
    return () => window.clearInterval(timer);
  }, [loading, user, token, logout]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addOrderNotification,
      markAllRead,
      clearNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
