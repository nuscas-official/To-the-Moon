'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

interface Department {
  id: string
  name: string
  description: string
  imageSrc: string
}

const DEPARTMENTS: Department[] = [
  {
    id: 'casuals',
    name: 'CASuals',
    description: "Gaming Gauntlets, Cosplay, Concert Watchalongs, Japan Tips, Escape Room, Game Shows, Beyblade, Anime Debates and the Anime Awards, everything ACG-adjacent is under CASuals. With practically no restrictions, CASuals is where 'Wouldn't it be funny if...' becomes 'We're doing this.'",
    imageSrc: '/images/silksong_placeholder.webp',
  },
  {
    id: 'topics',
    name: 'TOPICS',
    description: "Explore the finer points of writing and storytelling through Media Analysis, Reviews and Fanfiction in NUSCAS' writing-focused department. Beyond writing, TOPICS is also responsible for running the NUSCAS Instagram and keeping the club's online presence alive. Also, look forward to the annual TOPICS D&D!",
    imageSrc: '/images/silksong_placeholder.webp'
  },
  {
    id: 'palette',
    name: 'Palette',
    description: "Nurture your artistic flair with lessons on art and graphic design. Palette is the art-focused department of NUSCAS and the beating heart behind everything booth-related. With a vibrant community of artists from all walks of life, Palette offers activities beyond drawing, including crochet, Gunpla, bookbinding, and much more.",
    imageSrc: '/images/silksong_placeholder.webp'
  }
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

// Slight per-card tilt so the three departments don't sit on a dead-level line
const CARD_ROTATIONS = [-1.5, 0.8, 1.4]

const cardVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 90,
      damping: 15,
    },
  },
}

export default function ClubDepartments() {
  return (
    <section className="w-full space-y-8 animate-fade-in">
      {/* Section Header */}
      <div className="text-left md:text-center space-y-2">
        <p className="font-display text-6xl  tracking-widest text-accent flex items-center md:justify-center gap-2">
          Our Departments
        </p>
      </div>

      {/* Grid of Departments */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
      >
        {DEPARTMENTS.map((dept, index) => (
          <motion.div key={dept.id} variants={cardVariants} className="h-full">
            {/* The static tilt lives on a plain element — framer-motion owns
                the inline transform on the animated wrapper above */}
            <div
              style={{ ['--card-rot' as string]: `${CARD_ROTATIONS[index % CARD_ROTATIONS.length]}deg` }}
              className="group relative h-full overflow-hidden p-8 text-center flex flex-col items-center origin-center transition-transform duration-300 ease-out md:[transform:rotate(var(--card-rot))] md:hover:[transform:rotate(0deg)]"
            >

              {/* Angular Image Frame - Added scale transformation on group-hover */}
              <div className="clip-cut cut-xl relative w-40 h-40 flex items-center justify-center overflow-hidden transition-transform duration-300 ease-out mb-6 shadow-inner transform group-hover:scale-110">
                <Image
                  src={dept.imageSrc}
                  alt={dept.name}
                  width={160}
                  height={160}
                  className="object-cover"
                />
              </div>

              {/* Department Name */}
              <h3 className="text-xl font-black text-foreground group-hover:text-accent transition-all duration-300 transform group-hover:-translate-y-2 tracking-tight">
                {dept.name}
              </h3>

              {/* Smooth Reveal Description (CSS Grid row technique) */}
              <div className="w-full grid grid-rows-[1fr] md:grid-rows-[1fr] opacity-100 md:opacity-0 group-hover:md:grid-rows-[1fr] group-hover:md:opacity-100 group-hover:-translate-y-1 transition-all duration-500 ease-out overflow-hidden">
                <div className="min-h-0">
                  <p className="text-md text-text-muted leading-relaxed max-w-xs mx-auto">
                    {dept.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}