# Affirmation Agent Messaging And Share Strategy

## Product Intent

Handprint should support text interaction without recreating the worst patterns of public social media. World Changers and World Enablers need comments, thank-yous, recruitment notes, event follow-up, and public share captions. The difference is that Handprint should treat every message as part of a culture of useful action.

The goal is not to remove emotion. The goal is to turn emotion into repair, invitation, gratitude, encouragement, and practical next steps.

## V1 Surfaces

- Wave tab captions for Facebook, Instagram, LinkedIn, TikTok-style reels, direct messages, and other outside platforms.
- In-app comments on public Handprint achievements.
- World Changer to World Enabler follow-up messages.
- World Enabler recruitment messages to interested followers.
- Event update notes after RSVPs, check-ins, and impact receipts.

## Share Formats

The Wave tab should treat each platform as a different output format:

- Facebook post: link preview, milestone line, and invitation.
- Instagram story: vertical card with Handprint identity, tier, points, and QR-aware visual language.
- Instagram reel: short caption and cover prompt around a recent useful action.
- LinkedIn post: credibility-first contribution summary that can support service, leadership, and resume value.
- TikTok or reel-style video: short hook, recent action, and join-in prompt.
- Messages: direct invite with one clear ask.

The user should be able to add a message, but the prepared message should pass the same Handprint posting standard before sharing.

## Affirmation Agent Standard

The agent should review for:

- Personal attacks.
- Mocking, shaming, bullying, or humiliation.
- Broad blame that turns a concern into a pile-on.
- Unsupported claims beyond what Handprint can verify.
- Discouraging messages that do not point toward a useful action.
- Dehumanizing or exclusionary language.

The agent should rewrite toward:

- "Here is what I am doing next."
- "Thank you for showing up."
- "Come help with this concrete action."
- "I am frustrated, and I want to turn that energy into useful work."
- "This matters because the world changes when people do the next helpful thing."

## UX Principle

The agent should feel like a coach, not a cop.

Recommended V1 interaction:

1. User writes message.
2. Agent returns one of two states: Ready to post or Rewrite suggested.
3. If rewrite is suggested, the user sees the concern and a better version.
4. User can apply the rewrite.
5. Severe or repeated violations move to human review.

Do not publish unreviewed public comments in V1.

## Governance

Production moderation should eventually include:

- Model-backed review with policy prompts and structured output.
- Audit log for reviewed messages.
- Reviewer queue for severe or repeated violations.
- Appeal state for users who believe a rewrite misunderstood them.
- Separate rules for minors, youth events, political activity, fundraising, and crisis language.
- Privacy rules for direct messages.

## Open Product Questions

- How much private messaging should V1 allow before trust and reporting tools are mature?
- Should users be able to see why a post was rewritten, or only see the rewrite?
- What messages should be blocked outright rather than rewritten?
- How should Handprint handle sarcasm, grief, anger, and urgent advocacy without flattening real human feeling?
- Should World Enablers get stricter standards because they represent organizations?

## Current Prototype

The web prototype now includes:

- A Social Wave Kit inside the Wave tab.
- Platform-specific format selection.
- Caption/message composer.
- Prepared Handprint preview.
- Affirmation Agent status.
- Suggested rewrite behavior.
- A separate in-app message composer for World Changer and World Enabler interaction.
- Saved share drafts, share history, comments, messages, reports, mute/block controls, and moderation timeline backed by the local social ledger.
- Web API route: `/api/social`.
- Mobile API route: `/api/mobile/social`.
- iPhone-native Wave Kit and Affirmation Agent prototype in the Wave tab.

This is not a production moderation system yet. It is a visible product model for evaluating tone, workflow, and cultural fit before connecting a real AI moderation service.
