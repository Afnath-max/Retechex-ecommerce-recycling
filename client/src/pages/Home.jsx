import React from 'react'
import { assets } from "../assets/assets";

const steps = [
  {
    id: 1,
    title: "Book E-Waste Drop-Off",
    desc: "Use our platform to register and select a location and time for e-waste deposit.",
  },
  {
    id: 2,
    title: "Drop Off Your Electronics",
    desc: "Bring the device to the chosen branch at the scheduled time.",
  },
  {
    id: 3,
    title: "Repair & Recycling",
    desc: "Our team repairs and responsibly recycles collected electronics.",
  },
  {
    id: 4,
    title: "Responsible Resell",
    desc: "Refurbished devices are listed in the Market Place to extend each device’s lifecycle.",
  },
];

/** Shared gradient */
const GRADIENT = "from-blue-500 via-indigo-500 to-teal-500";

/* ---------- Icon base & memoized icons (consistent style) ---------- */
const IconBase = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-8 w-8"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {children}
  </svg>
);

// --- IT & Telecom icons --- //
const LaptopIcon = React.memo(() => (
  <IconBase>
    <rect x="4" y="5" width="16" height="10" rx="1.8" />
    <path d="M2.5 18.5h19" />
    <path d="M8 18.5h8" />
  </IconBase>
));

const DesktopIcon = React.memo(() => (
  <IconBase>
    <rect x="3.5" y="4" width="17" height="11" rx="1.6" />
    <path d="M12 15v3M8 21h8" />
    <rect x="18" y="7.5" width="1.2" height="1.2" rx="0.3" />
  </IconBase>
));

const PhoneIcon = React.memo(() => (
  <IconBase>
    <rect x="8" y="3" width="8" height="18" rx="2" />
    <circle cx="12" cy="18.5" r="0.6" />
  </IconBase>
));

const TabletIcon = React.memo(() => (
  <IconBase>
    <rect x="5" y="4" width="14" height="16" rx="2" />
    <circle cx="12" cy="17.5" r="0.7" />
  </IconBase>
));

const ServerIcon = React.memo(() => (
  <IconBase>
    <rect x="4" y="5" width="16" height="4" rx="1" />
    <rect x="4" y="10" width="16" height="4" rx="1" />
    <rect x="4" y="15" width="16" height="4" rx="1" />
    <circle cx="7" cy="7" r="0.7" />
    <circle cx="7" cy="12" r="0.7" />
    <circle cx="7" cy="17" r="0.7" />
  </IconBase>
));

const RouterIcon = React.memo(() => (
  <IconBase>
    <rect x="5" y="15" width="14" height="4" rx="1.2" />
    <path d="M8 15V12M16 15V12" />
    <path d="M7 9.5c3-3 7-3 10 0" />
    <path d="M8.8 11c2-2 4.4-2 6.4 0" />
  </IconBase>
));

const StorageIcon = React.memo(() => (
  <IconBase>
    <rect x="5" y="6" width="14" height="12" rx="2" />
    <circle cx="9" cy="12" r="1.3" />
    <path d="M13 17.5h4" />
  </IconBase>
));

const MonitorIcon = React.memo(() => (
  <IconBase>
    <rect x="3" y="5" width="18" height="11" rx="1.6" />
    <path d="M12 16v3M8 21h8" />
  </IconBase>
));

const PrinterIcon = React.memo(() => (
  <IconBase>
    <path d="M7 8V4h10v4" />
    <rect x="4" y="9" width="16" height="7" rx="1.5" />
    <rect x="7" y="14" width="10" height="6" rx="1" />
  </IconBase>
));

const CableIcon = React.memo(() => (
  <IconBase>
    <path d="M7 7h3v4H7z" />
    <path d="M14 13c0 3-4 4-7 2" />
    <path d="M17 7h-3v4h3z" />
    <path d="M14 11c0-3 4-4 7-2" />
  </IconBase>
));

/* ---------- Data: IT & Telecom only ---------- */
const items = [
  { title: "Laptops & Notebooks", Icon: LaptopIcon, desc: "Ultrabooks, business laptops, Chromebooks, and gaming laptops." },
  { title: "Desktops & All‑in‑Ones", Icon: DesktopIcon, desc: "Towers, SFF/mini PCs, workstations, and AIO PCs." },
  { title: "Smartphones & Feature Phones", Icon: PhoneIcon, desc: "Android phones, iPhones, and legacy handsets." },
  { title: "Tablets & e‑Readers", Icon: TabletIcon, desc: "iPad, Android tablets, Kindles, and Windows slates." },
  { title: "Servers & Rack Units", Icon: ServerIcon, desc: "Rack/Blade servers, microservers, and server PSUs." },
  { title: "Networking Gear", Icon: RouterIcon, desc: "Routers, switches, modems, access points, and firewalls." },
  { title: "Storage Devices", Icon: StorageIcon, desc: "HDDs, SSDs, NVMe, NAS units, external/portable drives." },
  { title: "Monitors & Displays", Icon: MonitorIcon, desc: "LCD/LED monitors, portable displays, and docking screens." },
  { title: "Printers & Scanners", Icon: PrinterIcon, desc: "Inkjet/laser printers, MFPs, label printers, flatbed scanners." },
  { title: "Accessories & Peripherals", Icon: CableIcon, desc: "Keyboards, mice, webcams, headsets, cables, chargers, hubs." },
];


const features = [
  {
    title: "Positive Environmental Impact",
    desc:
      "Reduce e-waste in landfills and minimize the environmental footprint of electronics by participating in our circular economy model.",
    Icon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 4C10 4 6 8 6 14a6 6 0 0 0 6 6c6 0 10-4 10-14V4Z" />
        <path d="M12 20c0-4 1-8 8-12" />
      </svg>
    ),
  },
  {
    title: "Support of Repair & Reuse",
    desc:
      "We prioritize repair and reuse over recycling, extending the life of electronics and reducing resource consumption.",
    Icon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 7l3 3M3 21l6-6M10 14l-1 1" />
        <path d="M14 7a4 4 0 1 0-5.66 5.66L20 24l2-2L14 7Z" />
        <path d="M7 2v5l2 2" />
      </svg>
    ),
  },
  {
    title: "Convenient Drop-Off",
    desc:
      "With multiple locations and flexible scheduling, dropping off your e-waste has never been easier.",
    Icon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 10a6 6 0 1 1 12 0v4l2 2H4l2-2v-4Z" />
        <path d="M9 18a3 3 0 0 0 6 0" />
      </svg>
    ),
  },
];

const metrics = [
  { value: 53.6, suffix: "M", decimals: 1, label: "Tons of e-waste generated globally in 2019" },
  { value: 17.4, suffix: "%", decimals: 1, label: "Of e-waste was properly recycled in 2019" },
  { value: 40, suffix: "%", decimals: 0, label: "Reduction in carbon footprint through device refurbishment" },
  { value: 98, suffix: "%", decimals: 0, label: "Of materials recovered through our recycling process" },
];

/** Lightweight count-up that starts when visible (no libraries) */
function CountUp({ value, decimals = 0, suffix = "" }) {
  const [num, setNum] = React.useState(0);
  const ref = React.useRef(null);
  const [start, setStart] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStart(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  React.useEffect(() => {
    if (!start) return;
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setNum(value);
      return;
    }
    const duration = 1200;
    const startTs = performance.now();
    const step = (ts) => {
      const p = Math.min(1, (ts - startTs) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setNum(value * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, value]);

  const display = num.toFixed(decimals);

  // Force consistent gradient text across all browsers/cards,
  // including WebKit/Safari + short strings like "98%".
  return (
    <span
      ref={ref}
      className="inline-block leading-none"
      style={{
        backgroundImage: "linear-gradient(90deg, #2563eb 0%, #4f46e5 50%, #14b8a6 100%)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
      }}
    >
      {display}
      {suffix}
    </span>
  );
}

// Safer, theme-appropriate images + solid fallback
const FALLBACK =
  "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1400&q=80"; // neutral tech background

const news_items = [
  {
    date: "June 15, 2023",
    title: "Community E-Waste Collection Drive",
    blurb:
      "Join us for our quarterly e-waste collection event at Downtown Center on June 25th.",
    href: "/news/collection-drive",
    img:
      "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1400&q=80", // workbench/repair scene fits e-waste drop
  },
  {
    date: "June 8, 2023",
    title: "Free Device Repair Workshop",
    blurb:
      "Learn basic repair skills at our free workshop on July 2nd. Spaces are limited.",
    href: "/news/repair-workshop",
    img:
      "https://images.unsplash.com/photo-1581092919554-1b7b1f1b6d6e?auto=format&fit=crop&w=1400&q=80", // close-up repair/pcb
  },
  {
    date: "May 30, 2023",
    title: "New Drop-Off Location Opening",
    blurb:
      "We’re excited to announce our new Northside drop-off location opening June 15th.",
    href: "/news/new-location",
    img:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1400&q=80", // modern office/space
  },
  {
    date: "May 10, 2023",
    title: "Refurbished Laptops for Schools",
    blurb:
      "100+ devices refurbished and donated to local schools through our Reuse Program.",
    href: "/news/school-donation",
    img:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=80", // classroom/laptops
  },
  {
    date: "Apr 18, 2023",
    title: "Circular Economy Webinar",
    blurb:
      "Experts discuss how reuse & recycling reduce environmental footprint. Watch on demand.",
    href: "/news/circular-webinar",
    img:
      "https://images.unsplash.com/photo-1515165562835-c3b8c2e0b07d?auto=format&fit=crop&w=1400&q=80", // stage/webinar vibe
  },
  {
    date: "Mar 29, 2023",
    title: "Battery Safety Guidelines Updated",
    blurb:
      "New safe-handling rules for lithium-ion batteries and chargers—read the update.",
    href: "/news/battery-guidelines",
    img:
      "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1400&q=80", // batteries close-up
  },
];

const cards = [
  {
    title: "FAQs",
    desc:
      "Find answers to commonly asked questions about our services, processes, and policies.",
    cta: "View FAQs",
    href: "/faqs",
    Icon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a3 3 0 1 1 3.8 2.9c-.9.3-1.3.9-1.3 1.6v.5" />
        <circle cx="12" cy="17" r="1" />
      </svg>
    ),
  },
  {
    title: "Contact Us",
    desc:
      "Can’t find what you’re looking for? Reach out to our support team for assistance.",
    cta: "Contact Form",
    href: "/contact",
    Icon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    ),
  },
  {
    title: "Testimonials",
    desc:
      "Read stories from our community members and learn about their experiences with ReTechExchange.",
    cta: "View Stories",
    href: "/testimonials",
    Icon: () => (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 16l-3 3V7a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
        <path d="M9 20h8l3 3v-8a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v1" />
      </svg>
    ),
  },
];

const Home = () => {

  const trackRef = React.useRef(null);
  
    const scrollByCards = (dir) => {
      const el = trackRef.current;
      if (!el) return;
      const step = el.clientWidth * 0.9;
      el.scrollBy({ left: dir * step, behavior: "smooth" });
    };
  
    const onImgError = (e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = FALLBACK;
    };

  

  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden">
      {/* ====== Background Shapes ====== */}
      
      <header
            id="hero"
            className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-400 text-white"
          >
            {/* soft accents */}
            <div aria-hidden className="absolute -top-10 -right-10 h-56 w-56 sm:h-72 sm:w-72 md:h-96 md:w-96 rounded-full bg-emerald-300/60 blur-2xl -z-10" />
            <div aria-hidden className="absolute -bottom-24 left-1/3 h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-white/10 blur-3xl -z-10" />
      
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 md:py-20">
              <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
                {/* Left */}
                <div className="space-y-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/25 backdrop-blur">
                    ♻️ Sustainable • Secure • Hassle-free
                  </span>
      
                  <h1 className="text-3xl sm:text-4xl lg:text-6xl font-semibold leading-tight">
                    Your Electronic Waste Responsibly Managed <br className="hidden md:block" />
                    & Repurposed
                  </h1>
      
                  <p className="text-sm sm:text-base text-white/85 max-w-xl">
                    We collect, sanitize and refurbish electronics so nothing ends up in landfills—while usable devices find a new home in our marketplace.
                  </p>
      
                  {/* SINGLE CTA */}
                  <div>
                    <a
                      href="/market-place"
                      className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full
                                 bg-white/10 px-6 sm:px-8 py-3 text-sm font-semibold text-white
                                 ring-1 ring-inset ring-white/40 backdrop-blur
                                 hover:bg-white hover:text-gray-900 hover:ring-transparent transition"
                    >
                      Browse Marketplace
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full
                                   bg-white/20 ring-1 ring-inset ring-white/40
                                   group-hover:bg-gray-900/10 group-hover:ring-gray-900/15 transition"
                      >
                        <img
                          className="w-3 translate-x-0 group-hover:translate-x-1 transition-transform"
                          src={assets.arrow_icon}
                          alt=""
                        />
                      </span>
                    </a>
                  </div>
      
                  {/* TRUST STATS — centered on mobile, left on md+ */}
                  <div
                    className="
                      mt-4
                      rounded-2xl bg-white/5 ring-1 ring-white/15 backdrop-blur
                      px-4 py-3
                      md:bg-transparent md:ring-0 md:px-0 md:py-0
                    "
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center md:justify-start">
                      <div className="text-center md:text-left">
                        <div className="text-2xl font-semibold leading-none">12k+</div>
                        <div className="text-xs text-white/75">kg e-waste diverted</div>
                      </div>
      
                      {/* divider only from md+ */}
                      <div className="hidden md:block h-8 w-px bg-white/25" />
      
                      <div className="text-center md:text-left">
                        <div className="text-2xl font-semibold leading-none">4.9★</div>
                        <div className="text-xs text-white/75">Customer rating</div>
                      </div>
                    </div>
                  </div>
                </div>
      
                {/* Right */}
                <div className="relative md:pl-6">
                  <div className="relative mx-auto w-full max-w-xs sm:max-w-md lg:max-w-xl">
                    <img
                      src={assets.pic1}
                      alt="Green planet with recycling arrows"
                      className="w-full h-auto rounded-xl object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,.35)]"
                    />
                    <div aria-hidden className="absolute -inset-x-8 -bottom-10 h-24 rounded-full bg-black/25 blur-3xl" />
                  </div>
                </div>
              </div>
            </div>
          </header>
      <section id="dropoff" className="relative isolate overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 md:py-20">
              <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-16">
                
                {/* Left visual — balanced */}
                <div className="order-2 md:order-1 flex justify-center md:justify-end">
                  <figure
                    className="
                      relative isolate
                      w-[clamp(240px,75vw,480px)] lg:w-[clamp(340px,40vw,540px)]
                      aspect-square
                    "
                  >
                    {/* subtle glow halo */}
                    <div
                      aria-hidden
                      className="absolute -inset-4 rounded-[46%] bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-400/15 blur-2xl -z-10"
                    />
                    {/* main gradient blob */}
                    <div
                      aria-hidden
                      className="absolute inset-0 rounded-[46%] bg-gradient-to-tr from-blue-500 via-indigo-500 to-teal-500 shadow-[0_12px_32px_rgba(59,130,246,.25)]"
                    />
                    {/* inner ring */}
                    <div
                      aria-hidden
                      className="absolute inset-3 rounded-[46%] ring-4 ring-indigo-400/15"
                    />
                    {/* centered image */}
                    <img
                      src={assets?.pic2 || assets?.pic1 || ""}
                      alt="Responsible e-waste recycling"
                      className="
                        absolute inset-0 m-auto
                        h-[72%] w-[72%] sm:h-[76%] sm:w-[76%] lg:h-[78%] lg:w-[78%]
                        object-contain drop-shadow-md
                      "
                    />
                  </figure>
                </div>
      
                {/* Right content */}
                <div className="order-1 md:order-2 text-center md:text-left">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight">
                    Proper E-Waste Drop-off Is An Important Part Of Environmental Sustainability
                  </h2>
      
                  <p className="mt-4 sm:mt-5 text-gray-600 leading-relaxed max-w-2xl md:max-w-none mx-auto md:mx-0">
                    We handle electronic waste responsibly and securely, reducing environmental impact while
                    promoting circular economy principles. Pre-book a slot so our team is ready to process your
                    items efficiently.
                  </p>
      
                  {/* CTAs */}
                  <div className="mt-6 sm:mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:max-w-md mx-auto md:mx-0">
                    {/* Gradient button */}
                    <a
                      href="/appointment"
                      aria-label="Book a drop-off appointment"
                      className="group relative inline-flex items-center justify-center h-12 sm:h-14 w-full
                                 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-teal-500
                                 text-white font-semibold shadow-lg ring-1 ring-indigo-800/20
                                 transition transform hover:-translate-y-0.5 hover:shadow-xl
                                 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200
                                 whitespace-nowrap"
                    >
                      {/* shine sweep */}
                      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                        <span
                          className="absolute inset-y-0 left-[-30%] w-1/3 rotate-12
                                     bg-white/30 blur-md opacity-0
                                     group-hover:opacity-100 group-hover:left-[120%]
                                     transition-all duration-700"
                        />
                      </span>
      
                      <span className="relative">Drop-Off</span>
                      <span
                        className="relative ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full
                                   bg-white/25 ring-1 ring-white/30 backdrop-blur-sm
                                   transition-all group-hover:translate-x-1"
                      >
                        <img className="w-3" src={assets?.arrow_icon} alt="" />
                      </span>
                    </a>
      
                    {/* Watch Video button */}
                    <a
                      href="/video"
                      className="group relative overflow-hidden inline-flex items-center justify-center h-12 sm:h-14 w-full
                                 rounded-full ring-1 ring-gray-300 text-gray-900 bg-white/0 transition
                                 hover:ring-indigo-400 whitespace-nowrap"
                    >
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/0 to-gray-900/0
                                        group-hover:from-indigo-50 group-hover:to-blue-50 transition" />
                      <span className="relative mr-3">
                        <span
                          className="pointer-events-none absolute inset-0 rounded-full bg-indigo-300/30 opacity-0
                                     group-hover:opacity-100 group-hover:animate-ping"
                        />
                        <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full
                                         bg-indigo-600 text-white transition transform group-hover:scale-110 group-hover:shadow-lg">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 translate-x-[1px]">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </span>
                      <span className="relative z-10 font-semibold">Watch Video</span>
                    </a>
                  </div>
      
                  {/* Steps */}
                  <ol className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-3xl mx-auto md:mx-0">
                    {["Book a Slot", "Drop Off Securely", "Earn Rewards"].map((title, i) => (
                      <li
                        key={i}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200/80 bg-white/70 p-4 sm:p-5 backdrop-blur shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-300/70"
                      >
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        />
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-3">
                            {i + 1}
                          </span>
                          <p className="font-semibold text-gray-900">{title}</p>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 text-center sm:text-left transition-colors duration-300 group-hover:text-gray-700">
                          {i === 0
                            ? "Choose a date & time that works for you."
                            : i === 1
                            ? "Sanitized handling with chain-of-custody."
                            : "Get credits when devices are refurbished."}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </section>
      <section
      id="how-it-works"
      className="relative isolate overflow-hidden"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        {/* Heading */}
        <div className="text-center">
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900"
          >
            How It Works
          </h2>
          {/* gradient underline */}
          <span className="mt-4 inline-block h-1 w-24 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-500" />
        </div>

        {/* Timeline wrapper */}
        <div className="relative mt-10 sm:mt-14">
          {/* connector line */}

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 relative">
            {steps.map((s, idx) => (
              <article
                key={s.id}
                className="relative rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-200 shadow-md 
                           hover:shadow-xl hover:border-transparent hover:bg-gradient-to-br hover:from-blue-50 hover:via-indigo-50 hover:to-teal-50 
                           transition-all duration-300 group"
              >
                <div className="p-6 sm:p-7">
                  {/* number badge */}
                  <div className="mx-auto -mt-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full
                                  bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-600 text-white font-bold text-xl
                                  shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 md:mx-0">
                    {s.id}
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 text-center md:text-left group-hover:text-indigo-700">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-slate-600 text-center md:text-left group-hover:text-slate-800">
                    {s.desc}
                  </p>
                </div>

                {/* connector stub (skip for first card) */}
                {idx > 0 && (
                  <span
                    aria-hidden
                    className="hidden md:block absolute top-1/2 -translate-y-1/2 h-[3px] w-10 left-[-2.5rem] 
                               bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-500"
                  />
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
      <section
      id="accepted-items"
      className="relative isolate overflow-hidden"
      aria-labelledby="accepted-items-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        {/* Heading */}
        <div className="text-center">
          <h2
            id="accepted-items-heading"
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900"
          >
            Accepted IT & Telecom Items
          </h2>
          <span className={`mt-4 inline-block h-1 w-28 rounded-full bg-gradient-to-r ${GRADIENT}`} />
        </div>

        {/* Grid */}
        <div className="mt-10 sm:mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 items-stretch">
          {items.map(({ title, Icon, desc }) => (
            <article key={title} className="group min-w-0 h-full">
              {/* Gradient border wrapper */}
              <div
                className={`
                  h-full rounded-3xl p-[1.5px]
                  bg-gradient-to-br from-blue-500/35 via-indigo-500/35 to-teal-500/35
                  transition-colors duration-300
                  group-hover:from-blue-500/70 group-hover:via-indigo-500/70 group-hover:to-teal-500/70
                  transform-gpu
                `}
              >
                {/* Real card */}
                <div
                  className={`
                    h-full rounded-[calc(theme(borderRadius.3xl)-2px)]
                    bg-white/80 backdrop-blur-sm ring-1 ring-slate-200
                    shadow-[0_6px_16px_rgba(15,23,42,0.06)]
                    p-5 sm:p-6
                    flex flex-col
                    transition-transform duration-300
                    hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.10)]
                  `}
                >
                  {/* Icon chip with gradient ring */}
                  <div className="mb-4 inline-flex items-center justify-center">
                    <span className="rounded-2xl p-[2px] bg-gradient-to-br from-blue-500/30 via-indigo-500/30 to-teal-500/30">
                      <span className="flex h-14 w-14 items-center justify-center rounded-[calc(theme(borderRadius.xl)-2px)] bg-white ring-1 ring-slate-200 text-slate-700 group-hover:text-slate-900 transition-colors">
                        <Icon />
                      </span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[15px] sm:text-base font-semibold text-slate-900">
                    <span className={`transition-colors group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${GRADIENT}`}>
                      {title}
                    </span>
                  </h3>

                  {/* Description */}
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">{desc}</p>

                  {/* Spacer to push bottom accent to the bottom so heights match */}
                  <div className="flex-1" />

                  {/* Bottom accent */}
                  <span
                    aria-hidden
                    className={`block mt-4 h-[3px] rounded-full bg-gradient-to-r ${GRADIENT} scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300`}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Note */}
        <div className="mt-8 text-center text-xs sm:text-sm text-slate-500">
          Not sure about an item?{" "}
          <a href="/contact" className={`font-semibold bg-gradient-to-r ${GRADIENT} bg-clip-text text-transparent`}>
            Contact our team
          </a>
          .
        </div>
      </div>
    </section>
      <section id="why-choose" className="relative isolate overflow-hidden" aria-labelledby="why-choose-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        {/* Heading */}
        <div className="text-center">
          <h2 id="why-choose-heading" className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Why Choose ReTechExchange?
          </h2>
        </div>
        <span className="mt-4 mx-auto block h-1 w-28 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-500" />

        {/* Cards — equal heights */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch gap-5 sm:gap-6 lg:gap-8">
          {features.map(({ title, desc, Icon }) => (
            <article
              key={title}
              className="group h-full relative rounded-3xl transition-all duration-300 will-change-transform hover:-translate-y-1 hover:shadow-xl"
            >
              {/* gradient border wrapper */}
              <div className={`h-full rounded-3xl p-[1px] bg-gradient-to-br ${GRADIENT} opacity-90`}>
                {/* card */}
                <div className="h-full relative rounded-[calc(theme(borderRadius.3xl)-1px)] bg-white/95 backdrop-blur-sm border border-slate-200/70 shadow-[0_8px_24px_rgba(15,23,42,0.06)] overflow-hidden flex flex-col">
                  {/* sheen */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-white/50 blur-md opacity-0
                               transition-all duration-700 group-hover:left-[120%] group-hover:opacity-60"
                  />
                  {/* content */}
                  <div className="relative p-6 sm:p-8 flex-1 pb-12">
                    <div
                      className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl
                                  text-white bg-gradient-to-br ${GRADIENT} shadow-md
                                  transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon />
                    </div>

                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">{title}</h3>
                    <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-slate-600">{desc}</p>
                  </div>

                  {/* bottom accent pinned to bottom */}
                  <span
                    aria-hidden
                    className={`absolute left-6 right-6 bottom-4 h-[3px] rounded-full bg-gradient-to-r ${GRADIENT}
                                transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100`}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
      <section
      id="edu-impact"
      className="relative isolate overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50"
      aria-labelledby="edu-impact-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        {/* Section heading */}
        <div className="text-center">
          <h2
            id="edu-impact-heading"
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900"
          >
            Educational & Impact
          </h2>
          <span className="mt-4 inline-block h-1 w-28 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-500" />
        </div>

        {/* Content */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left: education copy */}
          <article className="rounded-3xl bg-white/80 backdrop-blur-sm ring-1 ring-slate-200 p-6 sm:p-8 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">
              The Importance of Proper E-Waste Disposal
            </h3>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Electronic waste contains hazardous materials like lead, mercury, and cadmium that can leach into soil
              and water, posing serious environmental and health risks. Proper recycling prevents these toxins from
              entering our ecosystem.
            </p>
            <p className="mt-3 text-slate-600 leading-relaxed">
              By choosing to repair and resell electronics, we conserve valuable resources, reduce energy consumption,
              and decrease greenhouse gas emissions associated with manufacturing new products.
            </p>
            <p className="mt-3 text-slate-600 leading-relaxed">
              ReTechExchange ensures that every device is handled responsibly, with data security and environmental
              protection as our top priorities.
            </p>
            {/* small gradient accent */}
            <span
              aria-hidden
              className="mt-5 inline-block h-[3px] w-32 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-500"
            />
          </article>

          {/* Right: metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6 items-stretch">
            {metrics.map(({ value, suffix, decimals, label }) => (
              <div
                key={label}
                className={`group h-full rounded-3xl p-[1px] bg-gradient-to-br ${GRADIENT} opacity-95`}
              >
                <div className="h-full rounded-[calc(theme(borderRadius.3xl)-1px)] bg-white p-6 sm:p-7 flex flex-col justify-center text-center ring-1 ring-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    <CountUp value={value} suffix={suffix} decimals={decimals} />
                  </div>
                  <p className="mt-2 text-slate-600 leading-relaxed">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Soft corner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full blur-3xl opacity-30 bg-gradient-to-tr from-blue-300 via-indigo-300 to-teal-300"
      />
    </section>
      <section id="news" className="relative isolate overflow-hidden" aria-labelledby="news-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        {/* Heading */}
        <div className="text-center">
          <h2 id="news-heading" className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            News & Events
          </h2>
          <span className={`mt-4 inline-block h-1 w-28 rounded-full bg-gradient-to-r ${GRADIENT}`} />
        </div>

        {/* Carousel */}
        <div className="relative mt-10 sm:mt-12">
          {/* Scrollable track */}
          <div
            ref={trackRef}
            className="
              flex gap-6 lg:gap-8 overflow-x-auto pb-2
              snap-x snap-mandatory scroll-smooth
              [scrollbar-width:none] [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden
            "
            style={{ scrollbarWidth: "none" }}
            onWheel={(e) => {
              if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                trackRef.current?.scrollBy({ left: e.deltaY, behavior: "smooth" });
              }
            }}
          >
            {/* side padders */}
            <div aria-hidden className="shrink-0 basis-[5%]" />
            {news_items.map((it, i) => (
              <article
                key={i}
                className="
                  group shrink-0 snap-start
                  basis-[85%] sm:basis-[60%] md:basis-[48%] lg:basis-[32%]
                  rounded-3xl bg-white ring-1 ring-slate-200
                  shadow-[0_8px_24px_rgba(15,23,42,0.08)]
                  overflow-hidden transition-transform duration-300
                  motion-safe:hover:-translate-y-1
                  flex flex-col
                "
              >
                {/* image */}
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img
                    src={it.img}
                    alt={it.title}
                    onError={onImgError}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <span aria-hidden className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${GRADIENT}`} />
                </div>

                {/* body: grid/flex so CTA stays bottom with consistent spacing */}
                <div className="flex-1 p-6 sm:p-7 flex flex-col">
                  <p className="text-sm text-slate-500">{it.date}</p>
                  <h3 className="mt-2 text-lg sm:text-xl font-semibold text-slate-900">{it.title}</h3>
                  <p className="mt-2 text-slate-600 leading-relaxed">{it.blurb}</p>

                  {/* spacer keeps buttons aligned while preserving a tight, consistent gap */}
                  <div className="flex-1" />

                  <a
                    href={it.href}
                    className={`
                      mt-4 inline-flex items-center justify-center px-5 h-11 rounded-full
                      font-semibold text-slate-900
                      ring-2 ring-blue-500/70 hover:ring-indigo-500
                      transition
                    `}
                  >
                    <span className={`mr-2 inline-block h-2 w-2 rounded-full bg-gradient-to-r ${GRADIENT}`} />
                    Read More
                  </a>
                </div>
              </article>
            ))}
            <div aria-hidden className="shrink-0 basis-[5%]" />
          </div>

          {/* Arrows */}
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollByCards(-1)}
              className="
                pointer-events-auto ml-1 sm:ml-3 rounded-full p-2 sm:p-3
                bg-white/90 shadow-md ring-1 ring-slate-200
                hover:shadow-lg transition
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200
              "
            >
              <span className={`block h-7 w-7 rounded-full bg-gradient-to-br ${GRADIENT} text-white grid place-items-center`}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </span>
            </button>

            <button
              type="button"
              aria-label="Next"
              onClick={() => scrollByCards(1)}
              className="
                pointer-events-auto mr-1 sm:mr-3 rounded-full p-2 sm:p-3
                bg-white/90 shadow-md ring-1 ring-slate-200
                hover:shadow-lg transition
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200
              "
            >
              <span className={`block h-7 w-7 rounded-full bg-gradient-to-br ${GRADIENT} text-white grid place-items-center`}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
      <section
      id="support-help"
      className="relative isolate overflow-hidden"
      aria-labelledby="support-help-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        {/* Heading */}
        <div className="text-center">
          <h2
            id="support-help-heading"
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900"
          >
            Support & Help
          </h2>
          <span className={`mt-4 inline-block h-1 w-28 rounded-full bg-gradient-to-r ${GRADIENT}`} />
        </div>

        {/* Cards */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch">
          {cards.map(({ title, desc, cta, href, Icon }) => (
            <article
              key={title}
              className={`
                group relative h-full rounded-3xl p-[1px]
                bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-teal-500/20
                transition-transform duration-300
              `}
            >
              {/* animated glow on hover */}
              <span
                aria-hidden
                className={`
                  pointer-events-none absolute -inset-2 rounded-[28px] opacity-0 blur-2xl
                  bg-gradient-to-br ${GRADIENT}
                  transition-opacity duration-500 group-hover:opacity-30
                `}
              />
              <div
                className={`
                  relative h-full rounded-[calc(theme(borderRadius.3xl)-1px)] bg-white
                  ring-1 ring-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)]
                  transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1
                  flex flex-col items-center text-center p-7
                  border border-slate-200   /* ← added explicit border */
                `}
              >
                {/* Icon badge with halo + micro-tilt */}
                <div
                  className={`
                    relative mb-5 inline-flex h-12 w-12 items-center justify-center
                    rounded-2xl text-white bg-gradient-to-br ${GRADIENT}
                    shadow-md transition-transform duration-300
                    group-hover:scale-110 group-hover:rotate-3
                  `}
                >
                  {/* glow ring */}
                  <span
                    aria-hidden
                    className={`absolute -inset-1 rounded-[20px] bg-gradient-to-br ${GRADIENT} opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60`}
                  />
                  <Icon />
                </div>

                {/* Title with sliding underline */}
                <h3 className="relative text-lg sm:text-xl font-semibold text-slate-900">
                  {title}
                  <span
                    aria-hidden
                    className={`absolute -bottom-2 left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r ${GRADIENT} transition-all duration-300 group-hover:w-20`}
                  />
                </h3>

                <p className="mt-4 text-slate-600 leading-relaxed max-w-[42ch]">{desc}</p>

                {/* Spacer keeps CTA aligned across cards while providing consistent gap */}
                <div className="flex-1" />

                {/* CTA: outline → filled gradient on hover */}
                <a
                  href={href}
                  className={`
                    relative mt-4 inline-flex items-center justify-center px-5 h-11 rounded-full
                    font-semibold transition
                    ring-2 ring-blue-500/70 hover:ring-0
                    text-slate-900
                    hover:text-white hover:bg-gradient-to-r ${GRADIENT}
                    focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200
                  `}
                >
                  {/* pulsing dot */}
                  <span className={`mr-2 inline-flex h-2 w-2 items-center justify-center`}>
                    <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${GRADIENT} block`} />
                    <span className={`absolute h-2 w-2 rounded-full bg-blue-500/40 motion-safe:animate-ping`} />
                  </span>
                  {cta}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Soft ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-30 bg-gradient-to-tr from-blue-300 via-indigo-300 to-teal-300"
      />
    </section>

    </div>
  )
}

export default Home