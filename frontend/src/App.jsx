import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

const Placeholder = ({ title }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-gray-500 mt-2">Coming soon...</p>
  </div>
)

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/products" element={<Placeholder title="Products" />} />
          <Route path="/cart" element={<Placeholder title="Cart" />} />
        </Route>
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
          <Route path="/orders" element={<Placeholder title="Orders" />} />
        </Route>
        <Route path="/" element={<Navigate to="/products" replace />} />
      </Routes>
    </AuthProvider>
  )
}