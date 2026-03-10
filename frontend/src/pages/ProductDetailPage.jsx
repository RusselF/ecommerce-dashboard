import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import Layout from '../components/layout/Layout'
import LoginModal from '../components/common/LoginModal'
import api from '../services/api'
import toast from 'react-hot-toast'
import { ShoppingCart, ArrowLeft, Package } from 'lucide-react'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => toast.error('Produk tidak ditemukan'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <Layout>
      <div className="animate-pulse max-w-4xl mx-auto">
        <div className="h-4 bg-gray-200 rounded w-24 mb-6" />
        <div className="grid grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    </Layout>
  )

  if (!product) return (
    <Layout>
      <div className="text-center py-24 text-gray-500">Produk tidak ditemukan</div>
    </Layout>
  )

  return (
    <Layout>
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back to Products
      </button>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="rounded-xl overflow-hidden bg-gray-100 h-96">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package size={64} className="opacity-20" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">
            {product.category_name || 'Uncategorized'}
          </p>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{product.name}</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-blue-600">
              Rp {Number(product.price).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              product.stock === 0 ? 'bg-red-100 text-red-600' :
              product.stock < 5 ? 'bg-yellow-100 text-yellow-600' :
              'bg-green-100 text-green-600'
            }`}>
              {product.stock === 0 ? 'Out of Stock' :
               product.stock < 5 ? `Low Stock (${product.stock} left)` :
               `In Stock (${product.stock})`}
            </span>
          </div>

          {!isAdmin && (
            <button
              onClick={() => {
                if (!user) { setShowLoginModal(true); return }
                addItem(product)
                toast.success('Added to cart!')
              }}
              disabled={product.stock === 0}
              className="btn-primary flex items-center justify-center gap-2 py-3 mt-auto"
            >
              <ShoppingCart size={18} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </Layout>
  )
}