import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import DashboardPage from './pages/DashboardPage'
const Placeholder = ({ title }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-gray-500 mt-2">Coming soon...</p>
  </div>
)

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Route>
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/products" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}