# ADR-003: Store Individual Ratings Privately, Expose Only Aggregates with 3+ Raters

**Date:** June 2026  
**Status:** Accepted

## Decision
We will keep individual member rating scores completely private. The public will only have access to aggregated average scores, which are exposed via a database view (`public_rating_aggregates`). 

Furthermore, a title's aggregate score will only be shown publicly once it has been rated by at least three (3) active members.

## Reason
1. **Member Privacy**: Members should feel free to rate titles honestly without worrying about social friction or judgments from other club members. Keeping individual ratings private prevents disclosure.
2. **De-anonymization Prevention**: If a title has only one or two ratings, it is mathematically trivial to deduce individual scores (e.g. if one member mentions they watched a niche title, and the public score is exactly 8.0, their score is exposed). The three-rater minimum threshold ensures statistically anonymous aggregates.
3. **Database-level Enforcement**: Row-Level Security (RLS) is enabled on the `ratings` table, ensuring a member can only SELECT, INSERT, UPDATE, or DELETE their own rows. Public read-only access is routed through the view, which is structurally incapable of returning individual rows.

## Alternatives Considered
- **Public Individual Profiles**: Allowing members to see each other's full list of ratings (like MyAnimeList). This was rejected to prioritize privacy and reduce peer comparison friction within the university club.
- **Aggregates without Threshold**: Exposing averages even if only one person rated a title. Rejected due to the ease of de-anonymization for niche titles.

## Consequences
- The frontend ratings page (`/ratings`) must query the `public_rating_aggregates` view, which hides titles with fewer than 3 ratings.
- For local testing, developers can temporarily lower the threshold in the database view definition (e.g., `having count(*) >= 1`), but it must be restored to `3` in the migration scripts.
