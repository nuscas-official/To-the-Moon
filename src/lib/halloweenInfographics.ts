/**
 * Chapters of the scroll story on the temporary /halloween page. Each one pairs
 * a block of text with one or two infographics that stay pinned beside it while
 * the text scrolls past; two are fanned out, overlapping at opposite tilts.
 * Drop files in public/images/halloween/ and reference them as
 * '/images/halloween/<file>'. A chapter without images, or an image without a
 * src, shows a placeholder, so the page can be laid out before the art is final.
 *
 * The copy below is placeholder text — swap it for the real write-ups.
 */
export interface InfographicImage {
  /** Leave out to show a placeholder box labelled with `alt`. */
  src?: string
  alt: string
  /** Intrinsic size lets next/image keep the infographic's own aspect ratio. */
  width: number
  height: number
}

export interface HalloweenInfographic {
  id: string
  /** Small line above the heading. */
  kicker: string
  /** Big display heading. */
  title: string
  /** Body paragraphs, revealed one after another. */
  body: string[]
  /**
   * The Instagram post this infographic was shared in, e.g.
   * 'https://www.instagram.com/p/<id>/'. Without one the button links to the
   * club's profile instead.
   */
  instagram?: string
  /** One infographic, or two to show them overlapping. Extras past two are ignored. */
  images?: InfographicImage[]
}

export const HALLOWEEN_INFOGRAPHICS: HalloweenInfographic[] = [
  {
    id: 'stamp-rally-prizes',
    kicker: 'Proof of your visit',
    title: 'Stamp Rally',
    body: [
      'Accompanying this second letter is a card, using which you may collect stamp marks. These stamps serve to prove your visit to the various activity centers in the city of Monad. ',
      'For your efforts in collecting all the stamps, I have an arranged some rewards for you and you alone, separate from <The Grand Finale>.',
    ],
    images: [
        {
          src: '/images/halloween/stamp-rally-1.webp',
          alt: 'Stamp Rally - part 1',
          width: 810,
          height: 1080,
        },
        {
          src: '/images/halloween/stamp-rally-2.webp',
          alt: 'Stamp Rally - part 2',
          width: 810,
          height: 1080,
        },
    ],
  },
  {
    id: 'dress-code',
    kicker: 'Dress Code',
    title: 'Cosplay',
    body: [    
      'Halloween is the prime time for you to cosplay, with it having the most number of cosplayers out of all eventts.',
      'This year\'s theme is formal wear that fits an opulent, early 20th-century European high society look.'
    ],
    images: [
        {
          src: '/images/halloween/dress-code.webp',
          alt: 'dress-code',
          width: 810,
          height: 1080,
        },
    ],
  },
]
