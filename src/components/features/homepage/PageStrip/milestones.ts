// The milestones that make up the horizontal timeline, in chronological order.
// Each becomes one portrait node card on a continuous rail (see TimelineNode).
//
// This is placeholder content — swap `year`, `title`, `caption` (and later the
// per-node `image`) for the real club history. The strip scrolls, so add or
// remove entries freely; 12–15 reads well across several "slides" of scrolling.

export interface Milestone {
  /** Big label sitting under the rail tick, e.g. "2020". */
  year: string
  /** Milestone headline, e.g. "COVID HAPPENS". */
  title: string
  /** One- or two-line supporting blurb shown above the rail. */
  caption: string
  /** Framed image for the node. All default to the shared placeholder for now. */
  image: string
  /** Alt text for the framed image. */
  imageAlt?: string
}

const PLACEHOLDER = '/images/silksong_placeholder.webp'

export const milestones: Milestone[] = [
  {
    year: '2015',
    title: 'THE FOUNDING',
    caption: 'A handful of students and one shared obsession. Placeholder origin story goes here.',
    image: PLACEHOLDER,
  },
  {
    year: '2016',
    title: 'FIRST SHOWCASE',
    caption: 'The debut exhibition. Placeholder note about the very first public showing.',
    image: PLACEHOLDER,
  },
  {
    year: '2017',
    title: 'GOING WEEKLY',
    caption: 'Regular sessions begin. Placeholder blurb about the community finding its rhythm.',
    image: PLACEHOLDER,
  },
  {
    year: '2018',
    title: 'THE BIG COLLAB',
    caption: 'First cross-club project. Placeholder text describing the collaboration.',
    image: PLACEHOLDER,
  },
  {
    year: '2019',
    title: 'AWARD SEASON',
    caption: 'Recognition arrives. Placeholder milestone about the first award won.',
    image: PLACEHOLDER,
  },
  {
    year: '2020',
    title: 'COVID HAPPENS',
    caption: 'Everything moves online. Placeholder note about the pivot to virtual meetups.',
    image: PLACEHOLDER,
  },
  {
    year: '2021',
    title: 'THE EXCO WHO STEPPED UP',
    caption: 'They were not the step-EXCO — they were the EXCO who stepped up. Placeholder.',
    image: PLACEHOLDER,
  },
  {
    year: '2022',
    title: 'PHYSICAL SESSIONS REOPEN',
    caption: 'Orientation Day 1, completed. Placeholder blurb about returning in person.',
    image: PLACEHOLDER,
  },
  {
    year: '2023',
    title: 'RECORD SIGN-UPS',
    caption: 'Membership hits an all-time high. Placeholder growth milestone.',
    image: PLACEHOLDER,
  },
  {
    year: '2024',
    title: 'NEW STUDIO SPACE',
    caption: 'A room of our own. Placeholder note about the dedicated space.',
    image: PLACEHOLDER,
  },
  {
    year: '2025',
    title: 'THE ANTHOLOGY',
    caption: 'First published collection. Placeholder text about the anthology release.',
    image: PLACEHOLDER,
  },
  {
    year: '2026',
    title: 'TENTH ANNIVERSARY',
    caption: 'A decade in. Placeholder blurb celebrating ten years of the club.',
    image: PLACEHOLDER,
  },
  {
    year: '2027',
    title: 'GOING NATIONAL',
    caption: 'Chapters beyond campus. Placeholder milestone about expansion.',
    image: PLACEHOLDER,
  },
  {
    year: '2028',
    title: 'WHAT COMES NEXT',
    caption: 'The story keeps scrolling. Placeholder for the road ahead.',
    image: PLACEHOLDER,
  },
]
