import PageFrame from '../PageFrame'

// Page 05 — Animatic / PowerPoint VN showcase
export default function AnimaticPage() {
  return (
    <PageFrame
      side="left"
      pageNumber="05"
      slide={{ src: '/images/slides/slide5.webp', alt: 'PowerPoint VNs' }}
      slideOverlay={
        // Transparent click target to advance the VN dialogue
        <button
          onClick={() => alert('PowerPoint VN: Dialogue Advanced!')}
          className="absolute bottom-[8%] left-[5%] right-[5%] h-[32%] bg-transparent hover:bg-black/5 active:bg-black/10 border border-transparent transition cursor-pointer z-10"
          aria-label="Next Dialogue"
        />
      }
      header={
        <>
          <span className="text-[9px] font-mono text-accent uppercase tracking-widest block mb-1">
            OUR MEMBERS&apos; WORK
          </span>
          <h3 className="text-xl font-serif italic font-black text-[#1a1616] leading-none">
            Animatic
          </h3>
        </>
      }
    >
      <div className="w-full aspect-[16/9] border border-[#dcd1ba] rounded-none bg-neutral-950 relative overflow-hidden flex flex-col justify-end p-2.5">
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: 'radial-gradient(circle at center, #6b21a8 0%, #1e1b4b 100%)' }}
        />
        <div className="absolute top-2 right-2 text-[8px] font-mono text-white/50 bg-black/60 px-1 rounded-none">
          SLIDE 42/150
        </div>

        <div className="relative z-10 w-full bg-black/85 border border-white/15 p-2 rounded-none flex flex-col justify-between">
          <span className="text-[8px] font-mono text-accent font-bold uppercase tracking-wider">
            ANITAN:
          </span>
          <span className="text-[9px] text-neutral-200 leading-normal mt-0.5">
            &quot;Wait... you are building this interactive strip using Framer Motion 3D transforms?!&quot;
          </span>

          <div className="flex gap-2 justify-end text-[7px] font-mono text-neutral-500 uppercase tracking-widest mt-1.5 pt-1 border-t border-white/5">
            <span>[ CLICK TO NEXT ]</span>
            <span>[ SKIP ]</span>
          </div>
        </div>
      </div>

      <p className="text-[8px] font-mono text-[#685f5d] mt-2 text-center leading-relaxed">
        Why use Unity when PowerPoint has *Wipe* and *Fade*?
      </p>
    </PageFrame>
  )
}
