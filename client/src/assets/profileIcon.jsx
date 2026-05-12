// src/assets/profileIcon.jsx
// Minimal inline SVG icons as data URIs (no external image files needed)
export const icons = {
  // Upload icon (cloud with arrow), 40x40 viewbox, currentColor fill for flexibility
  upload_icon:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path d="M7.5 18h9a3.5 3.5 0 0 0 .62-6.95A5.002 5.002 0 0 0 7.1 8.6a4 4 0 0 0 .1 8.4h.3z" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 14V7m0 0l-3 3m3-3l3 3" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `),

    
};
