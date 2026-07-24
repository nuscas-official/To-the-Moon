'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface Shard {
  id: number;
  src: string;
  alt: string;
  gridClass: string;
  polygon: string;
}

const SHARDS: Shard[] = [
  {
    id: 1,
    src: '/images/anikun-flower.webp',
    alt: 'Anikun holding a flower',
    gridClass: 'col-span-2 row-span-2',
    polygon: 'polygon(0% 0%, 100% 0%, 85% 95%, 0% 80%)'
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80',
    alt: 'Anime Illustration',
    gridClass: 'col-span-1 row-span-1',
    polygon: 'polygon(15% 0%, 90% 0%, 100% 100%, 0% 85%)'
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
    alt: 'Starry sky painting',
    gridClass: 'col-span-1 row-span-1',
    polygon: 'polygon(10% 0%, 100% 0%, 85% 100%, 0% 90%)'
  },
  {
    id: 4,
    src: '/images/anitan-thumbs-up.webp',
    alt: 'Anitan mascot',
    gridClass: 'col-span-1 row-span-1',
    polygon: 'polygon(0% 15%, 100% 0%, 85% 85%, 10% 100%)'
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80',
    alt: 'Anime Cityscape',
    gridClass: 'col-span-1 row-span-1',
    polygon: 'polygon(15% 10%, 100% 0%, 100% 90%, 0% 80%)'
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&auto=format&fit=crop&q=80',
    alt: 'Glowing lines abstract',
    gridClass: 'col-span-1 row-span-1',
    polygon: 'polygon(0% 20%, 90% 0%, 100% 100%, 0% 90%)'
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    alt: 'Dreamy digital painting',
    gridClass: 'col-span-1 row-span-1',
    polygon: 'polygon(10% 0%, 100% 15%, 90% 90%, 0% 100%)'
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80',
    alt: 'Cyberpunk neon street',
    gridClass: 'col-span-2 row-span-1',
    polygon: 'polygon(0% 15%, 100% 0%, 95% 100%, 10% 90%)'
  },
  {
    id: 9,
    src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    alt: 'Manga line drawing',
    gridClass: 'col-span-1 row-span-1',
    polygon: 'polygon(0% 10%, 90% 0%, 100% 100%, 0% 100%)'
  },
  {
    id: 10,
    src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&auto=format&fit=crop&q=80',
    alt: 'Watercolor character sketch',
    gridClass: 'col-span-1 row-span-1',
    polygon: 'polygon(10% 10%, 100% 0%, 85% 100%, 0% 100%)'
  },
  {
    id: 11,
    src: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400&auto=format&fit=crop&q=80',
    alt: 'Retro pop art',
    gridClass: 'col-span-1 row-span-1',
    polygon: 'polygon(15% 0%, 90% 10%, 100% 100%, 15% 100%)'
  },
  {
    id: 12,
    src: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&auto=format&fit=crop&q=80',
    alt: 'Gradient artwork',
    gridClass: 'col-span-1 row-span-1',
    polygon: 'polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%)'
  }
];

export default function MangaCollage() {
  return (
    <div 
      className="grid w-full h-[290px] sm:h-[350px] md:h-[400px] lg:h-[450px] gap-1 md:gap-1.5 lg:gap-2 bg-neutral-950 p-1.5 md:p-2 rounded-2xl overflow-hidden relative border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      style={{
        gridTemplateRows: 'repeat(4, 1fr)',
        gridTemplateColumns: 'repeat(4, 1fr)',
      }}
    >
      {SHARDS.map((shard) => {
        return (
          <motion.div
            key={shard.id}
            className={`${shard.gridClass} relative w-full h-full overflow-hidden rounded-lg group bg-neutral-900`}
            whileHover={{
              scale: 1.05,
              zIndex: 30,
            }}
            transition={{
              type: 'spring',
              stiffness: 280,
              damping: 24,
            }}
          >
            {/* Image panel with grayscale-to-color transition */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shard.src}
              alt={shard.alt}
              className="w-full h-full object-cover filter grayscale contrast-[115%] group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-500 ease-out pointer-events-none"
              loading="lazy"
            />
            
            {/* Stylized dark-to-transparent overlay that fades on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-transparent pointer-events-none opacity-85 group-hover:opacity-0 transition-opacity duration-300 z-10" />
            
            {/* Very thin border highlight line for extra fanzine aesthetics */}
            <div className="absolute inset-0 border border-white/5 pointer-events-none group-hover:border-accent/40 transition-colors duration-300 z-20" />
          </motion.div>
        );
      })}
    </div>
  );
}
