import { ShieldX, ArrowLeft, Home } from "lucide-react"
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <ShieldX className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h2>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {
            "You don't have permission to access this resource. Please contact your administrator if you believe this is an error."
          }
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="w-full border border-gray-300 hover:border-primary text-gray-700 hover:text-primary font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">Error Code: 403 | Unauthorized Access</p>
        </div>
      </div>
    </div>
  )
}
