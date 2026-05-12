const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:3000';

export const resolveImageUrl = (img) => {
  if (!img) return '/placeholder-image.png';
  if (/^https?:\/\//i.test(img)) return img;

  const path = img.startsWith('/') ? img : `/uploads/${img}`;
  return `${API_BASE}${path}`;
};
