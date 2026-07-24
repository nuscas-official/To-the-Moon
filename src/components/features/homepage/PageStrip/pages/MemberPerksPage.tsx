import PageFrame from '../PageFrame'

// Page 06 — Member perks
export default function MemberPerksPage() {
  return (
    <PageFrame
      side="right"
      pageNumber="06"
      slide={{ src: '/images/slides/slide6.webp', alt: 'Member Perks' }}
      header={
        <>
          <span className="text-[9px] font-mono text-accent uppercase tracking-widest block mb-1">
            EXCLUSIVE OFFERS
          </span>
          <h3 className="text-xl font-serif italic font-black text-[#1a1616] leading-none">
            Member Perks
          </h3>
        </>
      }
    >
      <ul className="space-y-2 text-[10px] text-[#685f5d] font-sans">
        <li className="flex items-start gap-2">
          <span className="text-accent mt-0.5">✦</span>
          <span>Access to the library of 200+ manga, light novels and artbooks.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-accent mt-0.5">✦</span>
          <span>Active screening review ratings submission on our portal.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-accent mt-0.5">✦</span>
          <span>Exclusive Discord channels &amp; networking with alumni in creative jobs.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-accent mt-0.5">✦</span>
          <span>Fanzine publication privileges &amp; artist showcase stands.</span>
        </li>
      </ul>
    </PageFrame>
  )
}
