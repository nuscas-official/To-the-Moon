/**
 * Long-running Google Forms listed on /forms — feedback and drives that stay
 * open for weeks rather than belonging to a single event. Add, edit or retire
 * entries here.
 */
export interface ClubForm {
  id: string
  /** Short kicker in the angled tag, e.g. "Feedback". */
  tag: string
  title: string
  description: string
  /** Button label. */
  cta: string
  href: string
  /**
   * Card banner, shown at 16:9 and cropped to fit. Drop files in
   * public/images/forms/ and reference them as '/images/forms/<file>'.
   * Without one the card shows a placeholder.
   */
  image?: { src: string; alt: string }
  /** ISO date (YYYY-MM-DD, Singapore time). The form is hidden after this day. */
  endsAt?: string
}

export const CLUB_FORMS: ClubForm[] = [
  {
    id: 'the-grand-finale',
    tag: 'Feedback',
    title: 'Halloween 2026 Sign Up Form',
    description:
      'The Grand Finale is a once-in-a-generation stage performance held in the city of Monad. This year, you, our esteemed guest, are cordially invited to witness this seminal occasion.',
    cta: 'Sign up for Halloween!',
    image: { src: '/images/forms/the-grand-finale.webp', alt: 'NUSCAS Halloween 2026 Sign Up Form' },
    href: 'https://forms.gle/aQKoRczbDwUUXwnAA',
  },
  {
    id: 'session-feedback',
    tag: 'Feedback',
    title: 'NUSCAS Session Feedback Form',
    description:
      'Been to one of our sessions? Tell us what worked, what didn’t, and what you’d like us to run next.',
    cta: 'Give feedback',
    image: { src: '/images/forms/nuscas-session-feedback.webp', alt: 'NUSCAS Session Feedback Form' },
    href: 'https://forms.gle/Feb8oo5uSvdNYTFf6',
  },
  {
    id: 'merch-donation-drive',
    tag: 'Merch Donation Drive',
    title: 'NUSCAS Merch Donation Drive',
    description:
      'Got merch sitting in your room that you don\'t want anymore? 😐📦 Doubles from a pull you didn\'t need? 🎲 A figure you\'ve fallen out of love with? 💔 Give it a second life, donate it to NUSCAS! 🎊✨',
    cta: 'Donate merch',
    image: { src: '/images/forms/sandrone-christmas.webp', alt: '' },
    href: 'https://forms.gle/THT5dQg8UmyeGXn8A',
  },
]

/** Forms whose end date hasn't passed yet. */
export function getOpenForms(now: Date = new Date()): ClubForm[] {
  return CLUB_FORMS.filter((form) => {
    if (!form.endsAt) return true
    // End of the given day in Singapore (UTC+8).
    return now.getTime() <= new Date(`${form.endsAt}T23:59:59+08:00`).getTime()
  })
}
