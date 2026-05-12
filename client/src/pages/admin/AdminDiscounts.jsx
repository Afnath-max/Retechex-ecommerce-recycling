import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { adminAPI } from '../../services/api';

import { Plus, Trash2, Edit, Tag, Zap, X, ChevronDown, ChevronUp } from 'lucide-react'; 
import toast from 'react-hot-toast';
import { downloadBlob } from '../../utils/download';

// Normalize server response so our UI can keep using `.percent`
const normalizeBulk = (data) =>
  data ? { ...data, percent: data.percent ?? data.percentage ?? data.value ?? 0 } : data;

const DiscountAccordionItem = ({ discount, isActiveDiscount, handleDelete, handleEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const affectedItems = discount.scope === 'category' 
    ? [`Product 1 in ${discount.category}`, `Product 2 in ${discount.category}`, '...'] 
    : [discount.productId?.name || 'Specific Product'];

  const statusVariant = isActiveDiscount(discount) 
    ? 'success' 
    : new Date(discount.endDate) < new Date() 
      ? 'danger' 
      : 'warning';
  
  const statusText = isActiveDiscount(discount) 
    ? 'Active' 
    : new Date(discount.endDate) < new Date() 
      ? 'Expired' 
      : 'Scheduled';

  return (
    <div className="border-b border-gray-200">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center space-x-3">
            <Tag size={20} className="text-primary-600" />
            <span className="font-semibold text-gray-900 truncate">{discount.name}</span>
            <Badge variant={statusVariant}>{statusText}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1 capitalize">
            Scope: <span className="font-medium text-gray-700">{discount.productId?.name || discount.category || 'N/A'}</span> ({discount.scope})
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-center">
             <p className="font-bold text-lg text-green-600">
                {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
             </p>
             <p className="text-xs text-gray-500">{discount.type}</p>
          </div>
          <div className="text-center text-sm text-gray-600 w-32">
            {new Date(discount.startDate).toLocaleDateString()} to {new Date(discount.endDate).toLocaleDateString()}
          </div>
          
          <div className="flex space-x-2 ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(discount); 
              }} 
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              title="Edit Discount"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(discount._id);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Delete Discount"
            >
              <Trash2 size={18} />
            </button>
          </div>
          
          {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </div>
      
      {isOpen && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Affected Items ({affectedItems.length})</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 max-h-40 overflow-y-auto pl-4">
            {affectedItems.map((item, index) => (
              <li key={index} className="py-0.5">{item}</li>
            ))}
          </ul>
          {discount.description && (
            <div className="mt-4 pt-3 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-700 mb-1">Description</h4>
                <p className="text-sm text-gray-600">{discount.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const AdminDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBulkModal, setShowBulkModal] = useState(false);
  // ⭐️ State for the product/category edit modal (new requirement)
  const [showProductDiscountModal, setShowProductDiscountModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  
  // ⭐️ SITE-WIDE BULK DISCOUNT: Set to a static, visible value
  const [siteBulkDiscount, setSiteBulkDiscount] = useState({
      active: true,
      percent: 15,
      name: 'Apply Bulk Discount',
      description: 'Temporary static display. Use "Apply Bulk Discount" button to set real config.', 
      startDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      endDate: new Date(Date.now() + 86400000 * 30).toISOString(), // Next Month
  });
  
  // ⭐️ Bulk form state updated to include all config fields
  const [bulkData, setBulkData] = useState({
    name: '',
    description: '',
    percentage: '', // Backend expects 'percentage'
    startDate: '',
    endDate: '',
    // 'active' is not needed in the form state as we activate on submit
  });

  // ⭐️ State for the product/category discount form data
  const [productDiscountData, setProductDiscountData] = useState({
      name: '',
      type: 'percentage',
      value: '',
      scope: 'product',
      productId: '',
      category: '',
      startDate: '',
      endDate: '',
      description: ''
  });

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      // ⭐️ Assuming getDiscounts now only returns product/category discounts
      const response = await adminAPI.getDiscounts();
      setDiscounts(response.data.discounts);
    } catch (error) {
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  // Bulk Discount Handlers
  const handleCreateOrUpdateBulkDiscount = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: bulkData.name,
        description: bulkData.description,
        // backend expects `percentage`
        percentage: parseFloat(bulkData.percentage),
        startDate: bulkData.startDate,
        endDate: bulkData.endDate,
        active: true, // Activate on submit
      };
      
      const start = new Date(bulkData.startDate);
      const end = new Date(bulkData.endDate);
      const startOfToday = new Date();
      startOfToday.setHours(0,0,0,0);
      
      if (start < startOfToday) {
        toast.error('Start date cannot be in the past.');
        return;
      }
      if (end <= start) {
        toast.error('End date must be after start date.');
        return;
      }

      // Hit the API to save the configuration server-side
      const response = await adminAPI.createBulkDiscount(payload);
      toast.success(response.data.message || 'Bulk discount saved successfully!');
      
      // Keep our local state shape consistent (use `.percent` downstream)
      setSiteBulkDiscount(normalizeBulk(response.data.data)); 
      
      setShowBulkModal(false);
      resetBulkForm();
    } catch (error) {
      console.error('Bulk discount error:', error);
      toast.error(error.response?.data?.message || 'Failed to apply bulk discount');
    }
  };

  const handleDeleteBulkDiscount = async () => {
    if (!window.confirm('Are you sure you want to DEACTIVATE the site-wide bulk discount?')) return;
    
    try {
      const response = await adminAPI.createBulkDiscount({
        active: false,
        // backend expects `percentage`
        percentage: 0,
        name: siteBulkDiscount?.name || 'Deactivated', 
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      });
      toast.success('Site-wide bulk discount deactivated.');
      // Normalize the shape
      setSiteBulkDiscount(normalizeBulk(response.data.data));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate bulk discount');
    }
  };

  const handleEditBulkDiscount = () => {
    if (!siteBulkDiscount) return;

    setBulkData({
      name: siteBulkDiscount.name,
      description: siteBulkDiscount.description || '',
      percentage: siteBulkDiscount.percent.toString(),
      startDate: siteBulkDiscount.startDate ? new Date(siteBulkDiscount.startDate).toISOString().split('T')[0] : '',
      endDate: siteBulkDiscount.endDate ? new Date(siteBulkDiscount.endDate).toISOString().split('T')[0] : '',
    });
    setShowBulkModal(true);
  };
  
  // Product/Category Discount Handlers
  
  // ⭐️ Open the edit modal and populate data
  const handleEditDiscount = (discount) => {
      setEditingDiscount(discount);
      setProductDiscountData({
          name: discount.name,
          type: discount.type,
          value: discount.value.toString(),
          scope: discount.scope,
          productId: discount.productId?._id || '',
          category: discount.category || '',
          startDate: new Date(discount.startDate).toISOString().split('T')[0],
          endDate: new Date(discount.endDate).toISOString().split('T')[0],
          description: discount.description || ''
      });
      setShowProductDiscountModal(true);
  };

  // ⭐️ Create/Update product/category discount
  const handleCreateOrUpdateDiscount = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            ...productDiscountData,
            value: parseFloat(productDiscountData.value),
            // Clean up unused scope fields
            productId: productDiscountData.scope === 'product' ? productDiscountData.productId : null,
            category: productDiscountData.scope === 'category' ? productDiscountData.category : null,
        };

        const start = new Date(payload.startDate);
        const end = new Date(payload.endDate);
        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        
        if (!editingDiscount && start < startOfToday) {
          toast.error('Start date cannot be in the past when creating a new discount.');
          return;
        }
        if (end <= start) {
          toast.error('End date must be after start date.');
          return;
        }

        let response;
        if (editingDiscount) {
            response = await adminAPI.updateDiscount(editingDiscount._id, payload);
            toast.success(response.data.message || 'Discount updated successfully!');
        } else {
            response = await adminAPI.createDiscount(payload);
            toast.success(response.data.message || 'Discount created successfully!');
        }
        
        setShowProductDiscountModal(false);
        resetProductDiscountForm();
        loadDiscounts(); // Reload list
    } catch (error) {
        console.error('Discount submission error:', error);
        toast.error(error.response?.data?.message || 'Failed to save discount');
    }
  };

  const handleDeleteDiscount = async (discountId) => {
    if (!window.confirm('Are you sure you want to delete this product/category discount?')) return;
    
    try {
      await adminAPI.deleteDiscount(discountId);
      toast.success('Discount deleted successfully');
      loadDiscounts();
    } catch (error) {
      toast.error('Failed to delete discount');
    }
  };

  const resetBulkForm = () => {
    setBulkData({
      name: '',
      description: '',
      percentage: '',
      startDate: '',
      endDate: '',
    });
  };
  
  const resetProductDiscountForm = () => {
    setEditingDiscount(null);
    setProductDiscountData({
      name: '',
      type: 'percentage',
      value: '',
      scope: 'product',
      productId: '',
      category: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  const toTS = (date) => new Date(date).getTime();

  const isSiteBulkValid = (config) => {
    if (!config || !config.active || !config.startDate || !config.endDate) return false;
    const now = Date.now();
    return toTS(config.startDate) <= now && toTS(config.endDate) >= now;
  };

  // ✅ Make "active" rely on time window; default to true if isActive is missing.
  const isActiveDiscount = (discount) => {
    const now = Date.now();
    const start = toTS(discount.startDate);
    const end = toTS(discount.endDate);
    const flag = discount.isActive !== undefined ? !!discount.isActive : true;
    return flag && now >= start && now <= end;
  };

  const handleDownloadDiscountsReport = () => {
    try {
      toast.loading('Generating report...');
      const allDiscounts = siteBulkDiscount.active ? [...discounts, {
        ...siteBulkDiscount, 
        name: `SITE-WIDE: ${siteBulkDiscount.name}`,
        type: 'percentage',
        value: siteBulkDiscount.percent,
        scope: 'All Products',
        isActive: isSiteBulkValid(siteBulkDiscount)
      }] : discounts;

      const csvContent = generateDiscountsCSV(allDiscounts);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      downloadBlob(blob, `discounts-report-${new Date().toISOString().split('T')[0]}.csv`);
      toast.dismiss();
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to download report');
    }
  };
  
  const generateDiscountsCSV = (discounts) => {
    const headers = ['Name', 'Type', 'Value', 'Scope', 'Start Date', 'End Date', 'Status'];
    const rows = discounts.map(d => [
      d.name,
      d.type,
      d.type === 'percentage' ? `${d.value || d.percent}%` : `Rs. ${d.value}`, 
      d.scope,
      new Date(d.startDate).toLocaleDateString(),
      new Date(d.endDate).toLocaleDateString(),
      isActiveDiscount(d) ? 'Active' : 'Inactive'
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

  const getSiteBulkStatus = () => {
      if (!siteBulkDiscount || !siteBulkDiscount.active) return { text: 'Inactive', variant: 'danger' };
      if (isSiteBulkValid(siteBulkDiscount)) return { text: 'Active', variant: 'success' };
      if (new Date(siteBulkDiscount.startDate) > Date.now()) return { text: 'Scheduled', variant: 'warning' };
      return { text: 'Expired', variant: 'danger' };
  }
  
  const siteBulkStatus = getSiteBulkStatus();

  // ---------- ✅ FIXED COUNTS (no other UI/logic changed) ----------
  const nowTS = Date.now();
  const hasPersistedSiteBulk = Boolean(siteBulkDiscount && (siteBulkDiscount._id || siteBulkDiscount.id));
  const activeProductsCount = discounts.filter(d => isActiveDiscount(d)).length;
  const activeCount = activeProductsCount + (hasPersistedSiteBulk && isSiteBulkValid(siteBulkDiscount) ? 1 : 0);
  const totalCount = discounts.length + (hasPersistedSiteBulk ? 1 : 0);
  // Expired should be purely by time window (don’t require d.isActive)
  const expiredCount = discounts.filter(d => toTS(d.endDate) < nowTS).length;
  // ----------------------------------------------------------------

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discount Management</h1>
            <p className="text-gray-600 mt-1">Create and manage product and site-wide discounts</p>
          </div>
          <button
            onClick={() => handleDownloadDiscountsReport()}
            className="btn-secondary flex items-center gap-2"
          >
            <Tag size={18} />
            Download Report
          </button>
        </div>

        {/* ⭐️ Site-wide Bulk Discount Card (Simplified) */}
        {siteBulkDiscount && (
            <div className={`card ${isSiteBulkValid(siteBulkDiscount) ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-200'} border-2`}>
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                            <Zap size={24} className="text-white" />
                        </div>
                        {/* ⭐️ Simplified Title */}
                        <h2 className="text-xl font-bold text-gray-900">
                            Apply Bulk Discount
                        </h2>
                    </div>
                    
                    {/* Retain Action Buttons on the right */}
                    {siteBulkDiscount.active && (
                    <div className="flex space-x-2">
                        <button
                            onClick={handleEditBulkDiscount}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Discount"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={handleDeleteBulkDiscount}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Deactivate Discount"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    )}
                </div>
            </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-between">
            <button
                onClick={() => {
                    resetProductDiscountForm();
                    setShowProductDiscountModal(true);
                }}
                className="btn-secondary flex items-center space-x-2"
            >
                <Plus size={18} />
                <span>Create Product Discount</span>
            </button>
            <button
                onClick={() => {
                    resetBulkForm();
                    setShowBulkModal(true);
                }}
                className="btn-primary flex items-center space-x-2"
            >
                <Zap size={18} />
                <span>Apply Bulk Discount</span>
            </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-green-50">
            <p className="text-sm text-gray-600">Active Discounts</p>
            <p className="text-2xl font-bold text-green-600">
              {activeCount}
            </p>
          </div>
          <div className="card bg-blue-50">
            <p className="text-sm text-gray-600">Total Discounts</p>
            <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
          </div>
          <div className="card bg-orange-50">
            <p className="text-sm text-gray-600">Expired Discounts</p>
            <p className="text-2xl font-bold text-orange-600">
              {expiredCount}
            </p>
          </div>
        </div>

        {/* ⭐️ Product/Category Discounts List (Accordion Style) */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between mb-4 px-6 pt-6">
            <h3 className="text-lg font-semibold">Product/Category Discounts ({discounts.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {discounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Tag size={48} className="mx-auto mb-2 text-gray-400" />
                No product/category specific discounts created yet
              </div>
            ) : (
              discounts.map((discount) => (
                <DiscountAccordionItem
                  key={discount._id}
                  discount={discount}
                  isActiveDiscount={isActiveDiscount}
                  handleDelete={handleDeleteDiscount}
                  handleEdit={handleEditDiscount}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bulk Discount Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => {
          setShowBulkModal(false);
          resetBulkForm();
        }}
        title={siteBulkDiscount && siteBulkDiscount.active ? "Edit Site-Wide Bulk Discount" : "Apply Bulk Discount to All Products"}
        size="md"
      >
        <form onSubmit={handleCreateOrUpdateBulkDiscount} className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Warning:</strong> This will <strong>overwrite</strong> the current site-wide discount configuration.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Name *
            </label>
            <input
              type="text"
              required
              value={bulkData.name}
              onChange={(e) => setBulkData({ ...bulkData, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Holiday Sale 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Percentage * (1-100)
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                max="100"
                value={bulkData.percentage}
                onChange={(e) => setBulkData({ ...bulkData, percentage: e.target.value })}
                className="input-field pr-8"
                placeholder="10"
              />
              <span className="absolute right-3 top-3 text-gray-500">%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={bulkData.startDate}
                onChange={(e) => setBulkData({ ...bulkData, startDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                required
                value={bulkData.endDate}
                onChange={(e) => setBulkData({ ...bulkData, endDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={bulkData.description}
              onChange={(e) => setBulkData({ ...bulkData, description: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Optional description of this discount..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowBulkModal(false);
                resetBulkForm();
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center space-x-2">
              <Zap size={18} />
              <span>{siteBulkDiscount && siteBulkDiscount.active ? 'Update Discount' : 'Apply to All Products'}</span>
            </button>
          </div>
        </form>
      </Modal>
      
      {/* ⭐️ NEW Modal for Product/Category Discount CRUD */}
      <Modal
        isOpen={showProductDiscountModal}
        onClose={() => {
          setShowProductDiscountModal(false);
          resetProductDiscountForm();
        }}
        title={editingDiscount ? `Edit Discount: ${editingDiscount.name}` : "Create New Product/Category Discount"}
        size="lg"
      >
        <form onSubmit={handleCreateOrUpdateDiscount} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Name *</label>
                <input
                    type="text"
                    required
                    value={productDiscountData.name}
                    onChange={(e) => setProductDiscountData({ ...productDiscountData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Summer Clearance on Laptops"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type *</label>
                    <select
                        value={productDiscountData.type}
                        onChange={(e) => setProductDiscountData({ ...productDiscountData, type: e.target.value })}
                        className="input-field capitalize"
                    >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed ($)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Value * ({productDiscountData.type === 'percentage' ? '1-100' : 'Amount'})
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            required
                            min="1"
                            max={productDiscountData.type === 'percentage' ? '100' : undefined}
                            value={productDiscountData.value}
                            onChange={(e) => setProductDiscountData({ ...productDiscountData, value: e.target.value })}
                            className="input-field pr-8"
                            placeholder={productDiscountData.type === 'percentage' ? '15' : '50'}
                        />
                        <span className="absolute right-3 top-3 text-gray-500">
                            {productDiscountData.type === 'percentage' ? '%' : '$'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Scope Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Scope *</label>
                <select
                    value={productDiscountData.scope}
                    onChange={(e) => setProductDiscountData({ ...productDiscountData, scope: e.target.value })}
                    className="input-field capitalize"
                >
                    <option value="product">Specific Product</option>
                    <option value="category">Product Category</option>
                </select>
            </div>

            {/* Scope Target Input */}
            {productDiscountData.scope === 'product' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Target ID *</label>
                    {/* NOTE: This should ideally be a searchable dropdown of products */}
                    <input
                        type="text"
                        required
                        value={productDiscountData.productId}
                        onChange={(e) => setProductDiscountData({ ...productDiscountData, productId: e.target.value })}
                        className="input-field"
                        placeholder="Enter Product ID or select from dropdown"
                    />
                </div>
            )}
            {productDiscountData.scope === 'category' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                        required
                        value={productDiscountData.category}
                        onChange={(e) => setProductDiscountData({ ...productDiscountData, category: e.target.value })}
                        className="input-field capitalize"
                    >
                        <option value="">Select Category</option>
                        <option value="laptops">Laptops</option>
                        <option value="smartphones">Smartphones</option>
                        <option value="wearables">Wearables</option>
                        <option value="tablets">Tablets</option>
                        <option value="accessories">Accessories</option>
                    </select>
                </div>
            )}
            
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                        type="date"
                        required
                        value={productDiscountData.startDate}
                        onChange={(e) => setProductDiscountData({ ...productDiscountData, startDate: e.target.value })}
                        className="input-field"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                    <input
                        type="date"
                        required
                        value={productDiscountData.endDate}
                        onChange={(e) => setProductDiscountData({ ...productDiscountData, endDate: e.target.value })}
                        className="input-field"
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                    value={productDiscountData.description}
                    onChange={(e) => setProductDiscountData({ ...productDiscountData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Optional description..."
                />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={() => {
                        setShowProductDiscountModal(false);
                        resetProductDiscountForm();
                    }}
                    className="btn-secondary"
                >
                    Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center space-x-2">
                    <Tag size={18} />
                    <span>{editingDiscount ? 'Update Discount' : 'Create Discount'}</span>
                </button>
            </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminDiscounts;
