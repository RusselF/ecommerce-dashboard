import { useNavigate } from 'react-router-dom'
import { LogIn, X } from 'lucide-react'

export default function LoginModal({ onClose }) {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LogIn size={24} className="text-blue-600" />
        </div>

        <h2 className="text-xl font-bold mb-2">Login Required</h2>
        <p className="text-gray-500 text-sm mb-6">
          Please login or create an account to add items to cart and checkout.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/login')}
            className="btn-primary w-full"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Don't have an account? <span className="text-blue-600 font-medium">Register</span>
          </button>
        </div>
      </div>
    </div>
  )
}