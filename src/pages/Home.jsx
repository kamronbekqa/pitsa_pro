import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pizza, Star, Trophy, Truck } from 'lucide-react';
import './Home.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

const benefits = [
  { icon: Pizza, title: 'Asl retseptlar', desc: 'Haqiqiy Napoli uslubida tayyorlanadi.' },
  { icon: Trophy, title: 'Sifat kafolati', desc: 'Har bir pitsa yangi mahsulotlardan tayyorlanadi.' },
  { icon: Truck, title: 'Tez yetkazish', desc: 'Buyurtmangiz issiq holatda yetib boradi.' },
  { icon: Star, title: 'Ishonchli xizmat', desc: 'Mijozlarimiz buyurtmani qulay kuzatadi.' },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  const getProductImage = (image) => {
    if (!image) return '/p1.png';
    return image.startsWith('http') || image.startsWith('/')
      ? image
      : `http://127.0.0.1:8000${image}`;
  };

  useEffect(() => {
    AOS.init({ offset: 100, duration: 600, easing: "ease-in-sine" });

    fetch('http://127.0.0.1:8000/api/store/products/')
      .then(res => res.json())
      .then(data => {
        const featured = data.filter(p => p.is_featured);
        if (featured.length > 0) setFeaturedProducts(featured);
        else setFallbackSlider();
      })
      .catch(err => {
        console.error("Error fetching featured products", err);
        setFallbackSlider();
      });
  }, []);

  const setFallbackSlider = () => {
    setFeaturedProducts([
      { name: "Asl Italiya Ta'mi", description: "Haqiqiy o'tin pechida pishirilgan pitsalar!", price: 55000, image: "/p1.png" },
      { name: "Maxsus Pepperoni", description: "Ikki barobar pishloq va pepperoni.", price: 75000, image: "/p2.png" },
      { name: "30 Daqiqada Yetkazish", description: "Issiq bo'lib yetib kelmasa, pitsa bizdan sovg'a!", price: 0, image: "/p1.png" },
    ]);
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container hero-content">
          <div data-aos="fade-right" className="hero-text">
            <h1 className="hero-title">
              Italiyaning <span>asl pitsalari</span>
              <br /> uyda pishirish uchun
            </h1>
            <p className="hero-description">
              Sizga nafaqat pitsa, balki haqiqiy Italiya atmosferasini yetkazamiz. Sifatli masalliqlar, maxsus retsept va tezkor xizmat.
            </p>
            <div className="hero-buttons">
              <Link to="/menu" className="hero-button hero-button-primary">
                Hozir buyurtma berish
              </Link>
              <Link to="/about" className="hero-button hero-button-secondary">
                Biz haqimizda
              </Link>
            </div>
          </div>
          <div data-aos="zoom-in" className="hero-image-wrapper">
            <div className="hero-image-glow"></div>
            <img className="hero-image" src="/6.jpg" alt="Pitsa taom bilan" />
          </div>
        </div>
      </section>

      <section className="slider-section" data-aos="fade-up">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Eng <span>Sara</span> Takliflar</h2>
            <p className="section-subtitle">Faqat bizning mijozlar uchun maxsus</p>
          </div>

          <div className="premium-slider-container">
            <Swiper
              speed={1000}
              parallax={true}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true, dynamicBullets: true }}
              navigation={true}
              modules={[Autoplay, Pagination, Navigation]}
              className="premiumSwiper"
            >
              {featuredProducts.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className="premium-slide">
                    <div className="slide-content" data-swiper-parallax="-300">
                      <span className="slide-badge">{item.price > 0 ? "Top Tanlov" : "Tezkor"}</span>
                      <h3 className="slide-title">{item.name}</h3>
                      <p className="slide-desc">{item.description}</p>
                      <Link to="/menu" className="slide-btn">Buyurtma Berish</Link>
                    </div>
                    <div className="slide-image-container" data-swiper-parallax="-100">
                      <img
                        src={getProductImage(item.image)}
                        alt={item.name}
                        className="slide-img"
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      <section className="benefits-section">
        <div className="container">
          <h2 data-aos="fade-up" className="section-title">Nima uchun bizni tanlaysiz?</h2>
          <div className="benefits-grid">
            {benefits.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} data-aos="fade-up" data-aos-delay={index * 80} className="benefits-card">
                  <div className="icon-placeholder"><Icon size={24} /></div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
