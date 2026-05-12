// src/pages/ContactUS.jsx
import React, { useState } from "react";
import { assets } from "../assets/assets";

const GRADIENT = "from-blue-600 via-indigo-600 to-teal-500";

const ContactUS = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "Appointments",
    branch: "Galle Central",
    message: "",
    agree: false,
  });

  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const branches = [
    {
      name: "Galle Central",
      addr: "No. 12, Sea View Rd, Galle 80000",
      hours: "Mon–Sat 9:00–17:30",
      phone: "091-225-7788",
    },
    {
      name: "Matara City",
      addr: "45 Old Tangalle Rd, Matara 81000",
      hours: "Mon–Sat 9:00–17:30",
      phone: "041-223-1144",
    },
    {
      name: "Hambantota Hub",
      addr: "Industrial Zone, Hambantota 82000",
      hours: "Tue–Sun 9:30–17:00",
      phone: "047-222-9090",
    },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (!/^0\d{9}$/.test(form.phone))
      return "Phone must start with 0 and be 10 digits.";
    if (!form.message.trim()) return "Please enter a short message.";
    if (!form.agree)
      return "Please accept the data policy so we can contact you back.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setStatus({ type: "error", msg: err });
      return;
    }

    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({
          type: "success",
          msg: "Thanks! We received your message and will reply within 1–2 business days.",
        });
        setForm({
          name: "",
          email: "",
          phone: "",
          topic: "Appointments",
          branch: "Galle Central",
          message: "",
          agree: false,
        });
      } else {
        setStatus({
          type: "error",
          msg: data.message || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      setStatus({
        type: "error",
        msg: "Network error. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative">
      {/* Top gradient header */}
      <div className={`w-full bg-gradient-to-r ${GRADIENT} text-white`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-10 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="animate-fadeInUp">
              <p className="inline-flex items-center gap-2 text-xs md:text-sm bg-white/15 backdrop-blur rounded-full px-3 py-1">
                <span className="inline-block h-2 w-2 rounded-full bg-white" />
                Circular Electronics Asset Management System
              </p>
              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
                Contact Us
              </h1>
              <p className="mt-3 max-w-2xl text-white/90 text-sm sm:text-base">
                Manual e-waste selling happens only via{" "}
                <strong>in-person drop-off</strong> with{" "} <br />
                <strong>pre-appointment registration</strong>. The{" "}
                <strong>reselling</strong> of refurbished electronics occurs
                exclusively through <strong>"ReTechExchange."</strong>
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/appointment"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow hover:shadow-lg hover:scale-105 transition-transform"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Book Drop-Off Appointment
                </a>
                <a
                  href="/market"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/30 hover:bg-white/15 hover:scale-105 transition-transform"
                >
                  <StoreIcon className="h-4 w-4" />
                  Visit ReTechExchange
                </a>
                <a
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/30 hover:bg-white/15 hover:scale-105 transition-transform"
                >
                  <InfoIcon className="h-4 w-4" />
                  About the Program
                </a>
              </div>
            </div>

            {/* Right: Image card */}
            <div className="order-first md:order-none">
              <div
                className="group relative md:ml-auto rounded-[28px] overflow-hidden
                           bg-white/5 backdrop-blur-[2px]
                           ring-1 ring-white/20 shadow-[0_15px_60px_-15px_rgba(0,0,0,0.45)]
                           transition-all duration-500 hover:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.55)]
                           hover:translate-y-[-2px]"
              >
                <div className="pointer-events-none absolute -inset-6 bg-gradient-to-tr from-indigo-400/20 via-sky-300/20 to-teal-300/20 blur-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-90" />
                <img
                  src={assets.contact_us}
                  alt="Contact us illustration"
                  className="relative w-full object-cover rounded-[28px] transition-transform duration-500 group-hover:scale-[1.02] group-hover:rotate-[0.5deg]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Left: Contact form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200/70 shadow-sm p-5 sm:p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-800">
                Send us a message
              </h2>
              <p className="mt-1 text-slate-500 text-sm">
                Questions about appointments, branches, or ReTechExchange? We'll
                get back to you shortly.
              </p>

              {status.msg && (
                <div
                  className={`mt-4 rounded-lg p-3 text-sm ${
                    status.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {status.msg}
                </div>
              )}

              <form
                onSubmit={onSubmit}
                className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., Sanduni Perera"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone (Sri Lanka)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="07XXXXXXXX"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Select
                    id="topic"
                    name="topic"
                    value={form.topic}
                    onChange={handleChange}
                    options={[
                      "Appointments",
                      "Branch & Drop-Off",
                      "ReTechExchange Support",
                      "Partnerships",
                      "Other",
                    ]}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="branch">Preferred branch</Label>
                  <Select
                    id="branch"
                    name="branch"
                    value={form.branch}
                    onChange={handleChange}
                    options={branches.map((b) => b.name)}
                    disabled={loading}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help. If you're booking a drop-off, include device type, quantity, and any special handling notes."
                    required
                    disabled={loading}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-start gap-3 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="agree"
                      checked={form.agree}
                      onChange={handleChange}
                      disabled={loading}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      I agree to be contacted about my inquiry and confirm that
                      the drop-off process is{" "}
                      <strong>in-person only by appointment</strong>, while
                      reselling takes place exclusively via{" "}
                      <strong>ReTechExchange</strong>.
                    </span>
                  </label>
                </div>

                <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-r ${GRADIENT} px-5 py-3 text-white font-medium shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <SendIcon className="h-5 w-5 mr-2" />
                    {loading ? "Sending..." : "Send Message"}
                  </button>

                  <a
                    href="/appointment"
                    className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 hover:text-indigo-900"
                  >
                    <ArrowRightIcon className="h-4 w-4" />
                    Or book a drop-off appointment
                  </a>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Branch cards & info */}
          <aside className="lg:col-span-1">
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200/70 shadow-sm p-5">
                <h3 className="text-base md:text-lg font-semibold text-slate-800">
                  Branches (Southern Province)
                </h3>

                <ul className="mt-4 space-y-4">
                  {branches.map((b) => (
                    <li key={b.name}>
                      <div
                        className="
                          p-[2px] rounded-2xl
                          bg-gradient-to-r from-blue-200/60 via-indigo-200/60 to-teal-200/60
                          transition-all duration-300
                          hover:from-blue-300/80 hover:via-indigo-300/80 hover:to-teal-300/80
                          hover:shadow-[0_10px_30px_-10px_rgba(45,75,255,0.35)]
                        "
                      >
                        <div
                          className="
                            rounded-2xl bg-white/90 backdrop-blur
                            border border-transparent
                            px-4 py-4
                            transition-all duration-300
                            hover:bg-white
                          "
                        >
                          <div className="flex gap-3">
                            <span className="mt-1.5 h-5 w-1 rounded-full bg-gradient-to-b from-blue-500 via-indigo-500 to-teal-500" />
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 group-hover:text-slate-900">
                                {b.name}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                {b.addr}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                Hours: {b.hours}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                Tel: {b.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="
                  p-[2px] rounded-2xl
                  bg-gradient-to-r from-blue-200/60 via-indigo-200/60 to-teal-200/60
                  hover:from-blue-300/80 hover:via-indigo-300/80 hover:to-teal-300/80
                  transition-all duration-300
                "
              >
                <div
                  className="
                    rounded-2xl bg-white/90 backdrop-blur border border-transparent
                    p-5 shadow-sm
                    transition-all duration-300
                    hover:shadow-md hover:bg-white
                  "
                >
                  <h3 className="text-base md:text-lg font-semibold text-slate-800">
                    Support Hours
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Mon–Sat: 09:00–17:30 (GMT+5:30)
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Email: support@retechexchange.lk
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* CTA strip */}
        <div className="mt-12 rounded-2xl border border-slate-200/70 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Ready to drop off your e-waste?
            </h3>
            <p className="text-sm text-slate-600">
              Book a pre-appointment so our staff can prepare secure handling
              and quick service at your chosen branch.
            </p>
          </div>
          <a
            href="/appointment"
            className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-r ${GRADIENT} px-5 py-3 text-white font-medium shadow hover:opacity-95`}
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Book Drop-Off Appointment
          </a>
        </div>
      </div>
    </section>
  );
};

/* ---------- UI Primitives ---------- */
const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
    {children}
  </label>
);

const Input = (props) => (
  <input
    {...props}
    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 disabled:bg-slate-50 disabled:text-slate-500"
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 disabled:bg-slate-50 disabled:text-slate-500"
  />
);

const Select = ({ options = [], disabled = false, ...props }) => (
  <select
    {...props}
    disabled={disabled}
    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 disabled:bg-slate-50 disabled:text-slate-500"
  >
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

/* ---------- Icons ---------- */
const Icon = ({ className = "h-5 w-5", children }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    {children}
  </svg>
);

const CalendarIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Icon>
);

const StoreIcon = (p) => (
  <Icon {...p}>
    <path d="M3 7h18l-1 4H4L3 7Z" />
    <path d="M5 11v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </Icon>
);

const InfoIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="8" />
    <line x1="11" y1="12" x2="12" y2="12" />
    <line x1="12" y1="12" x2="12" y2="16" />
  </Icon>
);

const SendIcon = (p) => (
  <Icon {...p}>
    <path d="m22 2-7 20-4-9-9-4 20-7Z" />
  </Icon>
);

const ArrowRightIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Icon>
);

export default ContactUS;