'use client';

import { useState, useEffect } from 'react';

interface YouTubeBackgroundProps {
  videoId: string;
  scrollY?: number;
  className?: string;
}

export default function YouTubeBackground({ 
  videoId, 
  scrollY = 0,
  className = ""
}: YouTubeBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fallback image in case video fails to load
  const fallbackImage = '/images/up/Image1.png';

  useEffect(() => {
    // Set mounted state to prevent hydration issues
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // Show fallback after 3 seconds if video hasn't loaded
    const fallbackTimer = setTimeout(() => {
      if (!isLoaded) {
        setShowFallback(true);
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [isLoaded, isMounted]);

  // Generate consistent iframe src
  const getIframeSrc = () => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1`;
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Static background during SSR to prevent layout shift */}
      {!isMounted && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${fallbackImage})`,
            transform: `translateY(${scrollY * 0.5}px) scale(1.1)`,
            willChange: 'transform'
          }}
        />
      )}

      {/* YouTube Video Background - Only render after mounting */}
      {isMounted && (
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translateY(${scrollY * 0.5}px) scale(1.1)`,
            willChange: 'transform'
          }}
        >
          <iframe
            src={getIframeSrc()}
            title="De Steiger Background Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto transform -translate-x-1/2 -translate-y-1/2 scale-125"
            style={{
              border: 'none',
              pointerEvents: 'none', // Prevent interaction with video
            }}
            onLoad={() => setIsLoaded(true)}
            onError={() => setShowFallback(true)}
          />
        </div>
      )}

      {/* Fallback Background Image */}
      {isMounted && (showFallback || !videoId) && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${fallbackImage})`,
            transform: `translateY(${scrollY * 0.5}px) scale(1.1)`,
            willChange: 'transform'
          }}
        />
      )}

      {/* Loading State - Only show after mounting and while video loads */}
      {isMounted && !isLoaded && !showFallback && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg font-medium">Video wordt geladen...</p>
          </div>
        </div>
      )}

      {/* Video Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
    </div>
  );
}
