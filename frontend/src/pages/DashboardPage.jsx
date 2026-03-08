import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import api from '../services/api'
import { Users, ShoppingBag, DollarSign, ClipboardList } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const STATUS_COLORS = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><div className="text-center py-24 text-gray-500">Loading...</div></Layout>
  if (!stats) return <Layout><div className="text-center py-24 text-gray-500">Gagal memuat data</div></Layout>

  const totalOrders = stats.ordersByStatus.reduce((sum, s) => sum + Number(s.count), 0)
  const pieData = stats.ordersByStatus.map(s => ({ name: s.status, value: Number(s.count) }))
  const barData = stats.ordersByStatus.map(s => ({ status: s.status, orders: Number(s.count) }))

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users size={22} />}
          label="Total Users"
          value={stats.totalUsers}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={<ClipboardList size={22} />}
          label="Total Orders"
          value={totalOrders}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          icon={<DollarSign size={22} />}
          label="Total Revenue"
          value={`Rp ${Number(stats.totalRevenue).toLocaleString()}`}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={<ShoppingBag size={22} />}
          label="Delivered"
          value={stats.ordersByStatus.find(s => s.status === 'delivered')?.count || 0}
          color="bg-yellow-50 text-yellow-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="font-semibold mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Order Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h2 className="font-semibold mb-4">Recent Orders</h2>
        {stats.recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada orders</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="pb-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-sm font-mono text-gray-500">#{order.id.slice(0, 8)}</td>
                  <td className="py-3 text-sm text-gray-800">{order.user_name || 'Unknown'}</td>
                  <td className="py-3 text-sm font-semibold text-blue-600">Rp {Number(order.total).toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )
}