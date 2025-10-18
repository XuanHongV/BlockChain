import React from 'react';
import { Package, Users, Activity, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { MetricCard } from './MetricCard';

export const Dashboard: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Supply Chain Dashboard</h2>
        <p className="text-gray-600">Real-time overview of your blockchain-secured supply chain</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Products"
          value="2,847"
          change="+12% this month"
          changeType="positive"
          icon={Package}
          color="blue"
        />
        <MetricCard
          title="Active Suppliers"
          value="156"
          change="+8 new this week"
          changeType="positive"
          icon={Users}
          color="green"
        />
        <MetricCard
          title="Blockchain Transactions"
          value="18,423"
          change="+125 today"
          changeType="positive"
          icon={Activity}
          color="purple"
        />
        <MetricCard
          title="Compliance Rate"
          value="98.7%"
          change="+0.3% improvement"
          changeType="positive"
          icon={Shield}
          color="yellow"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Supply Chain Flow Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Supply Chain Flow</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-8 mb-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium">Suppliers</span>
                  <span className="text-xs text-gray-500">156 active</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium">Manufacturing</span>
                  <span className="text-xs text-gray-500">2,847 products</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-2">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium">Distribution</span>
                  <span className="text-xs text-gray-500">18,423 transactions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Temperature Alert</p>
                <p className="text-xs text-gray-600">Product ID: PRD-2847 exceeded temperature threshold</p>
                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Verification Failed</p>
                <p className="text-xs text-gray-600">Supplier verification pending for SUP-156</p>
                <p className="text-xs text-gray-400 mt-1">4 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New Contract Deployed</p>
                <p className="text-xs text-gray-600">Quality assurance contract QA-v2.1</p>
                <p className="text-xs text-gray-400 mt-1">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Blockchain Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Transaction Hash</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Product ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { hash: '0x7f5e...a2d1', type: 'Transfer', productId: 'PRD-2847', status: 'Confirmed', time: '2 min ago' },
                { hash: '0x1a9b...f3c4', type: 'Verification', productId: 'PRD-2846', status: 'Confirmed', time: '8 min ago' },
                { hash: '0x9d2c...e5f6', type: 'Certification', productId: 'PRD-2845', status: 'Pending', time: '15 min ago' },
                { hash: '0x3e7f...b8a9', type: 'Transfer', productId: 'PRD-2844', status: 'Confirmed', time: '22 min ago' },
              ].map((tx, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{tx.hash}</code>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">{tx.type}</td>
                  <td className="py-3 px-4 text-sm font-medium text-blue-600">{tx.productId}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      tx.status === 'Confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{tx.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};