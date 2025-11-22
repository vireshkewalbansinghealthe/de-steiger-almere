'use client';

import { useState, useEffect } from 'react';
import { X, Play, Volume2, VolumeX } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string; // YouTube video ID
  title?: string;
}

export default function VideoModal({ isOpen, onClose, videoId, title = "De Steiger Video" }: VideoModalProps) {
  const [isMuted, setIsMuted] = useState(true);
  
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-300 scale-95 data-[state=open]:scale-100">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-slate-900" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm text-gray-300">Ontdek De Steiger</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Mute/Unmute Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              title={isMuted ? "Geluid inschakelen" : "Geluid uitschakelen"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              title="Sluiten"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? '1' : '0'}&rel=0&showinfo=0&controls=1&modestbranding=1&playsinline=1&iv_load_policy=3&fs=1&hl=nl&cc_lang_pref=nl`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>

        {/* Footer with branding */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-white/80 text-sm">
                Meer informatie op onze website
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
              >
                Sluiten
              </button>
              <button
                onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 text-sm rounded-lg font-semibold hover:from-yellow-300 hover:to-yellow-400 transition-colors"
              >
                Bekijk op YouTube
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
        aria-label="Klik om te sluiten"
      />
    </div>
  );
}
