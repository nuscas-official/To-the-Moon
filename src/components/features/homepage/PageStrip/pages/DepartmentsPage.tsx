import PageFrame from '../PageFrame'

// Page 02 — About Us / department overview
export default function DepartmentsPage() {
  return (
    <PageFrame
      side="right"
      pageNumber="02"
      slide={{ src: '/images/slides/slide2.webp', alt: 'CASuals & TOPICS' }}
      header={
        <>
          <span className="text-[9px] font-mono text-accent uppercase tracking-widest block mb-1">
            About Us
          </span>
          <h3 className="text-xl font-serif italic font-black text-[#1a1616] leading-none">
            Our Departments
          </h3>
        </>
      }
      bodyClassName="space-y-3"
    >
      <div className="p-3 bg-white border border-[#dcd1ba] rounded-none space-y-1.5">
        <h4 className="text-xs font-mono text-accent font-bold">CASuals</h4>
        <p className="text-[10px] text-[#685f5d] leading-relaxed">
          Gaming Gauntlets, Cosplay, Concert Watchalongs, Japan Tips, Escape Room, Game Shows, Beyblade, Anime Debates and the Anime Awards, everything ACG-adjacent is under CASuals. With practically no restrictions, CASuals is where &quot;Wouldn&apos;t it be funny if...&quot; often becomes &quot;We&apos;re actually doing this.&quot;
        </p>
      </div>
      <div className="p-3 bg-white border border-[#dcd1ba] rounded-none space-y-1.5">
        <h4 className="text-xs font-mono text-accent font-bold">TOPICS</h4>
        <p className="text-[10px] text-[#685f5d] leading-relaxed">
          Explore the finer points of writing and storytelling through Media Analysis, Reviews and Fanfiction in NUSCAS&apos; writing-focused department. Beyond writing, TOPICS is also responsible for running the NUSCAS&apos; Instagram and keeping the club&apos;s online presence alive. And last but not least, look forward to the annual TOPICS D&amp;D!
        </p>
      </div>
      <div className="p-3 bg-white border border-[#dcd1ba] rounded-none space-y-1.5">
        <h4 className="text-xs font-mono text-accent font-bold">Palette</h4>
        <p className="text-[10px] text-[#685f5d] leading-relaxed">
          Nurture your artistic flair with lessons on art and graphic design. Palette is the art-focused department of NUSCAS and the beating heart behind everything booth-related. With a vibrant community of artists from all walks of life, Palette offers activities beyond drawing, including crochet, Gunpla, bookbinding, and much more.
        </p>
      </div>
    </PageFrame>
  )
}
