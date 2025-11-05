import Button from "@/component/Button";
import { useNavigate } from "react-router-dom";

const CompleteProfilePage = () => {
  const navigate = useNavigate();

  // console.log("object");

  const handleCompleteProfile = () => {
    navigate("/update-profile"); // Replace with your actual update profile route

  }

  const handleLogout = () => {
    localStorage.removeItem("MONKEY-MAN-USER")
    navigate("/login")
  }
  return (
  

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Icon Section */}
        <div className="mb-8">
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 shadow-lg"
            style={{ backgroundColor: "#8A6642" }}
          >
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          {/* Alert Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            Action Required
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Complete Your Profile</h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Please update your profile information before accessing the platform features.
          </p>

          {/* Feature List */}
          <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: "#8A6642" }}></div>
                <span>Secure access</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: "#8A6642" }}></div>
                <span>Team collaboration</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: "#8A6642" }}></div>
                <span>Personalized experience</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: "#8A6642" }}></div>
                <span>Full platform access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <Button
            onClick={handleCompleteProfile}
            className="w-full py-4 px-6 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Complete Profile
              </div>
            
          </Button>

          <button
            onClick={handleLogout}
            className="w-full py-3 px-6 text-gray-600 font-medium bg-white bg-opacity-70 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <a href="mailto:admin@haquedigital.com" className="font-medium hover:underline" style={{ color: "#8A6642" }}>
              Contact Support
            </a>
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-20 animate-pulse hidden lg:block"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-amber-200 rounded-full opacity-20 animate-pulse hidden lg:block"></div>
        <div className="absolute top-1/2 left-5 w-16 h-16 bg-yellow-200 rounded-full opacity-20 animate-pulse hidden md:block"></div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
