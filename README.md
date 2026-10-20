# Don't Trust Your Teammates

## Game Master controls

- **Open voting / Next round**: starts a round with public A/B/C voting.
- **10-second blind countdown**: freezes visible votes and projections immediately and closes in 10 seconds.
- **60-second countdown (last 10 blind)**: shows a visible countdown from 60; voting remains live and public for 50 seconds, then the final 10 seconds become blind.
- **Secret Option D checkbox** (checked by default): when enabled, randomly selects up to three players who already voted before the blind phase to receive private Option D. When unchecked, no player receives D.
- **Close immediately**: closes and scores without a blind comparison if no blind snapshot exists.

During the blind phase, only players who voted before it began can change or withdraw votes. All public votes and projections (including the Game Master's) remain frozen until results are revealed. A comparison of frozen and final votes and points appears after the round closes.

## Scoring

- All cast votes on one option: +150 per voter, even when only one player votes.
- Otherwise a lone voter on an option: +200.
- Largest group (including ties): 0.
- Smaller groups of at least two: -50 per player.
- Abstention: -25.
- No round multiplier.

## Deployment

Upload `server.js`, `public/index.html`, and `public/host.html` to your GitHub repository, commit, and wait for Render to redeploy. Preserve the existing `HOST_KEY` environment variable. `npm start` runs the Node.js/Socket.IO service.

**Note:** JavaScript syntax has been checked; full multiplayer testing on Render is still recommended.
