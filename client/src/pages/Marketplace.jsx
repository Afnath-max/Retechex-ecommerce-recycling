// client/src/pages/Marketplace.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { Search, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Automatically reload products when category changes
  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    try {
      const params = {};
      if (category) params.category = category;
      if (search) params.search = search;

      const response = await productsAPI.getAll(params);
      setProducts(response.data.products);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts();
  };

  // ✅ Base URL for image paths
  const API_BASE =
    import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

  const categories = ['laptops', 'smartphones', 'wearables', 'tablets', 'accessories'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Marketplace</h1>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategory('')}
            className={`px-4 py-2 rounded-lg ${
              !category ? 'bg-primary-600 text-white' : 'bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg capitalize ${
                category === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const imagePath = product.images?.[0] || product.imageUrl || '';
            const imageSrc = imagePath.startsWith('http')
              ? imagePath
              : `${API_BASE}${imagePath}`;

            return (
              <div key={product._id} className="card hover:shadow-lg transition">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}

                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2 capitalize">
                  {product.category}
                </p>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    ${product.finalPrice?.toFixed(2) || product.price.toFixed(2)}
                  </span>
                  {product.hasDiscount && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/products/${product._id}`}
                    className="flex-1 btn-primary text-center text-sm"
                  >
                    View Details
                  </Link>
                  <button className="btn-secondary p-2">
                    <Heart size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Marketplace;