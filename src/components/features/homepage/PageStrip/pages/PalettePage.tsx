import PageFrame from '../PageFrame'

// Page 03 — Palette department spotlight
export default function PalettePage() {
  return (
    <PageFrame
      side="left"
      pageNumber="03"
      slide={{ src: '/images/slides/slide3.webp', alt: 'Palette' }}
      header={
        <>
          <span className="text-[9px] font-mono text-accent uppercase tracking-widest block mb-1">
            DIVISION 02 / ART &amp; CREATION
          </span>
          <h3 className="text-xl font-serif italic font-black text-[#1a1616] leading-none">
            Palette
          </h3>
        </>
      }
      bodyClassName="space-y-3"
    >
      <div className="p-3 bg-white border border-[#dcd1ba] rounded-none space-y-2">
        <p className="text-[10px] text-[#685f5d] leading-relaxed">
          Where ideas transform into sketchbooks and digital spreads. Palette is our hub for character illustrators, comic artists, and designers.
        </p>

        <div className="flex gap-2 items-center justify-center pt-1 border-t border-[#dcd1ba]">
          <span className="text-[8px] font-mono text-[#685f5d] mr-1 uppercase">Palette:</span>
          <span className="w-3.5 h-3.5 rounded-full bg-accent border border-white/20" title="Crimson" />
          <span className="w-3.5 h-3.5 rounded-full bg-accent-gold border border-white/20" title="Gold" />
          <span className="w-3.5 h-3.5 rounded-full bg-sky-500 border border-white/20" title="Teal" />
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white/20" title="Green" />
        </div>
      </div>

      <div className="p-2 border border-dashed border-[#dcd1ba] rounded-none text-center">
        <span className="text-[9px] font-mono text-[#685f5d] italic">
          Annual Fanzine Publications &amp; Merch!
        </span>
      </div>
    </PageFrame>
  )
}
