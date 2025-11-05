import { useState, useEffect } from 'react';
import { Trophy, Star, Sparkles, Award, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CourseCompletionPage = () => {
  const [showExplosion, setShowExplosion] = useState(true);
  const [showContent, setShowContent] = useState(false);
    const navigate = useNavigate();

  useEffect(() => {
    // Show explosion immediately
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 800);

    // Confetti lasts 5 seconds
    const explosionTimer = setTimeout(() => {
      setShowExplosion(false);
    }, 5000);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(explosionTimer);
    };
  }, []);

  // Create professional confetti particles
  const createConfetti = () => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];
    const shapes = ['circle', 'square', 'triangle'];
    // Increase density to 120 particles
    return Array.from({ length: 120 }, (_, i) => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = Math.random() * 8 + 8; // 8-16px
      const delay = Math.random() * 2; // 0-2 seconds delay
      const duration = 4 + Math.random() * 3; // 4-7 seconds
      const left = Math.random() * 100;
      const drift = (Math.random() - 0.5) * 200; // horizontal drift
      return (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${left}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            animationFillMode: 'forwards',
          }}
        >
          <div
            className={`opacity-90 ${shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-sm' : ''}`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              animation: `confetti-fall ${duration}s ease-out forwards`,
              transform: shape === 'triangle' ? 'rotate(45deg)' : 'none',
              clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
              animationDelay: `${delay}s`,
            }}
          />
        </div>
      );
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Professional Confetti Animation */}
      {showExplosion && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <style>{`
            @keyframes confetti-fall {
              0% {
                transform: translateY(-100vh) rotateZ(0deg) translateX(0px);
                opacity: 1;
              }
              10% {
                opacity: 1;
              }
              90% {
                opacity: 0.8;
              }
              100% {
                transform: translateY(100vh) rotateZ(720deg) translateX(${Math.random() * 200 - 100}px);
                opacity: 0;
              }
            }
            @keyframes gentle-bounce {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-10px);
              }
            }
            .bounce-gentle {
              animation: gentle-bounce 2s ease-in-out infinite;
            }
          `}</style>
          {createConfetti()}
        </div>
      )}

      {/* Main Content */}
      <div className={`flex flex-col items-center justify-center min-h-screen px-4 transition-all duration-1000 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        
        {/* Trophy Icon */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-6 shadow-lg bounce-gentle">
            <Trophy className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Congratulations Text */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-5xl p-2 font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Congratulations!
            </h1>
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xl text-gray-700 font-medium">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span>You have completed this course</span>
          </div>
          
          <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
            Amazing work! You&#39;ve successfully finished your learning journey. 
            Your dedication and hard work have paid off.
          </p>
        </div>

        {/* Achievement Stats */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center min-w-[100px]">
            <Award className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-800">100%</div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
          {/* <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center min-w-[100px]">
            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-800">5★</div>
            <div className="text-sm text-gray-600">Rating</div>
          </div> */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center min-w-[100px]">
            <Sparkles className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-800">New</div>
            <div className="text-sm text-gray-600">Skills</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            // This would normally navigate to "/lms/my-courses"
            navigate('/lms/my-courses', { state: { refetch: true } });
            // console.log('Navigate to My Courses');
          }}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <span>Go to My Courses</span>
        </button>
      </div>
    </div>
  );
};

export default CourseCompletionPage;