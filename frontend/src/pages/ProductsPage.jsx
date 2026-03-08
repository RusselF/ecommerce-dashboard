import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import Layout from '../components/layout/Layout'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Search, Pencil, Trash2, ShoppingCart } from 'lucide-react'

export default function ProductsPage() {
  const { isAdmin } = useAuth()
  const { addItem } = useCart()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', image_url: '', category_id: '' })

  const fetchProducts = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (categoryFilter) params.category_id = categoryFilter
      const { data } = await api.get('/products', { params })
      setProducts(data.products)
    } catch {
      toast.error('Gagal memuat produk')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    const { data } = await api.get('/categories')
    setCategories(data)
  }

  useEffect(() => { fetchCategories() }, [])
  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 300)
    return () => clearTimeout(timeout)
  }, [search, categoryFilter])

  const openCreate = () => {
    setEditProduct(null)
    setForm({ name: '', description: '', price: '', stock: '', image_url: '', category_id: '' })
    setShowModal(true)
  }

  const openEdit = (product) => {
    setEditProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      image_url: product.image_url || '',
      category_id: product.category_id || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, form)
        toast.success('Produk diupdate!')
      } else {
        await api.post('/products', form)
        toast.success('Produk ditambahkan!')
      }
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan produk')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus produk ini?')) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Produk dihapus!')
      fetchProducts()
    } catch {
      toast.error('Gagal menghapus produk')
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="input pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-48"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No products found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product.id} className="card flex flex-col">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover rounded-lg mb-3" />
              ) : (
                <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">No image</div>
              )}
              <div className="flex-1">
                <p className="text-xs text-blue-500 mb-1">{product.category_name || 'Uncategorized'}</p>
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-600">Rp {Number(product.price).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                </div>
                <div className="flex gap-2">
                  {isAdmin ? (
                    <>
                      <button onClick={() => openEdit(product)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { addItem(product); toast.success('Added to cart!') }}
                      disabled={product.stock === 0}
                      className="btn-primary flex items-center gap-1.5 text-sm py-1.5"
                    >
                      <ShoppingCart size={14} />
                      {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input type="number" className="input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input type="number" className="input" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input className="input" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="input" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                  <option value="">No Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}