import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ChevronUp, Menu, X, ArrowUpRight, MessageCircle, Phone, Quote, MapPin, Clock, CreditCard, Coffee, Wifi, Gift, FileText, Car, ShieldCheck, ClipboardList, Banknote, Fuel, Gauge, Zap, Calendar, Filter, ArrowLeft, Grid3X3, SlidersHorizontal } from 'lucide-react';
import { inventory, brands } from './inventory.js';

// ==========================================
// UTILITY COMPONENTS
// ==========================================

const FadeIn = ({ children, delay = 0, className = "", direction = "up" }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const transforms = {
    up: 'translate-y-12',
    down: '-translate-y-12',
    left: 'translate-x-12',
    right: '-translate-x-12',
    scale: 'scale-95',
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : `opacity-0 ${transforms[direction]}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Parallax = ({ children, speed = 0.3, className = "" }) => {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);
  const isMobile = useRef(false);

  useEffect(() => {
    isMobile.current = window.innerWidth < 768;
    if (isMobile.current) return;
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const distanceFromCenter = rect.top + rect.height / 2 - window.innerHeight / 2;
      setOffset(distanceFromCenter * speed * -1);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      <div style={{ transform: isMobile.current ? 'none' : `translateY(${offset}px)`, willChange: isMobile.current ? 'auto' : 'transform' }}>
        {children}
      </div>
    </div>
  );
};

const TextReveal = ({ text, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={className}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <span
            className={`inline-block transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
            style={{ transitionDelay: `${delay + i * 60}ms` }}
          >{word}</span>
        </span>
      ))}
    </span>
  );
};

const Counter = ({ end, duration = 2000, suffix = '' }) => {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) { setStarted(true); observer.unobserve(entry.target); } },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - progress, 4)) * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const MagneticButton = ({ children, className = "", ...props }) => {
  const ref = useRef(null);
  const handleMouseMove = useCallback((e) => {
    if (!ref.current || 'ontouchstart' in window) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * 0.15}px, ${(e.clientY - rect.top - rect.height / 2) * 0.15}px)`;
  }, []);
  const handleMouseLeave = useCallback(() => { if (ref.current) ref.current.style.transform = 'translate(0,0)'; }, []);

  return (
    <button ref={ref} className={`transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} {...props}>
      {children}
    </button>
  );
};

const ProgressiveImage = ({ src, alt, className = "" }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${loaded ? 'img-loaded' : 'img-loading'}`}
      onLoad={() => setLoaded(true)}
      loading="lazy"
    />
  );
};

// ==========================================
// SHARED COMPONENTS
// ==========================================

const formatPrice = (price) => '$' + price.toLocaleString('en-US');

// --- Car Card (reusable) ---
const CarCard = ({ car, size = "normal" }) => {
  const isLarge = size === "large";
  return (
    <Link to={`/catalog/${car.id}`} className="group block no-underline text-white">
      <div className={`relative ${isLarge ? 'aspect-[4/3]' : 'aspect-[4/3]'} overflow-hidden bg-zinc-900 mb-3 md:mb-4`}>
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <span className="bg-white/10 backdrop-blur-md px-2.5 py-1 text-[10px] uppercase tracking-widest border border-white/20">
            {car.tag}
          </span>
        </div>
        <ProgressiveImage src={car.image} alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 z-10">
          <div className={`${isLarge ? 'text-lg md:text-2xl' : 'text-base md:text-lg'} font-light tracking-tight text-white`}>
            {formatPrice(car.price)}
          </div>
        </div>
        <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-2 md:group-hover:translate-y-0 transition-all duration-500">
          <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 text-[10px] uppercase tracking-widest border border-white/20">
            View
          </span>
        </div>
      </div>
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <h4 className="text-zinc-400 text-xs tracking-widest uppercase mb-0.5 truncate">{car.brand}</h4>
          <h3 className={`${isLarge ? 'text-lg md:text-xl' : 'text-base md:text-lg'} font-light tracking-tight font-serif truncate`}>{car.model}</h3>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="text-[10px] tracking-wider text-zinc-500 border border-zinc-800 px-2 py-0.5">{car.year}</span>
            <span className="text-[10px] tracking-wider text-zinc-500 border border-zinc-800 px-2 py-0.5">{car.power}</span>
          </div>
        </div>
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black group-hover:border-white group-hover:rotate-45 transition-all duration-500 mt-1">
          <ArrowUpRight size={14} />
        </div>
      </div>
    </Link>
  );
};

// --- Category Slider ---
const CategorySlider = ({ title, cars, brandLabel }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('.slider-card')?.offsetWidth || 300;
    el.scrollBy({ left: dir * (cardWidth + 16), behavior: 'smooth' });
  };

  if (cars.length === 0) return null;

  return (
    <FadeIn className="mb-12 md:mb-16">
      <div className="flex justify-between items-center mb-5 md:mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-serif font-medium tracking-tight">{title}</h3>
          {brandLabel && <p className="text-zinc-500 text-xs tracking-wider mt-1">{cars.length} vehicles</p>}
        </div>
        {cars.length > 3 && (
          <div className="hidden md:flex gap-2">
            <button onClick={() => scroll(-1)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer bg-transparent ${canScrollLeft ? 'border-zinc-600 text-white hover:bg-white hover:text-black hover:border-white' : 'border-zinc-800 text-zinc-700 pointer-events-none'}`}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => scroll(1)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer bg-transparent ${canScrollRight ? 'border-zinc-600 text-white hover:bg-white hover:text-black hover:border-white' : 'border-zinc-800 text-zinc-700 pointer-events-none'}`}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
      <div ref={scrollRef} className="slider-track flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 md:-mx-0 md:px-0">
        {cars.map((car) => (
          <div key={car.id} className="slider-card flex-shrink-0 w-[280px] md:w-[320px]">
            <CarCard car={car} />
          </div>
        ))}
      </div>
    </FadeIn>
  );
};

// ==========================================
// NAV COMPONENT
// ==========================================

const Nav = ({ isScrolled, showMobileCTA }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const navItems = isHome
    ? [
        { label: 'Models', href: '#models' },
        { label: 'Catalog', to: '/catalog' },
        { label: 'Philosophy', href: '#philosophy' },
        { label: 'Services', href: '#services' },
        { label: 'Contact', href: '#contact' },
      ]
    : [
        { label: 'Home', to: '/' },
        { label: 'Catalog', to: '/catalog' },
        { label: 'Contact', to: '/#contact' },
      ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled ? 'bg-black/80 backdrop-blur-xl py-3 md:py-4 border-b border-white/5' : 'bg-transparent py-4 md:py-6'
        }`}
        style={{ paddingTop: `max(env(safe-area-inset-top), ${isScrolled ? '12px' : '16px'})` }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-12 flex justify-between items-center">
          <Link to="/" onClick={isHome ? (e) => { e.preventDefault(); scrollToTop(); } : undefined}
            className="text-lg md:text-xl font-bold tracking-widest uppercase flex items-center gap-2 no-underline text-white">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse-glow" />
            D-ONE
          </Link>

          <div className="hidden md:flex space-x-8 text-sm uppercase tracking-widest text-zinc-400">
            {navItems.map((item) =>
              item.to ? (
                <Link key={item.label} to={item.to}
                  className="relative hover:text-white transition-colors duration-300 group py-2 no-underline text-zinc-400">
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full" />
                </Link>
              ) : (
                <a key={item.label} href={item.href}
                  className="relative hover:text-white transition-colors duration-300 group py-2">
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full" />
                </a>
              )
            )}
          </div>

          <MagneticButton className="hidden md:block border border-zinc-700 px-6 py-2 text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 bg-transparent cursor-pointer">
            <a href="https://t.me/donemotors" target="_blank" rel="noopener noreferrer" className="no-underline text-inherit">Enquire</a>
          </MagneticButton>

          <button className="md:hidden text-white cursor-pointer bg-transparent border-none w-11 h-11 flex items-center justify-center -mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-black z-40 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      } md:hidden`} style={{ paddingTop: 'calc(env(safe-area-inset-top) + 80px)' }}>
        <div className={`flex flex-col px-6 ${mobileMenuOpen ? 'stagger-children' : ''}`}>
          {navItems.map((item) =>
            item.to ? (
              <Link key={item.label} to={item.to}
                className="border-b border-zinc-900 py-5 text-2xl uppercase tracking-widest hover:text-zinc-400 transition-colors no-underline text-white">
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="border-b border-zinc-900 py-5 text-2xl uppercase tracking-widest hover:text-zinc-400 transition-colors">
                {item.label}
              </a>
            )
          )}
          <div className="mt-10">
            <a href="https://t.me/donemotors" target="_blank" rel="noopener noreferrer"
              className="block w-full border border-zinc-700 py-4 text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 text-white text-center no-underline">
              Enquire Now
            </a>
          </div>
          <div className="mt-6 flex gap-4">
            <a href="https://t.me/donemotors" target="_blank" rel="noopener noreferrer"
              className="flex-1 border border-zinc-800 py-3 text-center text-sm uppercase tracking-widest text-zinc-400 hover:text-white transition-colors no-underline">
              Telegram
            </a>
            <a href="tel:+998908186030"
              className="flex-1 border border-zinc-800 py-3 text-center text-sm uppercase tracking-widest text-zinc-400 hover:text-white transition-colors no-underline">
              Call Us
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

// ==========================================
// HOME PAGE
// ==========================================

const HomePage = ({ isScrolled, heroLoaded, introComplete, showBackToTop, showMobileCTA, cursorPos, scrollProgress }) => {
  const heroRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      heroRef.current.style.height = `${window.innerHeight}px`;
    }
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const stats = [
    { number: 150, suffix: '+', label: 'Vehicles Delivered' },
    { number: 16, suffix: '', label: 'Premium Brands' },
    { number: 5, suffix: '', label: 'Years of Excellence' },
    { number: 100, suffix: '%', label: 'Client Satisfaction' },
  ];

  const testimonials = [
    { name: 'Rustam A.', role: 'Business Owner', text: 'D-ONE made the entire process effortless. From selecting my Maybach to receiving it at my door, every detail was handled with precision.' },
    { name: 'Dilnoza K.', role: 'Private Collector', text: 'The level of care and transparency is unlike anything else in Tashkent. My Porsche arrived exactly as promised, immaculate condition.' },
    { name: 'Sardor M.', role: 'Entrepreneur', text: 'I have worked with importers across Central Asia. D-ONE is in a different league entirely. True white-glove service.' },
  ];

  const featuredCars = inventory.filter(c => c.featured);

  // Group cars by brand for sliders
  const mercedesCars = inventory.filter(c => ['Mercedes-Benz', 'Mercedes-AMG', 'Mercedes-Maybach'].includes(c.brand));
  const bmwCars = inventory.filter(c => c.brand === 'BMW' || c.brand === 'MINI');
  const genesisCars = inventory.filter(c => c.brand === 'Genesis' || c.brand === 'Hyundai');
  const exoticCars = inventory.filter(c => ['Porsche', 'Lamborghini'].includes(c.brand));
  const otherCars = inventory.filter(c => ['Range Rover', 'Lexus'].includes(c.brand));

  return (
    <>
      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative hero-fixed min-h-[500px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline webkit-playsinline="true"
            poster="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800"
            className="absolute inset-0 w-full h-full object-cover opacity-50">
            <source src="/videos/mercedes-hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-5 md:px-12 text-center"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 60px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}>
          <div className={`transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="flex items-center justify-center gap-3 mb-6 md:mb-10">
              <div className="w-6 md:w-12 h-px bg-white/30" />
              <span className="text-zinc-500 text-[11px] tracking-[0.3em] uppercase font-light">Est. 2020 — Tashkent</span>
              <div className="w-6 md:w-12 h-px bg-white/30" />
            </div>
          </div>
          <div className={`transition-all duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <h1 className="font-serif font-medium tracking-tight leading-[1]">
              <span className="block text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] text-gradient">Gentle</span>
              <span className="block text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] text-white"><em className="font-normal italic">Luxury.</em></span>
            </h1>
          </div>
          <div className={`transition-all duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-500 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="w-8 md:w-16 h-px bg-white/20 mx-auto mt-6 md:mt-10 mb-4 md:mb-6" />
            <p className="text-zinc-400 text-base md:text-[15px] font-light tracking-wide max-w-sm md:max-w-md mx-auto leading-relaxed">
              Curating the world's finest automobiles for Tashkent's most discerning collectors.
            </p>
          </div>
          <div className={`flex flex-col sm:flex-row items-center gap-3 md:gap-4 mt-8 md:mt-12 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-700 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <a href="#models" className="group relative bg-transparent text-white px-6 md:px-10 py-3 md:py-4 text-[11px] md:text-xs uppercase tracking-[0.2em] flex items-center gap-3 border border-white/20 overflow-hidden transition-all duration-700 hover:border-white/0 no-underline">
              <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              <span className="relative z-10 group-hover:text-black transition-colors duration-500">Explore Collection</span>
              <span className="relative z-10 w-6 h-6 md:w-7 md:h-7 rounded-full border border-white/25 group-hover:border-black/20 flex items-center justify-center group-hover:bg-black/10 transition-all duration-500">
                <ChevronRight size={13} className="group-hover:text-black transition-colors duration-500" />
              </span>
            </a>
            <a href="#contact" className="group flex items-center gap-2 px-6 md:px-10 py-3 md:py-4 text-[11px] md:text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors duration-500 no-underline">
              <Phone size={13} className="text-zinc-500 group-hover:text-white transition-colors duration-500" />
              Contact Us
            </a>
          </div>
        </div>

        <div className={`hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-3 transition-all duration-1000 delay-1000 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-[9px] tracking-[0.3em] uppercase text-zinc-600">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent animate-float" />
        </div>
      </section>

      {/* ===== BRAND MARQUEE ===== */}
      <section className="border-y border-zinc-900 bg-black py-8 md:py-12 overflow-hidden">
        <div className="flex w-full whitespace-nowrap opacity-40 hover:opacity-60 transition-opacity duration-700">
          <div className="animate-marquee flex items-center">
            {['MERCEDES-BENZ', 'PORSCHE', 'BMW', 'ROLLS-ROYCE', 'LAMBORGHINI', 'BENTLEY', 'BUGATTI', 'ASTON MARTIN',
              'LAND ROVER', 'LEXUS', 'GENESIS', 'KIA', 'HYUNDAI', 'HONDA',
              'MERCEDES-BENZ', 'PORSCHE', 'BMW', 'ROLLS-ROYCE', 'LAMBORGHINI', 'BENTLEY', 'BUGATTI', 'ASTON MARTIN',
              'LAND ROVER', 'LEXUS', 'GENESIS', 'KIA', 'HYUNDAI', 'HONDA'].map((brand, i) => (
              <React.Fragment key={i}>
                <span className="text-base md:text-2xl tracking-[0.15em] md:tracking-[0.2em] font-extralight mx-4 md:mx-10">{brand}</span>
                <span className="text-zinc-700 mx-1 md:mx-2 text-[8px]">&#9670;</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-16 md:py-28 bg-black border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
            {stats.map((stat, index) => (
              <FadeIn key={index} delay={index * 150} className="text-center md:text-left">
                <div className="text-3xl md:text-6xl font-extralight tracking-tighter mb-1 md:mb-2 font-serif">
                  <Counter end={stat.number} suffix={stat.suffix} duration={2000 + index * 300} />
                </div>
                <div className="text-zinc-500 text-[11px] md:text-sm tracking-widest uppercase leading-tight">{stat.label}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PHILOSOPHY ===== */}
      <section id="philosophy" className="py-20 md:py-48 px-5 md:px-6 bg-zinc-50 text-black relative overflow-hidden">
        <div className="absolute -top-16 -right-16 md:-top-32 md:-right-32 w-32 h-32 md:w-64 md:h-64 rounded-full bg-zinc-200/50 animate-float" />
        <div className="absolute -bottom-10 -left-10 md:-bottom-20 md:-left-20 w-20 h-20 md:w-40 md:h-40 rounded-full bg-zinc-200/30 animate-float" style={{ animationDelay: '3s' }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <FadeIn>
            <h3 className="text-zinc-400 text-xs md:text-sm tracking-[0.2em] uppercase mb-8 md:mb-12">Our Philosophy</h3>
          </FadeIn>
          <FadeIn delay={100}>
            <p className="text-xl md:text-5xl leading-snug md:leading-tight tracking-tight">
              <span className="font-serif font-normal">We do not just import cars.</span>{' '}
              <span className="font-light">We curate masterpieces of engineering.</span>
              <span className="text-zinc-400 font-light">
                {' '}Every vehicle selected by D-ONE is a testament to uncompromising quality, designed for those who recognize that true luxury whispers.
              </span>
            </p>
          </FadeIn>
          <FadeIn delay={300}>
            <div className="mt-10 md:mt-16">
              <Link to="/catalog" className="group inline-flex items-center gap-2 uppercase tracking-widest text-sm py-2 no-underline text-black">
                <span className="relative">
                  Browse our collection
                  <span className="absolute -bottom-1 left-0 w-full h-px bg-black transition-transform duration-500 origin-left group-hover:scale-x-0" />
                  <span className="absolute -bottom-1 left-0 w-full h-px bg-zinc-400 transition-transform duration-500 origin-right scale-x-0 group-hover:scale-x-100" />
                </span>
                <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== FLAGSHIP COLLECTION ===== */}
      <section id="models" className="py-20 md:py-32 bg-black px-5 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10 md:mb-16">
            <FadeIn>
              <h2 className="text-3xl md:text-6xl font-medium tracking-tighter font-serif">
                <TextReveal text="Flagship Collection." />
              </h2>
              <p className="text-zinc-500 text-sm md:text-base font-light mt-3 md:mt-4 tracking-wide">{inventory.length} vehicles in stock</p>
            </FadeIn>
            <FadeIn delay={200}>
              <Link to="/catalog" className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors no-underline border border-zinc-800 px-5 py-2.5 hover:border-zinc-600">
                View All <ArrowUpRight size={12} />
              </Link>
            </FadeIn>
          </div>

          {/* Featured 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-24">
            {featuredCars.map((car, index) => (
              <FadeIn key={car.id} delay={index * 100} direction="up">
                <CarCard car={car} size="large" />
              </FadeIn>
            ))}
          </div>

          {/* ===== BROWSE BY BRAND ===== */}
          <div className="mb-8">
            <FadeIn>
              <h3 className="text-zinc-500 text-xs tracking-[0.2em] uppercase mb-2">Browse by Brand</h3>
              <div className="w-12 h-px bg-zinc-800 mb-10" />
            </FadeIn>
          </div>

          <CategorySlider title="Mercedes-Benz" cars={mercedesCars} brandLabel />
          <CategorySlider title="BMW & MINI" cars={bmwCars} brandLabel />
          <CategorySlider title="Genesis & Hyundai" cars={genesisCars} brandLabel />
          <CategorySlider title="Porsche & Lamborghini" cars={exoticCars} brandLabel />
          <CategorySlider title="Range Rover & Lexus" cars={otherCars} brandLabel />

          {/* View Full Catalog CTA */}
          <FadeIn>
            <Link to="/catalog"
              className="block w-full border border-zinc-800 py-8 md:py-12 text-center hover:border-zinc-600 hover:bg-zinc-900/50 transition-all duration-500 no-underline text-white group">
              <p className="text-zinc-500 text-xs tracking-[0.2em] uppercase mb-3">Full Inventory</p>
              <p className="text-xl md:text-3xl font-serif font-medium tracking-tight mb-4">
                Explore All {inventory.length} Vehicles
              </p>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                Open Catalog <ArrowUpRight size={14} />
              </span>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="py-20 md:py-32 bg-white text-black px-5 md:px-12 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <FadeIn direction="up">
            <Parallax speed={0.15}>
              <div className="aspect-[4/3] md:aspect-square bg-zinc-100 relative overflow-hidden group">
                <ProgressiveImage src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80"
                  alt="White car interior"
                  className="w-full h-full object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" />
                <div className="absolute top-0 left-0 w-16 h-16">
                  <div className="absolute top-4 left-0 w-8 h-px bg-black/30" />
                  <div className="absolute top-0 left-4 w-px h-8 bg-black/30" />
                </div>
              </div>
            </Parallax>
          </FadeIn>
          <div>
            <FadeIn delay={100}>
              <h2 className="text-3xl md:text-5xl font-medium tracking-tighter mb-6 md:mb-8 font-serif">Seamless Acquisition.</h2>
            </FadeIn>
            <div className="space-y-6 md:space-y-8">
              {[
                { num: '01', title: 'Global Sourcing', desc: 'Directly importing the most sought-after specifications from Germany, UK, and South Korea, ensuring pristine condition and verifiable history.' },
                { num: '02', title: 'Concierge Handover', desc: 'Paperwork, customs clearance, and registration handled entirely by our team. You simply receive the keys to your new reality.' },
                { num: '03', title: 'Lifetime Partnership', desc: "Our relationship doesn't end at delivery. Maintenance coordination, insurance advisory, and priority access to new inventory." },
              ].map((service, i) => (
                <FadeIn key={i} delay={200 + i * 100} className="border-t border-zinc-200 pt-6 md:pt-8">
                  <div className="flex items-start gap-4 md:gap-6">
                    <span className="text-zinc-300 text-3xl md:text-5xl font-extralight leading-none shrink-0 font-serif">{service.num}</span>
                    <div>
                      <h4 className="text-base md:text-lg font-medium mb-1.5 md:mb-2">{service.title}</h4>
                      <p className="text-zinc-500 font-light text-sm md:text-base leading-relaxed">{service.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES & AMENITIES ===== */}
      <section id="features" className="py-20 md:py-32 bg-zinc-950 px-5 md:px-12 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12 md:mb-20">
              <h3 className="text-zinc-500 text-xs md:text-sm tracking-[0.2em] uppercase mb-4">Showroom</h3>
              <h2 className="text-3xl md:text-6xl font-medium tracking-tighter font-serif">Features & Amenities</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 max-w-5xl mx-auto">
            {[
              { icon: <Car size={20} />, label: 'Parking' },
              { icon: <CreditCard size={20} />, label: 'Card Payment' },
              { icon: <Banknote size={20} />, label: 'Bank Transfer' },
              { icon: <Coffee size={20} />, label: 'Cafe' },
              { icon: <Wifi size={20} />, label: 'Free Wi-Fi' },
              { icon: <ClipboardList size={20} />, label: 'Pre-Registration' },
              { icon: <ShieldCheck size={20} />, label: 'E-Passport' },
              { icon: <Gift size={20} />, label: 'Gift Certificate' },
              { icon: <FileText size={20} />, label: 'Accessible Parking' },
            ].map((feature, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="border border-zinc-800 p-3 md:p-6 flex flex-col items-center text-center gap-2 md:gap-3 hover:border-zinc-600 transition-colors duration-500 group">
                  <div className="text-zinc-500 group-hover:text-white transition-colors duration-500">{feature.icon}</div>
                  <span className="text-zinc-400 text-[9px] md:text-xs tracking-wider md:tracking-widest uppercase font-light leading-tight">{feature.label}</span>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={600}>
            <div className="mt-12 md:mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[11px] md:text-xs tracking-widest uppercase text-zinc-600">
              <span>Cash accepted</span>
              <span className="text-zinc-800">|</span>
              <span>No pets allowed</span>
              <span className="text-zinc-800">|</span>
              <span>Restroom available</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== CINEMATIC VIDEO BREAK ===== */}
      <section className="relative h-[40vh] min-h-[250px] md:h-[70vh] md:min-h-[400px] overflow-hidden">
        <video autoPlay muted loop playsInline webkit-playsinline="true"
          poster="https://images.unsplash.com/photo-1606016159991-df404e460d5b?auto=format&fit=crop&q=80&w=800"
          className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/range-rover.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-16">
          <FadeIn>
            <div className="max-w-7xl mx-auto">
              <h3 className="text-zinc-400 text-[10px] md:text-sm tracking-[0.2em] uppercase mb-2 md:mb-3">The Experience</h3>
              <p className="text-xl md:text-5xl font-serif font-medium tracking-tighter max-w-2xl leading-tight">
                Every journey should feel extraordinary.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="py-20 md:py-32 bg-zinc-950 px-5 md:px-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full border border-zinc-900/50 animate-spin-slow pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-12 md:mb-20">
              <h3 className="text-zinc-500 text-xs md:text-sm tracking-[0.2em] uppercase mb-4">Client Voices</h3>
              <h2 className="text-3xl md:text-6xl font-medium tracking-tighter font-serif">Trusted by the Discerning.</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 150} className="group">
                <div className="border border-zinc-800 p-6 md:p-8 h-full flex flex-col hover:border-zinc-600 transition-colors duration-500 relative">
                  <Quote size={20} className="text-zinc-700 mb-4 md:mb-6" />
                  <p className="text-zinc-300 font-light leading-relaxed text-sm md:text-base flex-1 italic">"{t.text}"</p>
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <div className="font-medium text-sm tracking-wide">{t.name}</div>
                    <div className="text-zinc-500 text-xs tracking-widest uppercase mt-1">{t.role}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 md:py-40 bg-black relative overflow-hidden grain-overlay">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(800px,200vw)] h-[min(800px,200vw)] rounded-full bg-gradient-to-br from-zinc-800/30 to-transparent animate-pulse-glow" />
        </div>
        <div className="max-w-4xl mx-auto text-center px-5 md:px-6 relative z-10">
          <FadeIn>
            <h2 className="text-2xl md:text-7xl font-medium tracking-tighter mb-5 md:mb-8 leading-[1.15] font-serif">
              <TextReveal text="Your Next Chapter Begins Here." />
            </h2>
          </FadeIn>
          <FadeIn delay={300}>
            <p className="text-zinc-400 text-base md:text-xl font-light max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed">
              Whether you have a specific model in mind or wish to explore possibilities, our team is ready to craft your perfect automotive experience.
            </p>
          </FadeIn>
          <FadeIn delay={500}>
            <div className="flex flex-col items-center gap-4 md:gap-6">
              <MagneticButton className="w-full md:w-auto bg-white text-black px-8 md:px-10 py-4 md:py-5 text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all duration-300 cursor-pointer border-none">
                Schedule Consultation <ArrowUpRight size={16} />
              </MagneticButton>
              <a href="tel:+998908186030" className="text-zinc-400 hover:text-white transition-colors text-sm uppercase tracking-widest py-3 no-underline">
                +998 90 818 60 30
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== MAP ===== */}
      <section className="relative">
        <FadeIn>
          <div className="map-container relative h-[250px] md:h-[450px] w-full"
            onClick={(e) => e.currentTarget.classList.add('active')}
            onTouchEnd={(e) => e.currentTarget.classList.add('active')}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.5!2d69.2502!3d41.3111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDE4JzQwLjAiTiA2OcKwMTUnMDAuNyJF!5e0!3m2!1sen!2s!4v1!5m2!1sen!2s&q=Muqimiy+Street+7+Tashkent"
              className="absolute inset-0 w-full h-full border-0 grayscale invert opacity-80"
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="D-ONE Motors Showroom Location" />
            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-12 md:right-auto z-10 bg-black/90 backdrop-blur-xl border border-zinc-800 p-4 md:p-6 md:max-w-sm">
              <h4 className="font-serif text-base md:text-xl font-medium tracking-tight mb-2 md:mb-3">Visit Our Showroom</h4>
              <address className="not-italic font-light text-zinc-300 space-y-1.5 md:space-y-2 text-[13px] md:text-sm">
                <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-zinc-500" /><span>Muqimiy Street, 7, Tashkent</span></div>
                <div className="flex items-center gap-2"><Clock size={14} className="shrink-0 text-zinc-500" /><span>Open daily until 9:00 PM</span></div>
                <div className="flex items-center gap-2"><Phone size={14} className="shrink-0 text-zinc-500" /><a href="tel:+998908186030" className="hover:text-white transition-colors">+998 90 818 60 30</a></div>
              </address>
              <a href="https://yandex.com/maps/-/CPa1NT-5" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[11px] md:text-xs uppercase tracking-widest mt-3 md:mt-4 text-zinc-400 hover:text-white transition-colors no-underline">
                Get Directions <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  );
};

// ==========================================
// CATALOG PAGE
// ==========================================

const CatalogPage = () => {
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const allBrands = useMemo(() => {
    const brandSet = [...new Set(inventory.map(c => c.brand))];
    return ['All', ...brandSet.sort()];
  }, []);

  const filteredCars = useMemo(() => {
    let cars = selectedBrand === 'All' ? [...inventory] : inventory.filter(c => c.brand === selectedBrand);
    if (sortBy === 'price-asc') cars.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') cars.sort((a, b) => b.price - a.price);
    else if (sortBy === 'newest') cars.sort((a, b) => b.year - a.year);
    return cars;
  }, [selectedBrand, sortBy]);

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-24 md:pb-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-5 md:px-12 mb-8 md:mb-12">
        <FadeIn>
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-6 no-underline">
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <h1 className="text-3xl md:text-6xl font-medium tracking-tighter font-serif mb-2">Full Catalog</h1>
          <p className="text-zinc-500 text-sm md:text-base font-light tracking-wide">{filteredCars.length} of {inventory.length} vehicles</p>
        </FadeIn>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-5 md:px-12 mb-8 md:mb-10">
        <FadeIn delay={100}>
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            {/* Brand Pills */}
            <div className="flex-1 overflow-x-auto pb-2 md:pb-0">
              <div className="flex gap-2 min-w-max">
                {allBrands.map(brand => (
                  <button key={brand} onClick={() => setSelectedBrand(brand)}
                    className={`px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs uppercase tracking-widest border transition-all duration-300 cursor-pointer whitespace-nowrap ${
                      selectedBrand === brand
                        ? 'bg-white text-black border-white'
                        : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                    }`}>
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-zinc-500" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border border-zinc-800 text-zinc-300 text-xs uppercase tracking-widest px-3 py-2 cursor-pointer focus:border-zinc-600 focus:outline-none appearance-none pr-8"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-5 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredCars.map((car, index) => (
            <FadeIn key={car.id} delay={Math.min(index * 60, 600)} direction="up">
              <CarCard car={car} />
            </FadeIn>
          ))}
        </div>

        {filteredCars.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg font-light">No vehicles found for this brand.</p>
            <button onClick={() => setSelectedBrand('All')}
              className="mt-4 text-xs uppercase tracking-widest text-white border border-zinc-700 px-6 py-2 hover:bg-white hover:text-black transition-all cursor-pointer bg-transparent">
              Show All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// CAR DETAIL PAGE
// ==========================================

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);

  const car = useMemo(() => inventory.find(c => c.id === id), [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(0);
  }, [id]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!car) return;
      if (e.key === 'ArrowRight') setActiveImage(prev => Math.min(prev + 1, car.gallery.length - 1));
      if (e.key === 'ArrowLeft') setActiveImage(prev => Math.max(prev - 1, 0));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [car]);

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-4">Vehicle Not Found</h2>
          <Link to="/catalog" className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors no-underline">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const relatedCars = inventory.filter(c => c.id !== car.id && (c.brand === car.brand || c.category === car.category)).slice(0, 6);

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      {/* Back nav */}
      <div className="max-w-7xl mx-auto px-5 md:px-12 py-4 md:py-6">
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="lg:w-[58%]">
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900 mb-3">
              <img
                src={car.gallery[activeImage]}
                alt={`${car.brand} ${car.model} - Image ${activeImage + 1}`}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              {car.gallery.length > 1 && (
                <>
                  <button onClick={() => setActiveImage(prev => Math.max(prev - 1, 0))}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer ${activeImage === 0 ? 'opacity-30 pointer-events-none' : 'hover:bg-white/20'}`}>
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setActiveImage(prev => Math.min(prev + 1, car.gallery.length - 1))}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer ${activeImage === car.gallery.length - 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-white/20'}`}>
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 text-xs tracking-wider text-white/80 border border-white/10 rounded-full">
                {activeImage + 1} / {car.gallery.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {car.gallery.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-14 overflow-hidden border-2 transition-all duration-300 cursor-pointer bg-transparent p-0 ${
                    i === activeImage ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
                  }`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:w-[42%]">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-white/10 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-widest border border-white/20">{car.tag}</span>
              <span className="text-zinc-500 text-xs tracking-wider">{car.year}</span>
            </div>

            <h2 className="text-zinc-400 text-xs tracking-[0.2em] uppercase mb-1">{car.brand}</h2>
            <h1 className="text-2xl md:text-3xl font-serif font-medium tracking-tight mb-2">{car.model}</h1>
            <div className="text-2xl md:text-3xl font-light tracking-tight mb-6 text-white">{formatPrice(car.price)}</div>

            {/* Highlight pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {car.highlights.map((h, i) => (
                <span key={i} className="border border-zinc-700 px-3 py-1.5 text-[10px] md:text-[11px] tracking-wider uppercase text-zinc-300">{h}</span>
              ))}
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: <Fuel size={15} />, label: 'Engine', value: car.engine },
                { icon: <Zap size={15} />, label: 'Power', value: car.power },
                { icon: <Gauge size={15} />, label: 'Transmission', value: car.transmission },
                { icon: <Car size={15} />, label: 'Drivetrain', value: car.drivetrain },
              ].map((spec, i) => (
                <div key={i} className="border border-zinc-800 p-3 md:p-4">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1.5">
                    {spec.icon}
                    <span className="text-[10px] tracking-widest uppercase">{spec.label}</span>
                  </div>
                  <div className="text-sm font-light text-white">{spec.value}</div>
                </div>
              ))}
            </div>

            {/* Additional specs */}
            <div className="space-y-3 mb-8 text-sm">
              {[
                { label: 'Fuel', value: car.fuel },
                { label: 'Color', value: car.color },
                { label: 'Interior', value: car.interior },
                { label: 'Mileage', value: car.mileage },
                ...(car.specs.acceleration ? [{ label: 'Acceleration', value: car.specs.acceleration }] : []),
                ...(car.specs.fuelConsumption ? [{ label: 'Fuel Consumption', value: car.specs.fuelConsumption }] : []),
                ...(car.specs.range ? [{ label: 'Range', value: car.specs.range }] : []),
              ].map((spec, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-zinc-800/50">
                  <span className="text-zinc-500">{spec.label}</span>
                  <span className="text-zinc-300">{spec.value}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h4 className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase mb-3">About This Vehicle</h4>
              <p className="text-zinc-400 text-sm font-light leading-relaxed">{car.description}</p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-3 pb-8">
              <a href="https://t.me/donemotors" target="_blank" rel="noopener noreferrer"
                className="w-full bg-white text-black py-4 text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors text-center no-underline">
                <MessageCircle size={15} /> Enquire via Telegram
              </a>
              <a href="tel:+998908186030"
                className="w-full border border-zinc-700 py-4 text-xs uppercase tracking-widest flex items-center justify-center gap-2 text-white hover:bg-white/5 transition-colors text-center no-underline">
                <Phone size={15} /> +998 90 818 60 30
              </a>
            </div>
          </div>
        </div>

        {/* Related Vehicles */}
        {relatedCars.length > 0 && (
          <div className="mt-16 md:mt-24 mb-12 md:mb-16">
            <CategorySlider title="Related Vehicles" cars={relatedCars} />
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// FOOTER
// ==========================================

const Footer = () => (
  <footer id="contact" className="bg-zinc-950 text-white pt-16 md:pt-24 pb-24 md:pb-12 px-5 md:px-12"
    style={{ paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 80px), 96px)' }}>
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mb-12 md:mb-20">
        <div>
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-medium tracking-tighter mb-4 md:mb-6 font-serif">D-ONE MOTORS</h2>
            <p className="text-zinc-500 font-light max-w-sm mb-6 md:mb-8 text-sm md:text-base leading-relaxed">
              The pinnacle of automotive import in Uzbekistan. Exclusive vehicles for exclusive individuals.
            </p>
            <a href="mailto:info@d-one-motors.uz"
              className="text-lg md:text-xl font-light hover:text-zinc-300 transition-colors group inline-flex items-center gap-2 no-underline text-white">
              info@d-one-motors.uz
              <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
            </a>
          </FadeIn>
        </div>
        <div>
          <FadeIn delay={100}>
            <h4 className="text-zinc-500 text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6">Contact</h4>
            <div className="space-y-3 text-sm md:text-base font-light text-zinc-300">
              <a href="tel:+998908186030" className="flex items-center gap-2 hover:text-white transition-colors no-underline text-zinc-300">
                <Phone size={14} className="shrink-0 text-zinc-500" /> +998 90 818 60 30
              </a>
              <div className="flex items-center gap-2"><Clock size={14} className="shrink-0 text-zinc-500" /> Open daily until 9:00 PM</div>
              <a href="https://yandex.com/maps/-/CPa1NT-5" target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-white transition-colors no-underline text-zinc-300">
                <MapPin size={14} className="mt-1 shrink-0 text-zinc-500" />
                <span>Muqimiy Street, 7<br/>Tashkent, Uzbekistan</span>
              </a>
            </div>
          </FadeIn>
        </div>
        <div>
          <FadeIn delay={200}>
            <h4 className="text-zinc-500 text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6">Navigation</h4>
            <ul className="space-y-3 md:space-y-4 font-light text-zinc-300 text-sm md:text-base list-none p-0 m-0">
              <li><Link to="/" className="group inline-flex items-center gap-2 hover:text-white transition-colors no-underline text-zinc-300">Home</Link></li>
              <li><Link to="/catalog" className="group inline-flex items-center gap-2 hover:text-white transition-colors no-underline text-zinc-300">Catalog</Link></li>
              <li><a href="https://t.me/donemotors" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 hover:text-white transition-colors no-underline text-zinc-300">Telegram <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all duration-300" /></a></li>
            </ul>
            <h4 className="text-zinc-500 text-xs md:text-sm tracking-widest uppercase mb-3 mt-8">Payment</h4>
            <div className="flex flex-wrap gap-2 text-[11px] md:text-xs text-zinc-400 font-light">
              <span className="border border-zinc-800 px-2.5 py-1 tracking-wider uppercase">Card</span>
              <span className="border border-zinc-800 px-2.5 py-1 tracking-wider uppercase">Transfer</span>
              <span className="border border-zinc-800 px-2.5 py-1 tracking-wider uppercase">Cash</span>
            </div>
          </FadeIn>
        </div>
      </div>
      <FadeIn>
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-zinc-800 pt-6 md:pt-8 text-xs md:text-sm text-zinc-600 font-light">
          <p>&copy; {new Date().getFullYear()} D-ONE MOTORS. All rights reserved.</p>
          <p className="mt-3 md:mt-0">d-one-motors.uz</p>
        </div>
      </FadeIn>
    </div>
  </footer>
);

// ==========================================
// FLOATING UI
// ==========================================

const FloatingUI = ({ showBackToTop, showMobileCTA }) => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <button onClick={scrollToTop}
        className={`fixed bottom-[72px] md:bottom-8 right-4 md:right-8 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-black flex items-center justify-center transition-all duration-500 cursor-pointer border-none shadow-lg shadow-black/20 hover:scale-110 ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? 'calc(env(safe-area-inset-bottom, 0px) + 72px)' : undefined }}
        aria-label="Back to top">
        <ChevronUp size={18} />
      </button>

      <a href="https://t.me/donemotors" target="_blank" rel="noopener noreferrer"
        className={`fixed bottom-[72px] md:bottom-8 left-4 md:left-auto md:right-24 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#2AABEE] text-white flex items-center justify-center transition-all duration-500 shadow-lg shadow-black/30 hover:scale-110 no-underline ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? 'calc(env(safe-area-inset-bottom, 0px) + 72px)' : undefined }}
        aria-label="Contact on Telegram">
        <MessageCircle size={18} />
      </a>

      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-zinc-800 transition-transform duration-500 ${
        showMobileCTA ? 'translate-y-0' : 'translate-y-full'
      }`} style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex gap-2.5 px-3 py-2.5">
          <a href="tel:+998908186030" className="flex-1 flex items-center justify-center gap-1.5 border border-zinc-700 py-2.5 text-[11px] uppercase tracking-widest text-white no-underline">
            <Phone size={13} /> Call
          </a>
          <a href="https://t.me/donemotors" target="_blank" rel="noopener noreferrer"
            className="flex-[2] bg-white text-black py-2.5 text-[11px] uppercase tracking-widest font-medium no-underline flex items-center justify-center">
            Enquire Now
          </a>
        </div>
      </div>
    </>
  );
};

// ==========================================
// MAIN APP
// ==========================================

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showMobileCTA, setShowMobileCTA] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Intro splash
  useEffect(() => {
    if (!isHome) {
      setIntroComplete(true);
      setHeroLoaded(true);
      return;
    }
    const timer = setTimeout(() => setIntroComplete(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!introComplete) return;
    const timer = setTimeout(() => setHeroLoaded(true), 200);
    return () => clearTimeout(timer);
  }, [introComplete]);

  // Scroll handlers
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 50);
      setShowBackToTop(y > 600);
      setShowMobileCTA(y > window.innerHeight * 0.8);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (y / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cursor tracking (desktop)
  useEffect(() => {
    if ('ontouchstart' in window) return;
    const handleMouseMove = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Intro Splash - only on home */}
      {isHome && !introComplete && (
        <div className="intro-screen fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
          <div className="intro-logo text-2xl md:text-4xl font-bold tracking-[0.3em] uppercase">D-ONE</div>
          <div className="intro-line w-12 h-px bg-white/60 mt-4 origin-center" />
          <div className="intro-logo text-[10px] md:text-xs tracking-[0.4em] uppercase text-zinc-500 mt-3">Motors</div>
        </div>
      )}

      {/* Scroll Progress */}
      <div className="fixed top-0 left-0 h-[2px] bg-white/80 z-[60] transition-none" style={{ width: `${scrollProgress}%` }} />

      {/* Cursor Glow (desktop) */}
      <div className="hidden md:block fixed w-64 h-64 rounded-full pointer-events-none z-[100] mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
          left: cursorPos.x - 128, top: cursorPos.y - 128,
          transition: 'left 0.15s ease-out, top 0.15s ease-out',
        }}
      />

      {/* Navigation */}
      <Nav isScrolled={isScrolled} showMobileCTA={showMobileCTA} />

      {/* Routes */}
      <Routes>
        <Route path="/" element={
          <HomePage isScrolled={isScrolled} heroLoaded={heroLoaded} introComplete={introComplete}
            showBackToTop={showBackToTop} showMobileCTA={showMobileCTA} cursorPos={cursorPos} scrollProgress={scrollProgress} />
        } />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/catalog/:id" element={<CarDetailPage />} />
      </Routes>

      {/* Footer */}
      <Footer />

      {/* Floating UI */}
      <FloatingUI showBackToTop={showBackToTop} showMobileCTA={showMobileCTA} />
    </div>
  );
}
