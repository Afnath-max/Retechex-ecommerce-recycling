import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI, cartAPI } from '../services/api';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const response = await wishlistAPI.get();
      setWishlist(response.data.wishlist);
    } catch (error) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      toast.success('Removed from wishlist');
      loadWishlist();
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const addToCart = async (productId) => {
    try {
      await cartAPI.add({ productId, quantity: 1 });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

      {!wishlist || wishlist.items.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Add products you love to your wishlist</p>
          <Link to="/marketplace" className="btn-primary inline-block">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.items.map((item) => (
            <div key={item.product._id} className="card hover:shadow-lg transition">
              {item.product.images && item.product.images[0] ? (
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <Heart className="text-gray-400" size={48} />
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.product.name}</h3>
              <p className="text-sm text-gray-600 capitalize mb-2">{item.product.category}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-primary-600">
                  ${item.product.finalPrice?.toFixed(2) || item.product.price.toFixed(2)}
                </span>
                {item.product.hasDiscount && (
                  <span className="text-sm text-gray-500 line-through">
                    ${item.product.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => addToCart(item.product._id)}
                  disabled={item.product.stockQuantity === 0}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  <ShoppingCart size={16} />
                  <span>{item.product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
                <button
                  onClick={() => removeFromWishlist(item.product._id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  title="Remove from wishlist"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;