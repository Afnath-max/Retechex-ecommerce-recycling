import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI, cartAPI, wishlistAPI } from '../services/api';
import { ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// Define the base URL for images
const API_BASE =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadProduct();
    if (isAuthenticated) {
      checkWishlist();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data.product);
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    try {
      const response = await wishlistAPI.check(id);
      setInWishlist(response.data.inWishlist);
    } catch (error) {
      console.error('Failed to check wishlist');
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!isCustomer) {
      toast.error('Only customers can add items to cart');
      return;
    }

    setAddingToCart(true);
    try {
      await cartAPI.add({ productId: id, quantity });
      toast.success('Added to cart successfully!');
      navigate('/cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to manage wishlist');
      navigate('/login');
      return;
    }

    try {
      if (inWishlist) {
        await wishlistAPI.remove(id);
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.add(id);
        setInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const getConditionBadge = (condition) => {
    const badges = {
      excellent: 'success',
      good: 'info',
      fair: 'warning',
      poor: 'danger'
    };
    return badges[condition] || 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Link to="/marketplace" className="btn-primary inline-block">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }
  
  // ✅ MODIFICATION: Determine the correct image source
  const imagePath = product.images?.[0] || product.imageUrl || '';
  const imageSrc = imagePath.startsWith('http')
    ? imagePath
    : `${API_BASE}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    // If the image path is provided from the product object, we assume it's like /uploads/image.png
    // The marketplace file assumed this structure: `${API_BASE}${imagePath}`. We'll use a safer version here.


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/marketplace" className="flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft size={20} className="mr-2" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          {imageSrc ? (
            <img
              // ✅ MODIFICATION: Use the constructed imageSrc
              src={imageSrc}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <ShoppingCart size={64} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <Badge variant={getConditionBadge(product.condition)} className="mb-2">
              {product.condition}
            </Badge>
            {product.isLowStock && (
              <Badge variant="warning" className="ml-2">
                Low Stock
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-600 capitalize mb-4">{product.category}</p>
          {product.brand && (
            <p className="text-gray-700 mb-4">Brand: <span className="font-semibold">{product.brand}</span></p>
          )}

          <div className="mb-6">
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-bold text-primary-600">
                ${product.finalPrice?.toFixed(2) || product.price.toFixed(2)}
              </span>
              {product.hasDiscount && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            {product.hasDiscount && (
              <p className="text-green-600 font-medium mt-2">
                Save ${(product.price - product.finalPrice).toFixed(2)}!
              </p>
            )}
          </div>

          {product.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Stock:</span> {product.stockQuantity} available
            </p>
          </div>

          {/* Quantity */}
          {isCustomer && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                max={product.stockQuantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="input-field w-32"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4">
            {isCustomer && (
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stockQuantity === 0}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                <ShoppingCart size={20} />
                <span>{addingToCart ? 'Adding...' : product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
            )}
            {isAuthenticated && (
              <button
                onClick={handleWishlist}
                className={`p-3 rounded-lg border-2 ${
                  inWishlist
                    ? 'bg-red-50 border-red-500 text-red-600'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Heart size={24} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          {!isAuthenticated && (
            <p className="text-gray-600 mt-4">
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Login
              </Link>{' '}
              to purchase this product
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;