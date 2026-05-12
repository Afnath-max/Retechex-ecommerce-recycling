import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'HOME' },
  { to: '/book-appointment', label: 'DROP-OFF' },
  { to: '/marketplace', label: 'MARKET-PLACE' },
  { to: '/contact', label: 'CONTACT-US' },
];

const navLinkClass = ({ isActive }) =>
  [
    'group relative px-4 py-2 text-[15px] font-extrabold tracking-wide uppercase transition-colors',
    isActive ? 'text-slate-900' : 'text-slate-700 hover:text-slate-900',
  ].join(' ');

/* -------------------- Helpers -------------------- */
function normalizePath(p) { if (!p) return ''; return p.startsWith('/') ? p : `/${p}`; }
function absoluteBaseFromApiEnv() {
  const api = import.meta.env.VITE_API_URL || '';
  try {
    const u = new URL(api);
    const pathname = u.pathname.endsWith('/api') ? u.pathname.slice(0, -4) : u.pathname;
    return `${u.origin}${pathname}`.replace(/\/$/, '');
  } catch { return null; }
}
function buildImageCandidates(rawPath) {
  const path = normalizePath(rawPath);
  if (!path) return [];
  if (/^https?:\/\//i.test(path)) return [path];
  const candidates = [];
  const filesBase = import.meta.env.VITE_FILES_BASE?.trim();
  if (filesBase) {
    try {
      const u = new URL(filesBase);
      candidates.push(`${u.origin}${u.pathname.replace(/\/$/, '')}${path}`);
    } catch {}
  }
  const absFromApi = absoluteBaseFromApiEnv();
  if (absFromApi) candidates.push(`${absFromApi}${path}`);
  candidates.push(`http://localhost:3000${path}`);
  candidates.push(`http://localhost:5000${path}`);
  candidates.push(`${window.location.origin}${path}`);
  return [...new Set(candidates)];
}
function getInitials(s) {
  const str = String(s || '').trim();
  if (!str) return 'U';
  if (str.includes('@')) return str[0].toUpperCase();
  const parts = str.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || '';
  const second = parts[1]?.[0] || '';
  return (first + second).toUpperCase() || first.toUpperCase() || 'U';
}

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin, isStaff } = useAuth();

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const rawImage = (user?.image || '').trim();
  const imageCandidates = useMemo(() => buildImageCandidates(rawImage), [rawImage]);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => { setImgIdx(0); }, [user?.id, user?.image]);

  const currentImgSrc = imageCandidates[imgIdx] || '';
  const initials = getInitials(user?.name || user?.email || 'U');

  const hideTimer = useRef(null);
  const openMenu = () => { if (hideTimer.current) clearTimeout(hideTimer.current); setMenuOpen(true); };
  const scheduleCloseMenu = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setMenuOpen(false), 140);
  };
  useEffect(() => { setMenuOpen(false); }, [isAuthenticated]);

  const goDashboard = () => {
    if (isAdmin) navigate('/admin/dashboard');
    else if (isStaff) navigate('/staff/dashboard');
    else navigate('/my-orders');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-20 flex items-center justify-between">
          {/* Brand */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
            aria-label="ReTechExchange"
          >
            <img src={assets.logo} alt="R" className="h-11 w-11 rounded-2xl shadow-sm" />
            <span className="text-2xl sm:text-[28px] font-black bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 bg-clip-text text-transparent">
              ReTechExchange
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end className={navLinkClass}>
                {({ isActive }) => (
                  <span
                    className={[
                      'relative',
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 bg-clip-text text-transparent'
                        : ''
                    ].join(' ')}
                  >
                    {l.label}
                    <span
                      aria-hidden
                      className={[
                        'absolute left-0 -bottom-1 h-[2px] w-full rounded-full',
                        'bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500',
                        'transition-transform origin-left duration-300',
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                      ].join(' ')}
                    />
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right: auth / profile + burger */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                {/* desktop pills */}
                <button
                  onClick={() => navigate('/login')}
                  className="hidden md:inline-flex items-center justify-center whitespace-nowrap shrink-0 px-6 h-11 rounded-full border border-slate-300 text-slate-800 font-semibold hover:bg-slate-50 transition"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="hidden md:inline-flex items-center justify-center whitespace-nowrap shrink-0 px-7 h-11 rounded-full text-white font-semibold bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:opacity-95 shadow-md transition"
                >
                  Sign up
                </button>
              </>
            ) : (
              <div
                className="relative block"
                onMouseEnter={openMenu}
                onMouseLeave={scheduleCloseMenu}
              >
                <button
                  className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-50"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  {currentImgSrc ? (
                    <img
                      src={currentImgSrc}
                      alt="Profile"
                      className="w-10 h-10 rounded-full ring-1 ring-slate-200 object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => {
                        setImgIdx((i) => (i + 1 < imageCandidates.length ? i + 1 : i));
                      }}
                    />
                  ) : (
                    <AvatarSVG className="w-10 h-10 rounded-full ring-1 ring-slate-200" initials={initials} />
                  )}
                  <ChevronDownSVG className="w-3 text-slate-600" />
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 top-full pt-2 transition-all duration-150 ${
                    menuOpen
                      ? 'visible opacity-100 translate-y-0 pointer-events-auto'
                      : 'invisible opacity-0 -translate-y-1 pointer-events-none'
                  }`}
                >
                  <div className="min-w-56 rounded-2xl bg-white ring-1 ring-slate-200 shadow-xl p-3 text-sm text-slate-700">
                    <div className="space-y-1.5">
                      <button
                        onClick={() => { navigate('/edit-profile'); setMenuOpen(false); }}
                        className="w-full text-left rounded-lg px-3 py-2 hover:bg-slate-50 font-medium"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => { navigate('/my-orders'); setMenuOpen(false); }}
                        className="w-full text-left rounded-lg px-3 py-2 hover:bg-slate-50"
                      >
                        My Orders
                      </button>
                      <button
                        onClick={() => { navigate('/my-appointments'); setMenuOpen(false); }}
                        className="w-full text-left rounded-lg px-3 py-2 hover:bg-slate-50"
                      >
                        My Appointments
                      </button>
                      <button
                        onClick={() => { navigate('/cart'); setMenuOpen(false); }}
                        className="w-full text-left rounded-lg px-3 py-2 hover:bg-slate-50"
                      >
                        My Cart
                      </button>
                      {(isAdmin || isStaff) && (
                        <button
                          onClick={() => { goDashboard(); setMenuOpen(false); }}
                          className="w-full text-left rounded-lg px-3 py-2 hover:bg-slate-50"
                        >
                          Dashboard
                        </button>
                      )}
                      <div className="pt-1">
                        <button
                          onClick={async () => { await logout(); navigate('/'); }}
                          className="w-full rounded-lg px-3 py-2 font-semibold text-white bg-red-500 hover:bg-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 transition"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-xl border border-slate-200"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden pb-4 animate-in fade-in slide-in-from-top-2">
            <nav className="grid gap-1 border-t border-slate-200 pt-3">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-lg hover:bg-slate-50"
                >
                  {l.label}
                </NavLink>
              ))}

              {/* CHANGED: when logged in, show NOTHING else in the mobile menu */}
              {/* Keep login/signup only for guests */}
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2 px-1 pt-2">
                  <button
                    onClick={() => { navigate('/login'); setOpen(false); }}
                    className="h-11 rounded-full border border-slate-300 font-semibold hover:bg-slate-50"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => { navigate('/register'); setOpen(false); }}
                    className="h-11 rounded-full text-white font-semibold bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:opacity-95 shadow-md"
                  >
                    Sign up
                  </button>
                </div>
              ) : null} {/* CHANGED */}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

/* --- Small inline SVGs and helpers --- */
function ChevronDownSVG({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function AvatarSVG({ className = '', initials = 'U' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="a" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#eef2ff" />
          <stop offset="100%" stopColor="#f0fdfa" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#a)" />
      <circle cx="20" cy="14" r="6" fill="#c7d2fe" />
      <path d="M8 31c3.5-5 8-7 12-7s8.5 2 12 7" fill="#dbeafe" />
      <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
        fontSize="12" fontWeight="700" fill="#334155">{initials}</text>
    </svg>
  );
}
