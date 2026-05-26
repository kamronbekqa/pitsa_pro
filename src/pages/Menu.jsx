import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import './Menu.css';
import AOS from 'aos';
import { useCart } from '../context/CartContext';
import { apiUrl } from '../api';

const fallbackImages = ['/p1.png', '/p2.png', '/6.jpg', '/p1.png', '/p2.png', '/6.jpg'];

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();

  const getProductImage = (product, index = 0) => {
    return fallbackImages[index % fallbackImages.length];
  };

  useEffect(() => {
    AOS.init({ offset: 100, duration: 600, easing: "ease-in-sine" });

    fetch(apiUrl('/api/store/products/'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setProducts(data);
        else setFallbackData();
      })
      .catch(err => {
        console.error("Error fetching products", err);
        setFallbackData();
      });
  }, []);

  const setFallbackData = () => {
    setProducts([
      { id: 1, name: "Margherita", description: "Klassik italiyan pitsasi: tomat va mozzarella.", price: 55000, image: "/18.png" },
      { id: 2, name: "Pepperoni", description: "Achchiq kolbasa, pishloq va maxsus sous.", price: 65000, image: "/19.png" },
      { id: 3, name: "Quattro Formaggi", description: "To'rt xil pishloq uyg'unligi.", price: 75000, image: "/20.png" },
      { id: 4, name: "Vegetarian", description: "Yangi sabzavotlar va qo'ziqorin bilan.", price: 45000, image: "/21.png" },
    ]);
  };

  const handleAddToCart = (event, product) => {
    event.stopPropagation();
    addToCart(product);
  };

  return (
    <div className="menu-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Bizning <span>Menyu</span></h1>
          <p className="page-subtitle">Eng sara va mazali pitsalar ro'yxati</p>
        </div>
      </div>

      <section className="menu-section">
        <div className="container">
          {products.length === 0 ? (
            <p style={{ textAlign: 'center' }}>Pitsalar yuklanmoqda yoki bazada yo'q...</p>
          ) : (
            <div className="menu-grid">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  data-aos="fade-up"
                  data-aos-delay={(index % 3) * 100}
                  className="product-card"
                  onClick={() => setSelectedProduct({ ...product, imageUrl: getProductImage(product, index) })}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedProduct({ ...product, imageUrl: getProductImage(product, index) });
                    }
                  }}
                >
                  <div className="product-image-wrapper">
                    <img
                      src={getProductImage(product, index)}
                      alt={product.name}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackImages[index % fallbackImages.length]; }}
                    />
                  </div>
                  <div className="product-content">
                    <div className="product-header">
                      <h3>{product.name}</h3>
                      <div className="price-tag">{product.price} so'm</div>
                    </div>
                    <p>{product.description}</p>
                    <span className="product-more-text">Batafsil ko'rish</span>
                    <button onClick={(event) => handleAddToCart(event, product)} className="product-add-button">
                      Savatga qo'shish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedProduct && (
        <div className="product-modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="product-modal-close" onClick={() => setSelectedProduct(null)} aria-label="Yopish">
              <X size={20} />
            </button>
            <div className="product-modal-image">
              <img src={selectedProduct.imageUrl} alt={selectedProduct.name} />
            </div>
            <div className="product-modal-content">
              <span className="product-modal-label">Menyu</span>
              <h2>{selectedProduct.name}</h2>
              <p>{selectedProduct.description}</p>
              <strong>{selectedProduct.price} so'm</strong>
              <button
                type="button"
                className="product-add-button"
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                Savatga qo'shish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
