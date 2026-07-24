import Image from 'next/image'
import PageFrame from '../PageFrame'

// Page 01 — Welcome / mascot introduction
export default function IntroPage() {
  return (
    <PageFrame
      side="left"
      pageNumber="01"
      slide={{ src: '/images/slides/slide1.webp', alt: 'Welcome' }}
      header={
        <span className="px-2 py-0.5 border border-accent/20 bg-accent/5 rounded-none text-[9px] font-mono text-accent uppercase tracking-widest inline-block">
          Introduction
        </span>
      }
      bodyClassName="flex flex-col items-center text-center space-y-4"
    >
      <div className="relative w-28 h-28 border border-[#dcd1ba] bg-white overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
        <Image
          src="/images/anikun-flower.webp"
          alt="Mascot Anikun"
          fill
          className="object-cover object-center p-2"
          priority
        />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-mono text-[#685f5d]">MEET ANIKUN</p>
        <p className="text-[11px] text-[#685f5d] max-w-[280px] leading-relaxed">
          Our Male Mascot. [Insert Anikun Lore]
        </p>
      </div>
    </PageFrame>
  )
}
