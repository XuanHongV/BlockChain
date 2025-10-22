import React, { useState } from 'react';
import { Search, Filter, Activity, CheckCircle, Clock, XCircle, Hash } from 'lucide-react';
import { Transaction } from '../../types';

const sampleTransactions: Transaction[] = [
  {
    id: 'TXN-001',
    type: 'transfer',
    from: 'Colombian Coffee Co.',
    to: 'Premium Foods Ltd.',
    productId: 'PRD-2847',
    timestamp: '2024-12-27T10:30:00Z',
    blockchainHash: '0x7f5e4d3c2b1a9876543210fedcba0123456789abcdef',
    gasUsed: 21000,
    status: 'confirmed'
  },
  {
    id: 'TXN-002',
    type: 'verification',
    from: 'BioPharm Solutions',
    to: 'FDA Verification',
    productId: 'PRD-2846',
    timestamp: '2024-12-27T09:15:00Z',
    blockchainHash: '0x1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d',
    gasUsed: 45000,
    status: 'confirmed'
  },
  {
    id: 'TXN-003',
    type: 'certification',
    from: 'TechComponents Ltd.',
    to: 'CE Marking Authority',
    productId: 'PRD-2845',
    timestamp: '2024-12-27T08:45:00Z',
    blockchainHash: '0x9d2c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f',
    gasUsed: 32000,
    status: 'pending'
  },
  {
    id: 'TXN-004',
    type: 'transfer',
    from: 'Manufacturing Plant',
    to: 'Distribution Center',
    productId: 'PRD-2844',
    timestamp: '2024-12-27T07:20:00Z',
    blockchainHash: '0x3e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
    gasUsed: 28000,
    status: 'confirmed'
  },
  {
    id: 'TXN-005',
    type: 'verification',
    from: 'Quality Assurance',
    to: 'Compliance Department',
    productId: 'PRD-2843',
    timestamp: '2024-12-27T06:10:00Z',
    blockchainHash: '0x8b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    gasUsed: 15000,
    status: 'failed'
  }
];

export const BlockchainLog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = sampleTransactions.filter(transaction => {
    const matchesSearch = transaction.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.blockchainHash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'pending': return Clock;
      case 'failed': return XCircle;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'transfer': return 'bg-blue-100 text-blue-800';
      case 'verification': return 'bg-purple-100 text-purple-800';
      case 'certification': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Blockchain Transaction Log</h2>
        <p className="text-gray-600">Immutable record of all supply chain transactions on the blockchain</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by hash, product ID, or party..."
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="transfer">Transfer</option>
                <option value="verification">Verification</option>
                <option value="certification">Certification</option>
              </select>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Transaction</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Type</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">From → To</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Product ID</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Time</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Gas Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => {
                const StatusIcon = getStatusIcon(transaction.status);
                
                return (
                  <tr 
                    key={transaction.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Hash className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.id}</p>
                          <p className="text-xs text-gray-500 font-mono">
                            {transaction.blockchainHash.slice(0, 16)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <p className="text-gray-900">{transaction.from}</p>
                        <p className="text-gray-500">↓ {transaction.to}</p>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className="text-sm font-mono text-blue-600">{transaction.productId}</span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`h-4 w-4 ${getStatusColor(transaction.status).split(' ')[0]}`} />
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </td>
                    
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {transaction.gasUsed.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction Details</h2>
                  <p className="text-gray-600">{selectedTransaction.id}</p>
                </div>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Blockchain Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Transaction Hash:</span>
                    <code className="text-sm bg-white px-2 py-1 rounded border">{selectedTransaction.blockchainHash}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Block Timestamp:</span>
                    <span className="text-sm">{new Date(selectedTransaction.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Gas Used:</span>
                    <span className="text-sm">{selectedTransaction.gasUsed.toLocaleString()} gas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Transaction Details</h3>
                  <div className="space-y-3 text-sm">
                    <div><span className="font-medium">Type:</span> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedTransaction.type)}`}>
                        {selectedTransaction.type}
                      </span>
                    </div>
                    <div><span className="font-medium">Product ID:</span> <span className="font-mono text-blue-600">{selectedTransaction.productId}</span></div>
                    <div><span className="font-medium">From:</span> {selectedTransaction.from}</div>
                    <div><span className="font-medium">To:</span> {selectedTransaction.to}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Network Information</h3>
                  <div className="space-y-3 text-sm">
                    <div><span className="font-medium">Network:</span> Ethereum Mainnet</div>
                    <div><span className="font-medium">Confirmations:</span> {selectedTransaction.status === 'confirmed' ? '12+' : '0'}</div>
                    <div><span className="font-medium">Gas Price:</span> 20 Gwei</div>
                    <div><span className="font-medium">Transaction Fee:</span> 0.0004 ETH</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Verification</h3>
                <p className="text-sm text-gray-600">
                  This transaction has been cryptographically verified and recorded on the blockchain. 
                  The immutable nature of blockchain technology ensures this record cannot be altered or tampered with.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};