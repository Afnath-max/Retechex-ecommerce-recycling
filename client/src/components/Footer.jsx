import React from "react";

const GRADIENT = "from-blue-600 via-indigo-600 to-teal-500";

const nav = {
  quick: [
    { label: "Home", href: "/" },
    { label: "Drop-Off", href: "/appointment" },
    { label: "Market Place", href: "/market" },
    { label: "Contact Us", href: "/contact" },
  ],
  resources: [
    { label: "About Us", href: "/about" },
    { label: "E-Waste Facts", href: "/facts" },
    { label: "Recycling Process", href: "/recycling" },
    { label: "Sustainability Report", href: "/sustainability" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Data Security", href: "/security" },
  ],
};

const iconBase =
  "h-5 w-5 text-slate-700 transition-transform group-hover:scale-110 group-hover:text-slate-900";

const SocialIcon = ({ children }) => (
  <span className="inline-flex rounded-full p-[2px] bg-gradient-to-br from-blue-500/30 via-indigo-500/30 to-teal-500/30 group">
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
      {children}
    </span>
  </span>
);

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-600">
      <br />
      <div className="h-1 w-full bg-black" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              ReTechExchange
            </h3>
            <span className={`mt-3 block h-1 w-16 rounded-full bg-gradient-to-r ${GRADIENT}`} />
            <p className="mt-5 max-w-md leading-relaxed">
              Creating a sustainable future through responsible e-waste
              management.
            </p>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-4">
              {/* Facebook */}
              <a aria-label="Facebook" href="https://facebook.com" className="group">
                <SocialIcon>
                  <svg viewBox="0 0 24 24" className={iconBase} fill="currentColor">
                    {/* classic Facebook “f” */}
                    <path d="M18 2h-3.2A4.8 4.8 0 0 0 10 6.8V10H8v3h2v9h3.5v-9h3l.8-3H13.5V6.8c0-.7.6-1.3 1.3-1.3H18V2z" />
                  </svg>
                </SocialIcon>
              </a>

              {/* X / Twitter */}
              <a aria-label="X" href="https://twitter.com" className="group">
                <SocialIcon>
                  <svg viewBox="0 0 24 24" className={iconBase} fill="currentColor">
                    {/* brand “X” mark (filled geometry for better legibility) */}
                    <path d="M3 3h5.6L12 8.3 15.4 3H21l-7.5 9.6L21 21h-5.6L12 15.7 8.6 21H3l7.5-8.4L3 3z" />
                  </svg>
                </SocialIcon>
              </a>

              {/* Instagram */}
              <a aria-label="Instagram" href="https://instagram.com" className="group">
                <SocialIcon>
                  <svg viewBox="0 0 24 24" className={iconBase} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {/* rounded square camera */}
                    <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="4.2" />
                    <circle cx="12" cy="12" r="4.1" />
                    <circle cx="17.1" cy="6.9" r="1.1" fill="currentColor" stroke="none" />
                  </svg>
                </SocialIcon>
              </a>

              {/* LinkedIn */}
              <a aria-label="LinkedIn" href="https://linkedin.com" className="group">
                <SocialIcon>
                  <svg viewBox="0 0 24 24" className={iconBase} fill="currentColor">
                    {/* “in” wordmark */}
                    <path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0 0-5zM4 9h4v12H4zM14.5 9A5.5 5.5 0 0 0 9 14.5V21h4v-5.2c0-1.7.9-2.8 2.4-2.8 1.4 0 2.1.9 2.1 2.8V21H21v-6.5C21 11.1 19.5 9 17 9c-1.6 0-2.8.7-3.5 1.8V9h-1z" />
                  </svg>
                </SocialIcon>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav className="md:col-span-2">
            <h4 className="text-slate-900 font-semibold text-lg">
              Quick Links
              <span className={`block h-1 w-12 rounded-full mt-2 bg-gradient-to-r ${GRADIENT}`} />
            </h4>
            <ul className="mt-5 list-none space-y-3">
              {nav.quick.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-slate-600 hover:text-slate-900 transition">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources */}
          <nav className="md:col-span-3">
            <h4 className="text-slate-900 font-semibold text-lg">
              Resources
              <span className={`block h-1 w-12 rounded-full mt-2 bg-gradient-to-r ${GRADIENT}`} />
            </h4>
            <ul className="mt-5 list-none space-y-3">
              {nav.resources.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-slate-600 hover:text-slate-900 transition">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav className="md:col-span-2">
            <h4 className="text-slate-900 font-semibold text-lg">
              Legal
              <span className={`block h-1 w-12 rounded-full mt-2 bg-gradient-to-r ${GRADIENT}`} />
            </h4>
            <ul className="mt-5 list-none space-y-3">
              {nav.legal.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-slate-600 hover:text-slate-900 transition">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div className="mt-12 h-px w-full bg-slate-200" />

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>© {year} ReTechExchange. All rights reserved.</p>
        </div>
      </div>

      {/* Subtle background flourish */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-blue-400 via-indigo-400 to-teal-400"
      />
    </footer>
  );
};

export default Footer;
