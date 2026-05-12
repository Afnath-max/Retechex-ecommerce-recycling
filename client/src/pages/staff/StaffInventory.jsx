import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/Modal';
import { productsAPI } from '../../services/api';
import { Search, Package, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

// Use the API_BASE definition from AdminProducts for consistent image fetching
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

// Function to construct the absolute image URL, copied from AdminProducts.jsx
const getProductImageSrc = (product) => {
  // 1. Get the raw image path/name. Prioritize 'image' (from admin upload), then the array, then 'imageUrl'.
  const imagePath = product.image || product.images?.[0] || product.imageUrl || '';
  
  if (!imagePath) return '';

  // 2. If already a full URL (e.g., external image), return it as is.
  if (imagePath.startsWith('http')) {
      return imagePath;
  }
  
  // 3. Construct the absolute path: API_BASE + / + path without leading slash
  const pathWithoutLeadingSlash = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  return `${API_BASE}/${pathWithoutLeadingSlash}`;
}

const StaffInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [stockAction, setStockAction] = useState('increment');
  const [stockQuantity, setStockQuantity] = useState('');

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    try {
      const params = {};
      if (category) params.category = category;
      if (searchTerm) params.search = searchTerm;
      
      const response = await productsAPI.getAll(params);
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.updateStock(selectedProduct._id, {
        action: stockAction,
        quantity: parseInt(stockQuantity)
      });
      toast.success('Stock updated successfully');
      setShowUpdateModal(false);
      setSelectedProduct(null);
      setStockQuantity('');
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const openUpdateModal = (product) => {
    setSelectedProduct(product);
    setStockAction('increment');
    setStockQuantity('');
    setShowUpdateModal(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Update product stock levels</p>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadProducts()}
                className="input-field pl-10"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="laptops">Laptops</option>
              <option value="smartphones">Smartphones</option>
              <option value="wearables">Wearables</option>
              <option value="tablets">Tablets</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const imageSrc = getProductImageSrc(product);
            
            return (
              <div key={product._id} className="card hover:shadow-lg transition relative">
                
                {/* Product Image in top right */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { 
                        e.target.style.display = 'none'; 
                        e.target.parentElement.innerHTML = '<ImageIcon size={24} className="text-gray-400" />';
                      }}
                    />
                  ) : (
                    <ImageIcon size={24} className="text-gray-400" />
                  )}
                </div>

                {product.isLowStock && (
                  <div className="mb-3">
                    <Badge variant="warning">Low Stock</Badge>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 capitalize mb-2">{product.category}</p>
                
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Stock:</span>
                    <span className={`text-2xl font-bold ${product.isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                      {product.stockQuantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Low Stock Alert:</span>
                    <span className="text-xs text-gray-600">{product.lowStockThreshold}</span>
                  </div>
                </div>

                <button
                  onClick={() => openUpdateModal(product)}
                  className="w-full btn-primary"
                >
                  Update Stock
                </button>
              </div>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        )}
      </div>

      {/* Update Stock Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedProduct(null);
        }}
        title={`Update Stock - ${selectedProduct?.name}`}
        size="md"
      >
        {selectedProduct && (
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Current Stock:</span>
                <span className="text-2xl font-bold text-gray-900">{selectedProduct.stockQuantity}</span>
              </div>
              {selectedProduct.isLowStock && (
                <div className="flex items-center space-x-2 text-orange-600 text-sm">
                  <AlertTriangle size={16} />
                  <span>Below threshold ({selectedProduct.lowStockThreshold})</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action *</label>
              <select
                required
                value={stockAction}
                onChange={(e) => setStockAction(e.target.value)}
                className="input-field"
              >
                <option value="increment">Add Stock (Increment)</option>
                <option value="decrement">Remove Stock (Decrement)</option>
                <option value="set">Set Exact Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                required
                min="1"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="input-field"
                placeholder={stockAction === 'set' ? 'Enter exact stock amount' : 'Enter quantity'}
              />
            </div>

            {stockAction !== 'set' && stockQuantity && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  New stock will be: 
                  <span className="font-bold text-blue-600 ml-2">
                    {stockAction === 'increment' 
                      ? selectedProduct.stockQuantity + parseInt(stockQuantity)
                      : Math.max(0, selectedProduct.stockQuantity - parseInt(stockQuantity))
                    }
                  </span>
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedProduct(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Update Stock
              </button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default StaffInventory;