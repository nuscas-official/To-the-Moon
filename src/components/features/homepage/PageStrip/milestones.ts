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
    image: PLACEHOLDER,
  },
  {
    year: '2000\'s',
    title: 'The Foundation',
    caption: 'We grew into a society boasting more than 100 members, a dedicated committee and a strong alumni network.',
    image: PLACEHOLDER,
  },
  {
    year: '2010\'s',
    title: 'The 3 Departments',
    caption: 'Our 3 Depts Palette, TOPICS, and CASuals host a wide variety of activities and events Members get to learn new skills and meet new friends.',
    image: PLACEHOLDER,
  },
  {
    year: '2017',
    title: 'First CAS BBQ',
    caption: 'First cross-club project. Placeholder text describing the collaboration.',
    image: PLACEHOLDER,
  },
  {
    year: '2019',
    title: 'NUSCAS Population Explosion',
    caption: 'Recognition arrives. Placeholder milestone about the first award won.',
    image: PLACEHOLDER,
  },
  {
    year: '2020',
    title: 'COVID Happens',
    caption: 'Everything moves online.',
    image: PLACEHOLDER,
  },
  {
    year: '2021',
    title: 'The EXCO who stepped up',
    caption: 'They were not the step-EXCO — they were the EXCO who stepped up.',
    image: PLACEHOLDER,
  },
  {
    year: '2022',
    title: 'NUSCAS reopens physical sessions',
    caption: 'Building the foundation of NUSCAS sessions in the 2020\'s',
    image: PLACEHOLDER,
  },
  {
    year: '2023',
    title: 'NUSCAS discovers 3D printing',
    caption: 'NUSCAS x NUS Hackers Blender Workshop',
    image: PLACEHOLDER,
  },
  {
    year: '2023',
    title: 'First BBQ after COVID',
    caption: 'NUSCAS crowns its first Demon King',
    image: PLACEHOLDER,
  },
  {
    year: '2024',
    title: 'NUSCAS releases new shirt design!',
    caption: 'T-Shirt and Jackets designed by members!',
    image: PLACEHOLDER,
  },
  {
    year: '2025',
    title: 'NUSCAS returns to EOY!',
    caption: 'Back to boothing!',
    image: PLACEHOLDER,
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
    image: PLACEHOLDER,
  },
]
