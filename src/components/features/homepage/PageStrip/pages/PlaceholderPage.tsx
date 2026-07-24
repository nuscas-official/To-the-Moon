import PageFrame from '../PageFrame'

// Page 04 — Placeholder / rock-paper-scissors mini-game
export default function PlaceholderPage() {
  return (
    <PageFrame
      side="right"
      pageNumber="04"
      slide={{ src: '/images/slides/slide4.webp', alt: 'Not Ramen Challenge' }}
      slideOverlay={
        // Transparent rock-paper-scissors hotspots over the slide image
        <div className="absolute bottom-[18%] left-[8%] right-[8%] h-[24%] grid grid-cols-3 gap-2 z-10">
          <button
            onClick={() => alert('You chose Rock!')}
            className="w-full h-full bg-transparent hover:bg-black/5 active:bg-black/10 border border-transparent transition cursor-pointer"
            aria-label="Choose Rock"
          />
          <button
            onClick={() => alert('You chose Paper!')}
            className="w-full h-full bg-transparent hover:bg-black/5 active:bg-black/10 border border-transparent transition cursor-pointer"
            aria-label="Choose Paper"
          />
          <button
            onClick={() => alert('You chose Scissors!')}
            className="w-full h-full bg-transparent hover:bg-black/5 active:bg-black/10 border border-transparent transition cursor-pointer"
            aria-label="Choose Scissors"
          />
        </div>
      }
      header={
        <>
          <span className="text-[9px] font-mono text-accent uppercase tracking-widest block mb-1">
            PLACEHOLDER TEXT
          </span>
          <h3 className="text-xl font-serif italic font-black text-[#1a1616] leading-none">
            Placeholder Text
          </h3>
        </>
      }
      bodyClassName="space-y-3"
    >
      <p className="text-[10px] text-[#685f5d] leading-relaxed">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>

      <div className="grid grid-cols-3 gap-2 text-center pt-2">
        <div className="px-1 py-2 bg-white border border-[#dcd1ba] rounded-none hover:border-accent hover:text-accent transition duration-200 cursor-pointer">
          <span className="block text-lg">✊</span>
          <span className="text-[8px] font-mono block mt-1">ROCK</span>
        </div>
        <div className="px-1 py-2 bg-white border border-[#dcd1ba] rounded-none hover:border-accent hover:text-accent transition duration-200 cursor-pointer">
          <span className="block text-lg">✋</span>
          <span className="text-[8px] font-mono block mt-1">PAPER</span>
        </div>
        <div className="px-1 py-2 bg-white border border-[#dcd1ba] rounded-none hover:border-accent hover:text-accent transition duration-200 cursor-pointer">
          <span className="block text-lg">✌️</span>
          <span className="text-[8px] font-mono block mt-1">SCISSORS</span>
        </div>
      </div>

      <div className="text-[8px] font-mono text-center text-[#685f5d] uppercase tracking-wide">
        * Win rate: 33.3% // Saltiness level: 100%
      </div>
    </PageFrame>
  )
}
