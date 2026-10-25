/**
 * Locations shown in the carousel on the temporary /halloween page.
 * Drop files in public/images/halloween/locations/ and set `image` to
 * '/images/halloween/locations/<file>'. A location without an image shows a
 * placeholder, so the carousel works before the art is ready.
 */
export interface HalloweenLocation {
  id: string
  name: string
  /** Kind of venue, shown as a tag under the name. */
  type: string
  /** Short blurb shown under the name. Leave out to show nothing. */
  description?: string
  /** Large backdrop shown when selected; also used for the thumbnail unless `thumb` is set. */
  image?: string
  thumb?: string
}

export const HALLOWEEN_LOCATIONS: HalloweenLocation[] = [
  { id: 'the-baron', name: 'The Baron', type: 'Hotel', description: 'One of the first hotels in Monad and one built to appeal to the tastes of the rich industrialists frequenting the capital during its Golden Age. Rumor has it that a group of occultists tried to summon a foreign god in one of the rooms.' 
    , image: '/images/halloween/the-baron.webp',
    thumb: '/images/halloween/the-baron-thumb.jpg'
  },
  { id: 'level-b1-archives', name: 'Level B1 - Archives', type: 'Museum', description: 'The lowest level of a museum founded by a group of Akademiya scholars from Sumeru seeking to preserve the unique artifacts and rituals found on Monad. The words \'Securus. Captivitas. Protego.\’ are found chiselled into an archway at its entrance.'
    , image: '/images/halloween/museum.webp'
    , thumb: '/images/halloween/museum-thumb.webp'
  },
  { id: 'sanbria-library', name: 'Sanbria Library for Higher Learning', type: 'Library', description: 'Founded by renowned Monadian mogul Minerva Sanbria.  Its gothic architecture is complemented by the everpresent smell of old books and a lingering rotting smell that never seems to leave no matter where one goes.'
    , image: '/images/halloween/library.webp'
    , thumb: '/images/halloween/library-thumb.webp'
   },
  { id: 'victor-street-police-station', name: '3 Victor Street Police Station', type: 'Police Station'
    , description: '█▓▒░ ▒█▓ ░▒▓█ ▓▒█ ▒▓░ ░▒█▓▒░█▓▒░ ▒█▓ ░▒▓█ ▓▒█ ▒▓░ ░▒█▓▒░█▓▒░ ▒█▓ ░▒▓█ ▓▒█ ▒▓░ ░▒█▓▒░█▓▒░ ▒█▓ ░▒▓█ ▓▒█ ▒▓░ ░▒█▓▒░'
    , image: '/images/halloween/police-station.webp'
    , thumb: '/images/halloween/police-station-thumb.webp'
   },
  { id: 'spirits-by-the-bay', name: 'Spirits By the Bay', type: 'Casino', description: 'The second oldest hotel in Monad and the oldest casino. This establishment was founded by Eugene Gisuppe, a Fontanian businessman who made a living off franchising fast food restaurants before the Plague of Madness rendered his hamburger business impractical' 
    , image: '/images/halloween/casino.webp'
    , thumb: '/images/halloween/casino-thumb.webp'
  },
  { id: 'bayfront', name: 'Bayfront', type: 'Promenade', description: 'A transit hub for the Monadian light rail system and one of the few places in Monad that is not utterly polluted with human filth and rot. The Bayfront is a serene plaza that offers a nice view into the stormy seas that surround the isle, populated with artworks from the many artists in Monad and a line of restaurants that serve delicious food.'
    , image: '/images/halloween/merch-shrine.webp'
    , thumb: '/images/halloween/merch-shrine.webp'
   },
  { id: 'la-stella-opera-house', name: 'La Stella Opera House', type: 'Theatre', description: 'The opera house was once known for thriving and elaborate shows that took hours to complete. It once employed artisans from the Isle and beyond. Playwrights would fight and kill one another for a chance to have their works taken on by the craftsmen of La Stella. There was no greater honor, you see, than to be put on the grandest stage that Monad had to offer. It was said that Abstragedy, the cursed play, was written by a playwright so desperate to enter into La Stella that he was willing to drive himself mad by praying to the Moon for divine truths.'
    , image: '/images/halloween/the-grand-finale.webp'
    , thumb: '/images/halloween/the-grand-finale-thumb.webp'
   },
]
