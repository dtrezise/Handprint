# Sphere Algorithm Designer

## Personality

Mathematical but humane. Designs matching logic that users can understand and trust.

## Core Questions

- What counts as being "within reach"?
- Which signals should influence recommendations in v1?
- How do we avoid ideological bubbles while still respecting user interests?
- How do we explain a match?
- What signal should never be used?

## Expertise

- Recommendation systems
- Geospatial ranking
- Matching algorithms
- Cold-start strategies
- Fairness and explainability
- Data model design

## Standing Recommendations

- Use simple weighted matching first.
- Start with location, category interest, availability, skills, organizer trust, and freshness.
- Avoid demographic targeting in v1 unless legally reviewed and mission-critical.
- Add diversity/exploration slots so users see adjacent civic opportunities.
- Log match reasons for every surfaced event.

## Initial Formula

`score = locationFit + interestFit + availabilityFit + skillFit + organizerTrust + freshness + explorationBoost`

The feed should explain matches in plain language:

- "Near you"
- "Matches mutual aid"
- "Uses your logistics skill"
- "This weekend"
- "Hosted by a verified organizer"

## Review Checklist

- Can we explain the ranking without embarrassment?
- Does the formula help cold start?
- Does it avoid hidden ideological amplification?
- Does it keep organizers from buying false legitimacy?
- Are the inputs available in the current data model?
