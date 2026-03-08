import { useCart } from '../context/CartContext'
import Layout from '../components/layout/Layout'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CartPage() {
  const { items, total, removeItem, updateQty, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleCheckout = async () => {
    if (items.length === 0) return toast.error('Cart kosong!')
    setLoading(true)
    try {
      await api.post('/orders', {
        items: items.map(i => ({ product_id: i.id, quantity: i.qty }))
      })
      clearCart()
      toast.success('Order berhasil dibuat!')
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout gagal')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <ShoppingBag size={64} className="mb-4 opacity-30" />
          <p className="text-lg font-medium">Cart kamu kosong</p>
          <button onClick={() => navigate('/products')} className="btn-primary mt-4">
            Belanja Sekarang
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="card flex items-center gap-4">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">No image</div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-blue-600 font-medium">Rp {Number(item.price).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => item.qty === 1 ? removeItem(item.id) : updateQty(item.id, item.qty - 1)}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-medium">{item.qty}</span>
                <button
                  onClick={() => updateQty(item.id, item.qty + 1)}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="text-right min-w-[100px]">
                <p className="font-semibold">Rp {(Number(item.price) * item.qty).toLocaleString()}</p>
              </div>
              <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card h-fit">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span>{item.name} x{item.qty}</span>
                <span>Rp {(Number(item.price) * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span className="text-blue-600">Rp {Number(total).toLocaleString()}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Processing...' : 'Checkout'}
          </button>
          <button
            onClick={() => navigate('/products')}
            className="btn-secondary w-full mt-2"
          >
            Lanjut Belanja
          </button>
        </div>
      </div>
    </Layout>
  )
}