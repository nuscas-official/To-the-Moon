export interface RatingAggregate {
  anilist_id: number;
  media_type: 'anime' | 'manga' | 'other';
  title_en: string;
  cover_image_url: string | null;
  average_score: number;
  rating_count: number;
}
