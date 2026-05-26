import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import './Cart.css';
import { apiUrl } from '../api';

export default function Cart() {
  const { cartItems, removeFromCart, clearCart, cartTotal, finalTotal, promoDiscount, setPromoDiscount, setPromoCodeId, promoCodeId } = useCart();
  const { user, token } = useAuth();
  const { addOrderNotification } = useNotifications();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');
  const [orderError, setOrderError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const pendingPromoCode = localStorage.getItem('pendingPromoCode');
    if (pendingPromoCode) {
      setPromoInput(pendingPromoCode);
      setPromoMessage(`Promo kod tayyor: ${pendingPromoCode}. Chegirmani faollashtirish uchun "Qo'llash" tugmasini bosing.`);
      localStorage.removeItem('pendingPromoCode');
    }
  }, []);

  const getApiErrorMessage = (data) => {
    const extractMessage = (value) => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' || typeof value === 'number') return String(value);
      if (Array.isArray(value)) {
        return value.map(extractMessage).filter(Boolean).join(' ');
      }
      if (typeof value === 'object') {
        return Object.entries(value)
          .map(([key, nestedValue]) => {
            const nestedMessage = extractMessage(nestedValue);
            return nestedMessage ? `${key}: ${nestedMessage}` : '';
          })
          .filter(Boolean)
          .join(' ');
      }
      return '';
    };

    const message = extractMessage(data);
    if (message.includes('Invalid pk') || message.includes('does not exist')) {
      return "Savatchadagi mahsulot ma'lumoti eskirib qolgan. Uni o'chirib, menyudan qayta qo'shing.";
    }
    if (message) return message;
    return "Xatolik yuz berdi, qayta urinib ko'ring.";
  };

  const applyPromo = async () => {
    try {
      const res = await fetch(apiUrl('/api/store/apply-promo/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput })
      });
      const data = await res.json().catch(() => null);
      if (data.valid) {
        setPromoDiscount(data.discount_percent);
        setPromoCodeId(data.id);
        setPromoMessage(`Chegirma qabul qilindi: -${data.discount_percent}%`);
      } else {
        setPromoMessage(data.error || "Promo kod yaroqsiz.");
        setPromoDiscount(0);
        setPromoCodeId(null);
      }
    } catch (e) {
      setPromoMessage('Xatolik yuz berdi.');
    }
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    setOrderError('');
    setOrderSuccess('');
    if (cartItems.length === 0) return;
    if (!user || !token) {
      setOrderError("Buyurtma berish uchun avval tizimga kiring yoki ro'yxatdan o'ting.");
      return;
    }

    const phoneRegex = /^\+998\d{9}$/;
    if (!phoneRegex.test(customerPhone)) {
      setOrderError('Telefon raqamini +998XXXXXXXXX formatida kiriting.');
      return;
    }

    const items = cartItems.map(item => ({
      product: item.product.id,
      quantity: item.quantity,
      price: item.price
    }));

    const orderData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      total_price: finalTotal,
      promo_code_used: promoCodeId,
      items: items
    };

    try {
      setIsSubmitting(true);
      const res = await fetch(apiUrl('/api/store/orders/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (res.ok) {
        setOrderSuccess("Tabriklaymiz, buyurtmangiz qabul qilindi. Tez orada adminlarimiz sizga javob qaytaradi.");
        addOrderNotification(data);
        clearCart();
        setCustomerName('');
        setCustomerPhone('');
      } else {
        setOrderError(getApiErrorMessage(data));
      }
    } catch (e) {
      setOrderError('Server bilan ulanishda xatolik.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="cart-page container">
        <h1 className="page-title">Savatcha bo'sh</h1>
        <p>Hozircha hech narsa qo'shmadingiz.</p>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1 className="page-title">Sizning <span>Savatchangiz</span></h1>

      {orderSuccess ? (
        <div className="order-success-wrap">
          <div className="order-success-message">
            <span className="order-success-kicker">Buyurtma yuborildi</span>
            <h2>{orderSuccess}</h2>
            <div className="order-success-actions">
              <Link to="/menu">Menyuga qaytish</Link>
              <Link to="/">Bosh sahifa</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-info">
                  <h3>{item.product.name}</h3>
                  <p>{item.quantity} dona x {item.price} so'm</p>
                </div>
                <button onClick={() => removeFromCart(item.product.id)} className="remove-btn">O'chirish</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Buyurtma xulosasi</h3>
            <p>Jami: {cartTotal} so'm</p>
            {promoDiscount > 0 && <p className="discount-text">Chegirma: -{promoDiscount}%</p>}
            <h2>To'lov: {finalTotal} so'm</h2>

            <div className="promo-section">
              <input type="text" placeholder="Promo kod" value={promoInput} onChange={e => setPromoInput(e.target.value)} />
              <button onClick={applyPromo}>Qo'llash</button>
              {promoMessage && <p className="promo-msg">{promoMessage}</p>}
            </div>

            <form onSubmit={submitOrder} className="order-form">
              {orderError && (
                <div className="order-error-message">
                  <p>{orderError}</p>
                  {orderError.includes('eskirib qolgan') && (
                    <button
                      type="button"
                      className="clear-stale-cart-btn"
                      onClick={() => {
                        clearCart();
                        setOrderError('');
                      }}
                    >
                      Savatchani tozalash
                    </button>
                  )}
                  {(!user || !token) && (
                    <div className="order-auth-links">
                      <Link to="/login">Kirish</Link>
                      <Link to="/register">Ro'yxatdan o'tish</Link>
                    </div>
                  )}
                </div>
              )}
              <input type="text" placeholder="Ismingiz" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
              <input type="text" placeholder="+998901234567" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
              <button type="submit" className="submit-order-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
