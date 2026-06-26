'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types & Data ---
interface CardConfig {
  id: string;
  label: string;
  // Pre-calculated fixed positions & rotations to keep layouts consistent across renders
  top: string;
  left: string;
  rotation: number; 
  zIndex: number;
}

const CARDS_CONFIG: CardConfig[] = [
  { id: 'card-1', label: 'AniNight XIII', top: '10%', left: '55%', rotation: 3, zIndex: 10 },
  { id: 'card-2', label: 'Art showcase', top: '5%', left: '78%', rotation: -4, zIndex: 12 },
  { id: 'card-3', label: 'Club BBQ', top: '38%', left: '72%', rotation: 2, zIndex: 11 },
  { id: 'card-4', label: 'Screening', top: '70%', left: '58%', rotation: -3, zIndex: 9 },
  { id: 'card-5', label: 'VN launch', top: '68%', left: '77%', rotation: 4, zIndex: 13 },
  { id: 'card-6', label: 'Gallery Pile', top: '18%', left: '48%', rotation: -5, zIndex: 8 }, // background card
];

// Mock pool of image assets to cycle through
const IMAGE_POOL = [
  { url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', alt: 'Anime Art 1' },
  { url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400', alt: 'Anime Art 2' },
  { url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400', alt: 'Background Painting' },
  { url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400', alt: 'Abstract Art' },
  { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', alt: 'Digital Illustration' },
  { url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400', alt: 'Neon Cyberpunk' },
  { url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400', alt: 'Comic Panel' },
  { url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400', alt: 'Water color sketch' },
];

export default function BannerHero() {
  // State maps each card ID to its currently visible image index from the pool
  const [visibleImages, setVisibleImages] = useState<Record<string, number>>(() => {
    // Initial assignment: distribute unique images from the pool across cards
    const initial: Record<string, number> = {};
    CARDS_CONFIG.forEach((card, index) => {
      initial[card.id] = index % IMAGE_POOL.length;
    });
    return initial;
  });

  // Ambient Loop: Cycle exactly ONE random card every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random card slot to swap
      const randomCardIndex = Math.floor(Math.random() * CARDS_CONFIG.length);
      const targetCardId = CARDS_CONFIG[randomCardIndex].id;

      // Find images currently not being displayed anywhere to avoid duplicates
      const currentlyUsedIndices = Object.values(visibleImages);
      const availableIndices = IMAGE_POOL.map((_, i) => i).filter(
        (i) => !currentlyUsedIndices.includes(i)
      );

      if (availableIndices.length > 0) {
        const nextImageIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        
        setVisibleImages(prev => ({
          ...prev,
          [targetCardId]: nextImageIndex
        }));
      }
    }, 7000); // 7-second cadence

    return () => clearInterval(interval);
  }, [visibleImages]);

  return (
    <header className="relative w-full min-h-[700px] bg-[#0c0c0e] text-white overflow-hidden flex flex-col justify-between p-8 md:p-16 select-none">
      
      {/* 1. Left Gradient Mask for Ultimate Headline Legibility */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(12, 12, 14, 1) 0%, rgba(12, 12, 14, 0.8) 40%, rgba(12, 12, 14, 0) 70%)'
        }}
      />

      {/* Navigation Header */}
      <div className="relative z-30 flex justify-between items-center w-full">
        <div className="font-serif italic text-2xl tracking-wider font-bold">NUSCAS</div>
        <nav className="flex items-center gap-6 text-gray-400 text-sm font-medium">
          <a href="#" className="hover:text-white transition">Blog</a>
          <a href="#" className="hover:text-white transition">Events</a>
          <a href="#" className="hover:text-white transition">Gallery</a>
          <a href="#" className="hover:text-white transition">Ratings</a>
          <a href="#" className="text-blue-400 hover:text-blue-300 transition font-semibold">Join us</a>
        </nav>
      </div>

      {/* Main Hero Body Content */}
      <div className="relative z-30 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center pt-12">
        
        {/* Left Side: Messaging & CTAs */}
        <div className="lg:col-span-6 space-y-6 max-w-xl">
          <p className="text-gray-500 font-medium tracking-wide text-sm uppercase">
            NUS Comic Arts Society · Est. 2003
          </p>
          <h1 className="text-5xl md:text-6xl font-serif italic font-extrabold leading-[1.15] tracking-tight">
            Anime, art,<br />and the people<br />who care too much.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            We screen, we rate, we make visual novels in PowerPoint. Join the club that takes fun seriously.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <button className="px-6 py-3 rounded-xl border border-gray-700 bg-white/5 hover:bg-white/10 font-medium transition duration-200 backdrop-blur-sm">
              Join NUSCAS
            </button>
            <button className="px-6 py-3 rounded-xl border border-gray-800 bg-transparent text-gray-400 hover:text-white hover:border-gray-600 font-medium transition duration-200">
              See what we do
            </button>
          </div>
        </div>

        {/* Right Side: Absolute Dynamic Pinboard Collage */}
        <div className="hidden lg:block lg:col-span-6 absolute inset-y-0 right-0 w-1/2 h-full pointer-events-none">
          {CARDS_CONFIG.map((card, idx) => {
            const currentImgIndex = visibleImages[card.id];
            const currentImg = IMAGE_POOL[currentImgIndex];

            return (
              <motion.div
                key={card.id}
                className="absolute w-44 h-44 md:w-52 md:h-52 bg-[#16161a] border border-white/10 rounded-2xl p-3 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                style={{
                  top: card.top,
                  left: card.left,
                  rotate: card.rotation,
                  zIndex: card.zIndex,
                }}
                // Staggered initial entry on page load
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.08, // 80ms stagger step (100-400ms range overall)
                  ease: [0.16, 1, 0.3, 1] // Sleek out-quint ease
                }}
              >
                {/* Image Container with Ambient Fade cross-over guard */}
                <div className="relative w-full h-[78%] bg-black/40 rounded-lg overflow-hidden">
                  <AnimatePresence>
                    <motion.img
                      key={currentImgIndex} // Dictates unmount/remount transition when index changes
                      src={currentImg.url}
                      alt={currentImg.alt}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                  </AnimatePresence>
                  
                  {/* Subtle layout vector placeholder icon over top */}
                  <div className="absolute top-2 left-2 p-1 bg-black/40 backdrop-blur-md rounded-md">
                    <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Card footer text description */}
                <span className="text-xs font-mono font-medium text-gray-400 tracking-wide mt-1 block truncate">
                  {card.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. Bottom Row Stats Anchor */}
      <div className="relative z-30 border-t border-white/5 pt-8 mt-12 grid grid-cols-3 max-w-xl gap-8">
        <div>
          <div className="text-2xl md:text-3xl font-bold font-sans tracking-tight">120+</div>
          <div className="text-xs md:text-sm text-gray-500 font-medium">members</div>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold font-sans tracking-tight">47</div>
          <div className="text-xs md:text-sm text-gray-500 font-medium">titles rated</div>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold font-sans tracking-tight">20+</div>
          <div className="text-xs md:text-sm text-gray-500 font-medium">years running</div>
        </div>
      </div>

    </header>
  );
}