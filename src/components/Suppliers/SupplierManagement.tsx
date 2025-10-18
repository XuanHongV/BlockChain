import React, { useState } from 'react';
import { Search, Filter, Star, MapPin, Calendar, Users, Award, AlertCircle } from 'lucide-react';
import { Supplier } from '../../types';

const sampleSuppliers: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Colombian Coffee Co.',
    location: 'Medellín, Colombia',
    trustScore: 94,
    certifications: ['Organic', 'Fair Trade', 'ISO 9001'],
    productsSupplied: 1247,
    status: 'verified',
    joinDate: '2022-03-15',
    avatar: 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'SUP-002',
    name: 'BioPharm Solutions',
    location: 'Frankfurt, Germany',
    trustScore: 98,
    certifications: ['GMP Certified', 'FDA Approved', 'ISO 13485', 'ISO 14001'],
    productsSupplied: 892,
    status: 'verified',
    joinDate: '2021-11-08',
    avatar: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'SUP-003',
    name: 'TechComponents Ltd.',
    location: 'Taipei, Taiwan',
    trustScore: 87,
    certifications: ['RoHS Compliant', 'CE Marked'],
    productsSupplied: 2156,
    status: 'verified',
    joinDate: '2023-01-22',
    avatar: 'https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'SUP-004',
    name: 'Pacific Seafood Supply',
    location: 'Seattle, USA',
    trustScore: 72,
    certifications: ['MSC Certified', 'HACCP'],
    productsSupplied: 634,
    status: 'pending',
    joinDate: '2024-12-01',
    avatar: 'https://images.pexels.com/photos/4226269/pexels-photo-4226269.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export const SupplierManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = sampleSuppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || supplier.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Supplier Management</h2>
        <p className="text-gray-600">Manage and verify suppliers across your supply chain network</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search suppliers by name or location..."
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
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
            
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Add Supplier
            </button>
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <img
                  src={supplier.avatar}
                  alt={supplier.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{supplier.name}</h3>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{supplier.location}</span>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(supplier.status)}`}>
                      {supplier.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getTrustScoreColor(supplier.trustScore)} mb-2`}>
                    <Star className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{supplier.trustScore}</p>
                  <p className="text-xs text-gray-500">Trust Score</p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mb-2">
                    <Users className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{supplier.productsSupplied.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Products</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(supplier.joinDate).toLocaleDateString()}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {supplier.certifications.slice(0, 2).map((cert) => (
                    <span key={cert} className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded">
                      <Award className="h-3 w-3" />
                      <span>{cert}</span>
                    </span>
                  ))}
                  {supplier.certifications.length > 2 && (
                    <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{supplier.certifications.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedSupplier(supplier)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  View Details
                </button>
                
                {supplier.status === 'pending' && (
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Verification Needed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedSupplier.avatar}
                    alt={selectedSupplier.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedSupplier.name}</h2>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedSupplier.location}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
                    <Star className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{selectedSupplier.trustScore}</p>
                  <p className="text-sm text-gray-600">Trust Score</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-3">
                    <Users className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{selectedSupplier.productsSupplied.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Products Supplied</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-3">
                    <Award className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{selectedSupplier.certifications.length}</p>
                  <p className="text-sm text-gray-600">Certifications</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Certifications & Compliance</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedSupplier.certifications.map((cert) => (
                    <div key={cert} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Supplier Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Supplier ID:</span> {selectedSupplier.id}</div>
                  <div><span className="font-medium">Join Date:</span> {new Date(selectedSupplier.joinDate).toLocaleDateString()}</div>
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedSupplier.status)}`}>
                      {selectedSupplier.status}
                    </span>
                  </div>
                  <div><span className="font-medium">Location:</span> {selectedSupplier.location}</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Contact Supplier
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Manage Products
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};