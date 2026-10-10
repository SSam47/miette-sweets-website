import React, { useState, useEffect, useRef, useCallback } from 'react';
import Lenis from '@studio-freight/lenis';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

// Icons
const InstagramIcon = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const ChevronRightIcon = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const WhatsAppIcon = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
const XIcon = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const MoonIcon = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;
const SunIcon = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;

const WHATSAPP_NUMBER = '';

// Hooks
const useReveal = (options = {}) => {
  const ref = useRef(null);
  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        currentRef.classList.add('is-visible');
      } else {
        currentRef.classList.remove('is-visible');
      }
    }, { threshold: 0.1, ...options });
    observer.observe(currentRef);
    return () => observer.disconnect();
  }, [options]);
  return ref;
};

const Reveal = ({ children, className = 'reveal', style = {} }) => {
  const ref = useReveal();
  return <div ref={ref} className={className} style={style}>{children}</div>;
};

// Custom Cursor Component
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState(''); // '' | 'view' | 'hover'

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target;
      if (target.closest('[data-cursor="view"]')) {
        setMode('view-mode');
      } else if (target.closest('a, button, [data-cursor="hover"]')) {
        setMode('hover-mode');
      } else {
        setMode('');
      }
    };
    
    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);

  return (
    <div 
      className={`custom-cursor ${mode}`} 
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      {mode === 'view-mode' && 'View'}
    </div>
  );
};

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentRoute, setCurrentRoute] = useState('home');
  const [isDark, setIsDark] = useState(false);
  const [hoverWordCoords, setHoverWordCoords] = useState(null);
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Smooth Scroll Initialization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  // Route Handling with Transition
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (hash !== currentRoute) {
        setPageTransitioning(true);
        setTimeout(() => {
          setCurrentRoute(hash);
          setPageTransitioning(false);
          window.scrollTo(0, 0);
        }, 600); // Wait for fade out
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentRoute]);

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
  };

  const heroImages = [
    '/images/pexels-valeriya-7474225.jpg',
    '/images/pexels-valeriya-7474226.jpg',
    '/images/pexels-perfect-lens-9712236.jpg'
  ];

  const videos = [
    '/Videos/miette.sweets_1788011792_3974452175486162464_310794760.mp4',
    '/Videos/miette.sweets_1788358151_3977357042600977676_310794760.mp4',
    '/Videos/miette.sweets_1788443006_3978068122486861932_310794760.mp4',
    '/Videos/miette.sweets_1789736907_3988922937398015393_310794760.mp4'
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroImages.length), 6000);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsAppClick = (e, message = "I would like to order handmade sweets.") => {
    if (!WHATSAPP_NUMBER) {
      e.preventDefault();
      alert('WhatsApp number pending. Check back soon!');
    } else if (message) {
      e.preventDefault();
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleWordHover = (e, isEnter) => {
    if (isEnter) {
      setHoverWordCoords({ x: e.clientX, y: e.clientY });
    } else {
      setHoverWordCoords(null);
    }
  };

  const handleWordMove = (e) => {
    if (hoverWordCoords) {
      setHoverWordCoords({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <>
      <CustomCursor />
      
      {/* Floating Image attached to cursor */}
      <img 
        src="/images/pexels-valeriya-7474225.jpg" 
        className={`floating-hover-image ${hoverWordCoords ? 'is-visible' : ''}`}
        style={hoverWordCoords ? { left: hoverWordCoords.x, top: hoverWordCoords.y } : {}}
        alt=""
        loading="lazy"
      />

      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: isScrolled || currentRoute !== 'home' ? 'var(--section-alt-1)' : 'transparent',
        borderBottom: isScrolled || currentRoute !== 'home' ? '1px solid rgba(100, 100, 100, 0.1)' : '1px solid transparent',
        transition: 'all 0.4s ease',
        color: isScrolled || currentRoute !== 'home' ? 'var(--text-color)' : 'var(--cream)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="#home" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 600 }}>Miette</a>
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="#home" style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Home</a>
            <a href="#creations" style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Creations</a>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'inherit' }}>
              {isDark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Page Transition Wrapper */}
      <div className={pageTransitioning ? 'page-transition-exit-active' : 'page-transition-enter-active'}>
        <main style={{ paddingTop: currentRoute !== 'home' ? '80px' : '0' }}>
          {currentRoute === 'home' ? (
            <>
              {/* Hero Section */}
              <section id="home" style={{ height: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', zIndex: 1 }}>
                {heroImages.map((src, index) => (
                  <img 
                    key={src} src={src} alt="Miette Sweets"
                    loading={index === 0 ? "eager" : "lazy"}
                    style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1,
                      opacity: currentSlide === index ? 1 : 0,
                      transition: 'opacity 2s ease-in-out, transform 10s linear',
                      transform: currentSlide === index ? 'scale(1.08)' : 'scale(1)'
                    }}
                  />
                ))}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0, 0.4)', zIndex: 2 }}></div>
                
                <Particles
                  id="tsparticles"
                  init={particlesInit}
                  options={{
                    fullScreen: { enable: false, zIndex: 1 },
                    particles: {
                      number: { value: 60, density: { enable: true, value_area: 800 } },
                      color: { value: ["#ffffff", "#FFE5EC", "#FFF2CC"] },
                      shape: { type: "circle" },
                      opacity: { value: 0.6, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
                      size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.5, sync: false } },
                      move: { enable: true, speed: 0.8, direction: "top", random: true, straight: false, out_mode: "out", bounce: false }
                    },
                    interactivity: {
                      events: { onhover: { enable: true, mode: "bubble" }, onclick: { enable: false } },
                      modes: { bubble: { distance: 200, size: 6, duration: 2, opacity: 1 } }
                    },
                    retina_detect: true,
                    background: { color: "transparent" }
                  }}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}
                />
                
                <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: '0 2rem', color: 'var(--cream)', width: '100%' }}>
                  <Reveal><p style={{ letterSpacing: '0.2em', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '2rem', fontWeight: 600 }}>HANDMADE SWEETS · MARZIPAN ART</p></Reveal>
                  <Reveal className="reveal reveal-delay-1">
                    <h1 style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', margin: 0, lineHeight: 1.4, fontStyle: 'italic', color: 'var(--espresso)', marginBottom: '2rem' }}>
                      <span style={{ display: 'inline-block', backgroundImage: 'linear-gradient(rgba(253, 227, 231, 0.6), rgba(253, 227, 231, 0.6)), url(/images/pexels-valeriya-7474226.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', padding: '0.5rem 2rem', borderRadius: '30px', backdropFilter: 'blur(5px)', marginBottom: '0.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>Small beginnings</span><br/>
                      <span style={{ display: 'inline-block', backgroundImage: 'linear-gradient(rgba(253, 227, 231, 0.6), rgba(253, 227, 231, 0.6)), url(/images/pexels-valeriya-7474226.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', padding: '0.5rem 2rem', borderRadius: '30px', backdropFilter: 'blur(5px)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>sweet stories.</span>
                    </h1>
                  </Reveal>
                  <Reveal className="reveal reveal-delay-2"><p style={{ maxWidth: '600px', margin: '0 auto 3rem', fontSize: '1.25rem', opacity: 0.9, lineHeight: 1.6 }}>Handmade sweets and marzipan art for celebrations and everyday moments.</p></Reveal>
                </div>
              </section>

              <div className="marquee-container">
                <div className="marquee-content">
                  HANDMADE SWEETS · HOMEMADE WITH CARE · DELIVERING ACROSS LEBANON · MARZIPAN ART · SMALL BEGINNINGS, SWEET STORIES ·&nbsp;
                </div>
              </div>

              {/* Story Section */}
              <section id="story" style={{ padding: '10rem 2rem', backgroundColor: 'var(--section-alt-1)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ flex: '1 1 500px', padding: '2rem', zIndex: 2 }}>
                    <Reveal><p style={{ letterSpacing: '0.15em', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 600 }}>THE MIETTE STORY</p></Reveal>
                    <Reveal className="reveal reveal-delay-1">
                      <h2 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', marginBottom: '2rem', lineHeight: 1.1, display: 'inline-block', backgroundColor: 'var(--butter)', padding: '0.5rem 1rem', borderRadius: '12px', color: 'var(--espresso)' }}>Made by hand.<br/>Remembered by heart.</h2>
                    </Reveal>
                    <Reveal className="reveal reveal-delay-2">
                      <p style={{ fontSize: '1.25rem', lineHeight: 1.8, opacity: 0.8, maxWidth: '400px' }}>
                        Miette creates handmade sweets and <span onMouseEnter={(e) => handleWordHover(e, true)} onMouseLeave={(e) => handleWordHover(e, false)} onMouseMove={handleWordMove} style={{ fontStyle: 'italic', color: 'var(--accent-color)', cursor: 'crosshair', borderBottom: '1px solid var(--accent-color)' }}>marzipan art</span> with a personal touch. Every box is made to feel personal and worth sharing.
                      </p>
                    </Reveal>
                  </div>
                  <Reveal className="reveal-scale" style={{ flex: '1 1 500px', position: 'relative' }}>
                    <div className="rotating-badge" style={{ position: 'absolute', top: '-40px', right: '-40px', width: '140px', height: '140px', zIndex: 3 }}>
                      <svg viewBox="0 0 200 200">
                        <path id="curve" d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" fill="transparent"/>
                        <text fill="var(--text-color)" fontSize="18" fontWeight="600" letterSpacing="0.1em"><textPath href="#curve" startOffset="0%">HANDMADE WITH CARE · LEBANON ·</textPath></text>
                      </svg>
                    </div>
                    <div 
                      className="shape-arch" 
                      style={{ paddingBottom: '140%', position: 'relative', cursor: 'none' }}
                      data-cursor="view"
                      onClick={() => setSelectedMedia({ src: "/Videos/miette.sweets_1790953574_3999130228707421038_310794760.mp4", label: 'Story video' })}
                    >
                      <video autoPlay muted loop playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}>
                        <source src="/Videos/miette.sweets_1790953574_3999130228707421038_310794760.mp4" type="video/mp4" />
                      </video>
                    </div>
                  </Reveal>
                </div>
              </section>

              {/* Creations Grid */}
              <section style={{ padding: '10rem 2rem', backgroundColor: 'var(--section-alt-3)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                  <Reveal>
                    <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                      <h2 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', display: 'inline-block', backgroundColor: 'var(--bg-color)', padding: '1rem 3rem', borderRadius: '100px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', color: 'var(--text-color)' }}>A little sweetness<br/>for every moment.</h2>
                    </div>
                  </Reveal>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
                    {videos.map((src, i) => (
                      <Reveal key={i} className={`reveal reveal-delay-${i % 3 + 1}`}>
                        <div data-cursor="view" onClick={() => setSelectedMedia({ src, label: 'Dessert creation' })}>
                          <div className="shape-arch" style={{ paddingBottom: '130%', position: 'relative', marginBottom: '2rem' }}>
                            <video muted loop playsInline preload="metadata" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()}><source src={src} type="video/mp4" /></video>
                          </div>
                          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Dessert Creation</h3>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>View creation</span>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </section>
              {/* Occasions Section */}
              <section id="occasions" style={{ padding: '10rem 2rem', backgroundColor: 'var(--section-alt-1)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', flexDirection: 'row-reverse' }}>
                  <div style={{ flex: '1 1 500px', padding: '2rem', zIndex: 2 }}>
                    <Reveal><p style={{ letterSpacing: '0.15em', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 600 }}>CELEBRATE</p></Reveal>
                    <Reveal className="reveal reveal-delay-1"><h2 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', marginBottom: '2rem', lineHeight: 1.1 }}>For your most<br/>special moments.</h2></Reveal>
                    <Reveal className="reveal reveal-delay-2">
                      <p style={{ fontSize: '1.25rem', lineHeight: 1.8, opacity: 0.8, maxWidth: '400px', marginBottom: '2rem' }}>
                        We craft customized sweet tables and favors for birthdays and weddings to match your event.
                      </p>
                      <a href="#" onClick={(e) => handleWhatsAppClick(e, 'I would like to ask about an upcoming event.')} className="button-secondary shape-pill">Plan an event</a>
                    </Reveal>
                  </div>
                  <Reveal className="reveal-scale" style={{ flex: '1 1 500px', position: 'relative' }}>
                    <div className="shape-arch" style={{ paddingBottom: '140%', position: 'relative' }}>
                      <img src="/images/pexels-valeriya-7474225.jpg" alt="Event setup" loading="lazy" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </Reveal>
                </div>
              </section>

              {/* Reviews Section */}
              <section id="reviews" style={{ padding: '8rem 2rem', backgroundColor: 'var(--section-alt-2)', textAlign: 'center' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                  <Reveal><h2 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', marginBottom: '4rem' }}>Kind words.</h2></Reveal>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {[
                      { text: "The marzipan pieces are detailed and taste amazing.", name: "Sarah M." },
                      { text: "The custom sweet box for my daughter's birthday was the highlight of the table.", name: "Nour K." },
                      { text: "These are the most thoughtful gifts in Lebanon. The packaging is elegant.", name: "Tariq H." }
                    ].map((review, i) => (
                      <Reveal key={i} className={`reveal reveal-delay-${i % 3 + 1}`}>
                        <div style={{ padding: '3rem 2rem', backgroundColor: 'var(--bg-color)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                          <div style={{ color: 'var(--accent-color)', fontSize: '2rem', marginBottom: '1rem', fontStyle: 'italic' }}>"</div>
                          <p style={{ fontSize: '1.1rem', fontStyle: 'italic', opacity: 0.9, marginBottom: '2rem', lineHeight: 1.6 }}>{review.text}</p>
                          <h4 style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>— {review.name}</h4>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <section id="faq" style={{ padding: '8rem 2rem', backgroundColor: 'var(--section-alt-1)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <Reveal><h2 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', textAlign: 'center', marginBottom: '4rem' }}>Questions?</h2></Reveal>
                  <div style={{ borderTop: '1px solid rgba(100,100,100,0.2)' }}>
                    {[
                      { q: 'How far in advance should I order?', a: 'For custom orders and event tables, we recommend reaching out at least 2 weeks in advance. For standard sweet boxes, 2-3 days notice is usually sufficient.' },
                      { q: 'Do you deliver outside of Adonis?', a: 'Yes, we deliver our handmade sweets across Lebanon.' },
                      { q: 'Can I customize the marzipan designs?', a: 'Yes. Every marzipan piece is handmade and customized to your event.' }
                    ].map((faq, i) => (
                      <Reveal key={i}>
                        <div style={{ borderBottom: '1px solid rgba(100,100,100,0.2)' }}>
                          <button 
                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', background: 'none', border: 'none', color: 'inherit', fontSize: '1.25rem', textAlign: 'left', fontWeight: 500 }}
                          >
                            {faq.q}
                            <span style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>+</span>
                          </button>
                          <div style={{ overflow: 'hidden', maxHeight: openFaq === i ? '200px' : '0', transition: 'max-height 0.3s ease' }}>
                            <p style={{ paddingBottom: '1.5rem', opacity: 0.8, lineHeight: 1.6 }}>{faq.a}</p>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', backgroundColor: 'var(--section-alt-1)', textAlign: 'center' }}>
              <div style={{ maxWidth: '800px' }}>
                <Reveal><h1 style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>Our creations are coming soon.</h1></Reveal>
                <Reveal className="reveal reveal-delay-1"><p style={{ fontSize: '1.25rem', opacity: 0.8, marginBottom: '3rem' }}>Miette’s handmade sweets and marzipan pieces will appear here.</p></Reveal>
                <Reveal className="reveal reveal-delay-2"><a href="#" onClick={(e) => handleWhatsAppClick(e, 'I would like to ask about a custom order.')} className="button-primary">Ask about a custom order</a></Reveal>
              </div>
            </section>
          )}

          {/* Footer */}
          <footer style={{ padding: '8rem 2rem 4rem', backgroundColor: '#1A1212', color: '#FDFBF7', textAlign: 'center' }}>
            <Reveal><h2 style={{ fontSize: 'clamp(4rem, 8vw, 7rem)', marginBottom: '4rem', lineHeight: 1 }}>Let’s make<br/>something sweet.</h2></Reveal>
            <Reveal className="reveal reveal-delay-1">
              <a href="#" onClick={(e) => handleWhatsAppClick(e, 'I would like to order handmade sweets.')} className="button-primary shape-pill" style={{ backgroundColor: 'var(--butter)', color: '#1A1212' }}>Order on WhatsApp</a>
            </Reveal>

            <Reveal className="reveal reveal-delay-2">
              <div style={{ marginTop: '6rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src="/images/miette logo.jpeg" alt="Miette Logo" loading="lazy" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', opacity: 0.9, marginBottom: '2rem' }} />
                <p style={{ fontSize: '0.85rem', opacity: 0.6, letterSpacing: '0.05em' }}>© {new Date().getFullYear()} Miette. Handmade sweets and marzipan art.</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.4, marginTop: '1rem' }}>Website by wavebuild.net</p>
              </div>
            </Reveal>
          </footer>
        </main>
      </div>

      <a href="#" onClick={(e) => handleWhatsAppClick(e, 'I would like to order handmade sweets.')} className="whatsapp-fixed" aria-label="Order on WhatsApp"><WhatsAppIcon /></a>

      {/* Scroll to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed',
          bottom: '6rem',
          right: '2rem',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-color)',
          border: '1px solid rgba(100,100,100,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'none', /* For custom cursor */
          zIndex: 90,
          opacity: isScrolled ? 1 : 0,
          transform: isScrolled ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: isScrolled ? 'auto' : 'none',
          transition: 'all 0.4s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
        aria-label="Scroll to top"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
      </button>

      {/* Modal Viewer */}
      {selectedMedia && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0, 0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }} onClick={() => setSelectedMedia(null)}>
          <button style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'white', zIndex: 1001 }} onClick={() => setSelectedMedia(null)}><XIcon size={32} /></button>
          <div className="shape-arch" style={{ width: '90%', maxWidth: '600px', backgroundColor: 'var(--bg-color)', padding: '1rem', paddingBottom: '2rem' }} onClick={e => e.stopPropagation()}>
            <video autoPlay muted loop controls playsInline style={{ width: '100%', borderRadius: '180px 180px 0 0' }}><source src={selectedMedia.src} type="video/mp4" /></video>
          </div>
        </div>
      )}
    </>
  );
}
