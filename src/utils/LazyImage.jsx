import React, { useState, useEffect, useRef } from 'react';
import { cn } from './cn';

const LazyImage = ({ 
  src, 
  alt, 
  imgClass = '', 
  containerClass = 'relative w-full ', // Ensure the parent div has height
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Shimmer effect styles
  const shimmerStyle = {
    background: 'linear-gradient(90deg, rgba(230, 230, 230, 1) 25%, rgba(245, 245, 245, 1) 50%, rgba(230, 230, 230, 1) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    height: '100%', // Ensure skeleton has height
  };

  return (
    <div className={`${containerClass}`} ref={imgRef}>
      {/* Skeleton Loader */}
      {!loaded && (
        <div
          className={cn(`w-full ${imgClass}`)}
          style={{
            ...shimmerStyle,
            position: 'absolute',
            inset: '0',
            borderRadius: '8px',
          }}
        ></div>
      )}

      {/* Lazy Loaded Image */}
      {visible && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={cn(`${loaded ? 'opacity-100' : 'opacity-0'} w-full h-full ${imgClass} transition-opacity duration-300`)}
          {...props}
        />
      )}
      {/* Shimmer Keyframes Inline */}
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: -200px 0;
            }
            100% {
              background-position: 200px 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default LazyImage;
