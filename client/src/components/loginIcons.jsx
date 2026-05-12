// src/components/loginIcons.js
import React from "react";

/** ---------- Primitives ---------- */
export const Label = ({ htmlFor, children, className = "" }) => (
  <label
    htmlFor={htmlFor}
    className={`mb-1 block text-sm font-medium text-slate-800 ${className}`}
  >
    {children}
  </label>
);

export const Icon = ({ className = "h-5 w-5", children }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

/** ---------- Icons ---------- */
export const MailIcon = (p) => (
  <Icon {...p}>
    <path d="M4 6h16v12H4z" />
    <path d="m22 6-10 7L2 6" />
  </Icon>
);

export const LockIcon = (p) => (
  <Icon {...p}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Icon>
);

export const EyeIcon = (p) => (
  <Icon {...p}>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const EyeOffIcon = (p) => (
  <Icon {...p}>
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.44 20.44 0 0 1 5.06-5.94" />
    <path d="M1 1l22 22" />
  </Icon>
);

export const LoginIcon = (p) => (
  <Icon {...p}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
  </Icon>
);

export const ShieldIcon = (p) => (
  <Icon {...p}>
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
  </Icon>
);

export const GoogleIcon = (p) => (
  <Icon {...p}>
    <path d="M21.8 10.2H12v3.6h5.6A5.8 5.8 0 1 1 12 6.2c1.4 0 2.7.5 3.8 1.3l2.5-2.5A9.3 9.3 0 1 0 21.3 12c0-.6-.1-1.2-.2-1.8Z" />
  </Icon>
);
