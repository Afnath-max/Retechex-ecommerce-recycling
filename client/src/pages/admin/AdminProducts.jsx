import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/Modal';
import { productsAPI } from '../../services/api';
import { Plus, Edit, Trash2, Search, Package, Download, Eye, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge';
import { downloadBlob } from '../../utils/download';
import { formatCurrency, validatePositiveNumber, validateStockQuantity } from '../../utils/validation';

// Use the API_BASE definition that worked in the other components (e.g., Marketplace)
// If VITE_API_URL is undefined or set to the wrong port, this fallback needs to match your backend.
// We'll use the value from the original AdminProducts file, assuming it's the correct port for the backend.
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'laptops',
    condition: 'good',
    price: '',
    description: '',
    brand: '',
    stockQuantity: '',
    lowStockThreshold: 10
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create FormData if image is present
      const data = formData.image ? new FormData() : formData;
      
      if (formData.image) {
        // Add all form fields to FormData
        Object.keys(formData).forEach(key => {
          if (key !== 'image') {
            data.append(key, formData[key]);
          }
        });
        // Add image file
        data.append('image', formData.image);
      }

      if (editingProduct) {
        await productsAPI.update(editingProduct._id, data);
        toast.success('Product updated successfully');
      } else {
        await productsAPI.create(data);
        toast.success('Product created successfully');
      }
      setShowModal(false);
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  // ✅ FINAL LOGIC: This function now determines the final image URL using the most robust checks.
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
    
    // The marketplace file seems to rely on the backend serving from the base URL + path directly
    return `${API_BASE}/${pathWithoutLeadingSlash}`;
  }

  const viewProductImage = (product) => {
    const imageSrc = getProductImageSrc(product);
    if (imageSrc) {
      setSelectedImage({
        url: imageSrc,
        name: product.name
      });
      setShowImageModal(true);
    } else {
      toast.error('No image available for this product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      condition: product.condition,
      price: product.price,
      description: product.description || '',
      brand: product.brand || '',
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold || 10
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'laptops',
      condition: 'good',
      price: '',
      description: '',
      brand: '',
      stockQuantity: '',
      lowStockThreshold: 10
    });
    setEditingProduct(null);
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

  const handleDownloadInventoryReport = () => {
    try {
      toast.loading('Generating report...');
      const csvContent = generateInventoryCSV(products);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      downloadBlob(blob, `inventory-report-${new Date().toISOString().split('T')[0]}.csv`);
      toast.dismiss();
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to download report');
    }
  };

  const generateInventoryCSV = (products) => {
    const headers = ['Product Name', 'Category', 'Brand', 'Condition', 'Price (Rs)', 'Stock', 'Low Stock Alert', 'Status'];
    const rows = products.map(p => [
      p.name,
      p.category,
      p.brand || 'N/A',
      p.condition,
      p.price.toFixed(2),
      p.stockQuantity,
      p.lowStockThreshold,
      p.status
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Manage products and stock levels</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleDownloadInventoryReport()}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={18} />
              Download Report
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Product</span>
            </button>
          </div>
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
              <div key={product._id} className="card hover:shadow-lg transition">
                
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => { 
                      // If image fails to load, hide the img element to show the "No Image" div below it (if you choose to uncomment)
                      // For now, we just hide it and the card will look cleaner without a broken image icon.
                      e.target.style.display = 'none'; 
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <Badge variant={getConditionBadge(product.condition)}>
                    {product.condition}
                  </Badge>
                  {product.isLowStock && (
                    <Badge variant="warning">Low Stock</Badge>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 capitalize mb-2">{product.category}</p>
                <p className="text-sm text-gray-500 mb-3">{product.brand || 'Unknown Brand'}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">{formatCurrency(product.price)}</span>
                  <span className="text-sm text-gray-600">Stock: {product.stockQuantity}</span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => viewProductImage(product)}
                    className="btn-info btn-sm flex items-center justify-center space-x-1"
                    title="View Image"
                  >
                    <Image size={16} />
                    <span>Image</span>
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 btn-danger flex items-center justify-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="e.g., iPhone 12 Pro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                <option value="laptops">Laptops</option>
                <option value="smartphones">Smartphones</option>
                <option value="wearables">Wearables</option>
                <option value="tablets">Tablets</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="input-field"
                placeholder="e.g., Apple"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
              <select
                required
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="input-field"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input-field"
                placeholder="299.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="input-field"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Alert</label>
              <input
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                className="input-field"
                placeholder="10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            <p className="text-xs text-gray-500 mt-1">PNG, JPG or WEBP (max 5MB)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Product description..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
          setSelectedImage(null);
        }}
        title="Product Image"
      >
        {selectedImage && (
          <div className="text-center">
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="max-w-full max-h-96 mx-auto rounded-lg"
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
                toast.error('Failed to load image');
              }}
            />
            <p className="mt-3 text-sm text-gray-600">{selectedImage.name}</p>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminProducts;