export interface Milestone {
  year: string
  title: string
  caption: string
  image: string
  imageAlt?: string
}

const PLACEHOLDER = '/images/silksong_placeholder.webp'

export const milestones: Milestone[] = [
  {
    year: '1999',
    title: 'The Founding',
    caption: 'A small group of friends united to celebrate Japanese animation, giving like-minded people a place to have fun',
    image: '/images/timeline/nuscas-founding.webp',
  },
  {
    year: '2000\'s',
    title: 'The Foundation',
    caption: 'We grew into a society boasting more than 100 members, a dedicated committee and a strong alumni network.',
    image: '/images/timeline/nuscas-2000s.webp',
  },
  {
    year: '2010\'s',
    title: 'The 3 Departments',
    caption: 'Our 3 Depts Palette, TOPICS, and CASuals host a wide variety of activities and events Members get to learn new skills and meet new friends.',
    image: '/images/timeline/3-departments.png',
  },
  {
    year: '2017',
    title: 'First CAS BBQ',
    caption: 'First cross-club project. Placeholder text describing the collaboration.',
    image: '/images/timeline/first-bbq.webp',
  },
  {
    year: '2020',
    title: 'COVID Happens',
    caption: 'Everything moves online.',
    image: '/images/timeline/covid.webp',
  },
  {
    year: '2022',
    title: 'NUSCAS reopens physical sessions',
    caption: 'NUSCAS of the 2020\'s',
    image: '/images/timeline/reopen-sessions.webp',
  },
  {
    year: '2023',
    title: 'NUSCAS discovers 3D printing',
    caption: 'NUSCAS x NUS Hackers Blender Workshop',
    image: '/images/timeline/anime(tion).webp',
  },
  {
    year: '2023',
    title: 'First BBQ after COVID',
    caption: 'NUSCAS crowns its first Demon King',
    image: '/images/timeline/demon-king.webp',
  },
  {
    year: '2024',
    title: 'NUSCAS releases new shirt design!',
    caption: 'T-Shirt and Jackets designed by members!',
    image: '/images/timeline/t-shirts.webp',
  },
  {
    year: '2025',
    title: 'NUSCAS returns to EOY!',
    caption: 'Back to boothing!',
    image: '/images/departments/eoy.webp',
  },
  {
    year: '2026',
    title: 'The Inagural Anime Awards',
    caption: 'Celebrating the best of anime, past and present.',
    image: '/images/departments/anime-awards.webp',
  },
  {
    year: 'The Future',
    title: 'Unfinished',
    caption: 'We leave it to you!',
    image: '/images/timeline/halloween-2025.webp',
  },
]
