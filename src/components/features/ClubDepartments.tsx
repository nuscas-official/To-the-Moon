'use client'

import Image from 'next/image'

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
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    imageSrc: '/images/silksong_placeholder.webp'
  },
  {
    id: 'topics',
    name: 'TOPICS',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    imageSrc: '/images/silksong_placeholder.webp'
  },
  {
    id: 'palette',
    name: 'Palette',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    imageSrc: '/images/silksong_placeholder.webp'
  }
]

export default function ClubDepartments() {
  return (
    <section className="w-full space-y-8 py-4 animate-fade-in">
      {/* Section Header */}
      <div className="text-left md:text-center space-y-2">
        <h2 className="text-m uppercase tracking-widest font-black text-accent flex items-center md:justify-center gap-2">
          <span className="w-4 h-4 rounded-full bg-accent" />
          Our Departments
        </h2>
      </div>

      {/* Grid of Departments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {DEPARTMENTS.map((dept) => (
          <div
            key={dept.id}
            className="group relative overflow-hidden rounded-2xl transition-all duration-300 chaos-card-active p-8 text-center flex flex-col items-center"
          >

            {/* Circle Image Wrapper - Added scale transformation on group-hover */}
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center overflow-hidden transition-transform duration-300 ease-out mb-6 shadow-inner transform group-hover:scale-110">
              <Image
                src={dept.imageSrc}
                alt={dept.name}
                width={160}
                height={160}
                className="object-cover"
              />
            </div>

            {/* Department Name */}
            <h3 className="text-xl font-black text-neutral-900 group-hover:text-accent transition-all duration-300 transform group-hover:-translate-y-2 tracking-tight">
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
        ))}
      </div>
    </section>
  )
}