import React, { useState } from 'react';
import { CreateShipmentForm } from './CreateShipmentForm';
import { Search, Filter, MapPin, Clock, Thermometer, Shield, Package, Eye } from 'lucide-react';
import { Product } from '../../types';

const sampleProducts: Product[] = [
  {
    id: 'PRD-2847',
    name: 'Organic Coffee Beans',
    category: 'Food & Beverage',
    origin: 'Colombia',
    currentLocation: 'Distribution Center, Miami',
    status: 'in-transit',
    supplier: 'Colombian Coffee Co.',
    manufacturer: 'Premium Foods Ltd.',
    timestamp: '2024-12-27T10:30:00Z',
    blockchainHash: '0x7f5e...a2d1',
    certifications: ['Organic', 'Fair Trade', 'Rainforest Alliance'],
    temperature: 22,
    humidity: 65
  },
  {
    id: 'PRD-2846',
    name: 'Pharmaceutical Vaccines',
    category: 'Healthcare',
    origin: 'Germany',
    currentLocation: 'Cold Storage, New York',
    status: 'verified',
    supplier: 'BioPharm Solutions',
    manufacturer: 'MedTech Industries',
    timestamp: '2024-12-27T09:15:00Z',
    blockchainHash: '0x1a9b...f3c4',
    certifications: ['FDA Approved', 'GMP Certified', 'ISO 13485'],
    temperature: 4,
    humidity: 45
  },
  {
    id: 'PRD-2845',
    name: 'Electronic Components',
    category: 'Technology',
    origin: 'Taiwan',
    currentLocation: 'Manufacturing Plant, California',
    status: 'processing',
    supplier: 'TechComponents Ltd.',
    manufacturer: 'Silicon Valley Manufacturing',
    timestamp: '2024-12-27T08:45:00Z',
    blockchainHash: '0x9d2c...e5f6',
    certifications: ['RoHS Compliant', 'CE Marked'],
    temperature: 25,
    humidity: 40
  }
];

export const ProductTracking: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredProducts = sampleProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Tracking</h2>
        <p className="text-gray-600">Monitor products throughout the supply chain with blockchain verification</p>
      </div>
{/* ====================================================== */}
      {/* 2. HIỂN THỊ FORM TẠO LÔ HÀNG */}
      {/* ====================================================== */}
      <div className="mb-6"> {/* Thêm khoảng cách dưới form */}
        <CreateShipmentForm /> 
      </div>
      {/* ====================================================== */}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by product name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="in-transit">In Transit</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                  {product.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{product.currentLocation}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">ID: {product.id}</span>
                </div>

                {product.temperature && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Thermometer className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{product.temperature}°C, {product.humidity}% humidity</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Blockchain Verified</span>
                </div>
                
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span className="text-sm font-medium">View Details</span>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-1">
                  {product.certifications.slice(0, 2).map((cert) => (
                    <span key={cert} className="inline-flex px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                      {cert}
                    </span>
                  ))}
                  {product.certifications.length > 2 && (
                    <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{product.certifications.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2>
                  <p className="text-gray-600">{selectedProduct.category}</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">ID:</span> {selectedProduct.id}</div>
                    <div><span className="font-medium">Origin:</span> {selectedProduct.origin}</div>
                    <div><span className="font-medium">Current Location:</span> {selectedProduct.currentLocation}</div>
                    <div><span className="font-medium">Supplier:</span> {selectedProduct.supplier}</div>
                    <div><span className="font-medium">Manufacturer:</span> {selectedProduct.manufacturer}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Blockchain Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Hash:</span> <code className="bg-gray-100 px-1 rounded">{selectedProduct.blockchainHash}</code></div>
                    <div><span className="font-medium">Status:</span> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedProduct.status)}`}>
                        {selectedProduct.status}
                      </span>
                    </div>
                    <div><span className="font-medium">Last Updated:</span> {new Date(selectedProduct.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.certifications.map((cert) => (
                    <span key={cert} className="inline-flex px-3 py-1 text-sm bg-green-50 text-green-700 rounded-lg border border-green-200">
                      <Shield className="h-4 w-4 mr-1" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {selectedProduct.temperature && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Environmental Conditions</h3>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-4 w-4 text-blue-500" />
                      <span>Temperature: {selectedProduct.temperature}°C</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Humidity: {selectedProduct.humidity}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};