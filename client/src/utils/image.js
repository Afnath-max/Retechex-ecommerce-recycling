export const resolveImageUrl = (img) =>
  img ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${img}` : '/placeholder-image.png';