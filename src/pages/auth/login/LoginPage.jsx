import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MailIcon, LockIcon, Shield } from "lucide-react";
import logo from "@/assets/companyLogo/logo_crop_no_bg.png";
import logo2 from "@/assets/companyLogo/logo_without_bg.png";
import logo3 from "@/assets/companyLogo/H logo with BG.png";

import odlGif from "/odl.gif";
import LazyImage from "@/utils/LazyImage";

import { useLoginMutation } from "@/redux/features/auth/authApiSlice";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/features/auth/authSlice";
import { FloatingInput } from "@/component/FloatiingInput";
import { CustomCheckbox } from "@/component/CustomCheckbox";
import { toast } from "@/component/Toast";
import { primaryButtonBg } from "@/constant/className";
import { companyName } from "@/constant/companyInfo";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await login({ email, password }).unwrap();
      toast.success("Success!", "Log in Successfully", 2000);
      dispatch(setUser({ user: res.user, rememberMe })); // Save user data to Redux store
      // console.log(res);
      //

      if (res?.user?.isUpdated) {
        navigate(from, { replace: true });
      } else {
        // navigate("/complete-profile", { replace: true });
        if (res?.user?.role === "Admin") {
          // Admins can skip completing profile
          navigate("/", { replace: true });
        } else {
          // Other users must complete their profile
          navigate("/complete-profile", { replace: true });
        }
      }

      // console.log("Login attempt with:", { email, password, rememberMe });
    } catch (error) {
      toast.error("Login failed!", error?.data?.error, 5000);
      // console.log("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8f4f1] via-white to-[#f4f1ee]">
      {/* Main container */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-center overflow-hidden rounded-3xl lg:shadow-xl">
        {/* Left side - Nature-themed panel (hidden on <lg) */}
        <div className="w-full hidden lg:block md:w-5/12 bg-black relative overflow-hidden">
          {/* Background image with natural overlay */}
          <div className="absolute inset-0 top-[20%]">
            <img
              src={logo2}
              alt="Tree Background"
              className="w-full object-center opacity-50"
            />

            {/* Natural texture overlay */}
            <div className="absolute inset-0 "></div>
          </div>

          {/* Content container */}
          <div className="relative h-full flex flex-col p-8 text-white z-10">
            {/* Logo section */}
            <div className="mb-auto">
              <div className="flex items-center space-x-3">
                <div className="bg-white/50 backdrop-blur-md p-2 rounded-xl">
                  <LazyImage
                    // src={odlGif}
                    src={logo}
                    imgClass="w-10 h-auto animate-pulse"
                    alt="Monkey Mans Logo"
                  />
                </div>
                <h2 className="text-xl font-bold tracking-tight">
                  {companyName}
                </h2>
              </div>
            </div>

            {/* Centered showcase content */}
            <div className="my-12 flex flex-col items-center">
              {/* <div className="mb-6">
                <TreePine size={60} className="text-white/90" />
              </div> */}

              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
                Powering Your <br />{" "}
                <span className="text-2xl md:text-3xl">Digital Future</span>
              </h1>

              <p className="text-white/80 text-center max-w-md mb-8">
                Your trusted partner for expert digital solutions, strategy, and
                innovation. Join our platform for seamless project and service
                management.
              </p>

              {/* Feature highlights */}
              <div className="w-full max-w-xs space-y-4">
                {[
                  "Transforming Ideas into Digital Realities",
                  "Experienced developers & strategists",
                  "Secure & scalable solutions",
                  "Modern, sustainable technologies",
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg"
                  >
                    <Shield size={16} className="text-white/90" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom section */}
            <div className="mt-auto text-center text-white/60 text-xs">
              Committed to excellence since 2025
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3b7a47]/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3b7a47]/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

          {/* Leaf patterns */}
          {/* <div className="absolute top-10 left-10 opacity-20">
            <TreePine size={40} />
          </div>
          <div className="absolute bottom-20 right-10 opacity-20">
            <TreePine size={30} />
          </div> */}
        </div>

        {/* Right side - Login form with clean design, centered on <lg */}
        <div className="w-full lg:w-7/12 lg:bg-white px-8 py-12 flex flex-col justify-center items-center">
          <div className=" mx-auto w-full flex flex-col items-center">
            {" "}
            {/* Form header */}
            {/* Logo for all screen sizes, centered */}
            <div className="mb-6 flex flex-col items-center">
              <LazyImage
                src={logo3}
                imgClass="w-[200px]"
                alt="Monkey Mans Logo"
              />
            </div>
            <div className="mb-8 text-center w-full">
              <h2 className="text-2xl font-bold text-gray-800">
                Sign in to your account
              </h2>
              <p className="text-gray-500 mt-1">
                Access your workspace and manage services
              </p>
            </div>
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-md">
              {/* Email field */}
              <div className="relative">
                <FloatingInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  icon={<MailIcon className="h-5 w-5 text-primary" />}
                />
              </div>

              {/* Password field */}
              <div className="relative">
                <FloatingInput
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  icon={<LockIcon className="h-5 w-5 text-primary" />}
                />
              </div>

              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CustomCheckbox
                    label="Remember me"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#2a5834] hover:text-[#3b7a47] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign in button */}
              <button
                type="submit"
                disabled={isLoading || loginLoading}
                className={`w-full relative flex items-center justify-center bg-primary py-3 px-4 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group`}
              >
                <span className="relative flex items-center">
                  {isLoading || loginLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : null}
                  Sign in to Account
                </span>
              </button>

              {/* Registration link
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link 
                    to="/register" 
                    className="font-medium text-[#2a5834] hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </div> */}

              {/* Security badges */}
              <div className="flex items-center justify-center space-x-4 mt-8">
                {/* <div className="flex items-center text-xs text-gray-500">
                  <Shield size={14} className="mr-1.5 text-[#2a5834]" />
                  <span>Secure Login</span>
                </div> */}
                {/* <div className="flex items-center text-xs text-gray-500">
                  <TreePine size={14} className="mr-1.5 text-[#2a5834]" />
                  <span>Environmental Focus</span>
                </div> */}
              </div>
            </form>
            {/* Copyright */}
            <div className="mt-8 text-center text-xs text-gray-400">
              © {new Date().getFullYear()} {companyName}. All rights reserved.
            </div>
          </div>
        </div>
      </div>

      {/* Custom animation keyframes */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }      `,
        }}
      />
    </div>
  );
}
