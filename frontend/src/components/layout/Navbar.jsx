import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { ShoppingCart, LayoutDashboard, Package, ClipboardList, LogOut, Tag } from 'lucide-react'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { count } = useCart()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg text-blue-600">ShopDash</span>
        <div className="flex items-center gap-4">
          <Link to="/products" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
            <Package size={16} /> Products
          </Link>
          <Link to="/cart" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors relative">
            <ShoppingCart size={16} />
            Cart
            {count > 0 && (
              <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          {isAdmin && (
            <>
              <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/orders" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <ClipboardList size={16} /> Orders
              </Link>
              <Link to="/categories" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <Tag size={16} /> Categories
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.name}</span>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  )
}