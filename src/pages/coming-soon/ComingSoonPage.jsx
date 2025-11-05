import { useState } from "react";

export default function ComingPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Geometric Wave Background */}
      <div className="absolute inset-0">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="wave-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#8A6642" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#8A6642" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#B8956A" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M0,400 C300,300 600,500 900,400 C1050,350 1150,400 1200,380 L1200,800 L0,800 Z"
            fill="url(#wave-gradient)"
            className="animate-wave-1"
          />
          <path
            d="M0,500 C300,400 600,600 900,500 C1050,450 1150,500 1200,480 L1200,800 L0,800 Z"
            fill="url(#wave-gradient)"
            className="animate-wave-2"
            opacity="0.7"
          />
          <path
            d="M0,600 C300,500 600,700 900,600 C1050,550 1150,600 1200,580 L1200,800 L0,800 Z"
            fill="url(#wave-gradient)"
            className="animate-wave-3"
            opacity="0.5"
          />
        </svg>

        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-20 w-16 h-16 border-2 border-primary/30 rotate-45 animate-spin-slow"></div>
        <div className="absolute top-40 right-32 w-12 h-12 bg-primary/20 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-40 left-32 w-20 h-20 border-2 border-[#B8956A]/30 animate-pulse"></div>
        <div className="absolute top-60 left-1/2 w-8 h-8 bg-primary/30 transform rotate-45 animate-float"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-slide-down">
            <div className="inline-flex items-center px-6 py-3 bg-primary/20 border border-primary/30 rounded-full mb-8">
              <span className="text-primary font-semibold tracking-wider">
                COMING SOON
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-black mb-6 leading-tight animate-slide-up">
            Something Amazing Is
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#B8956A] to-primary">
              Coming Soon
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-black mb-12 max-w-3xl mx-auto animate-fade-in-delay">
            We're working hard behind the scenes to build something incredible.
            Get ready to experience the future like never before.
          </p>

          <div className="max-w-lg mx-auto mb-16 animate-slide-up-delay">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 bg-white/5 border border-white/20 rounded-xl text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm transition-all duration-300"
              />
              <button className="px-8 py-4 bg-gradient-to-r from-primary to-[#B8956A] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transform hover:scale-105 transition-all duration-300">
                Get Notified
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes wave-1 {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-50px);
          }
        }

        @keyframes wave-2 {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(50px);
          }
        }

        @keyframes wave-3 {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-25px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(45deg);
          }
          to {
            transform: rotate(405deg);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(45deg);
          }
          50% {
            transform: translateY(-15px) rotate(45deg);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-delay {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-wave-1 {
          animation: wave-1 8s ease-in-out infinite;
        }
        .animate-wave-2 {
          animation: wave-2 10s ease-in-out infinite;
        }
        .animate-wave-3 {
          animation: wave-3 12s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-slide-down {
          animation: slide-down 1s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 1s ease-out 0.2s both;
        }
        .animate-slide-up-delay {
          animation: slide-up 1s ease-out 0.4s both;
        }
        .animate-fade-in-delay {
          animation: fade-in-delay 1s ease-out 0.6s both;
        }
        .animate-fade-in-delay-2 {
          animation: fade-in-delay 1s ease-out 0.8s both;
        }
      `}</style>
    </div>
  );
}
