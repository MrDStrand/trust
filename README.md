# Don't Trust Your Teammates — clean rebuild

A new Node.js / Socket.IO implementation. No legacy host-page links or legacy code.

## Run

Node.js 20+. Run `npm install`, set `HOST_KEY` to a strong secret in your environment, then run `npm start`. Render: Node web service, build `npm install`, start `npm start`; set HOST_KEY in Render Environment. Do not commit the key.

Player interface: `/` or `/player.html`. Game Master interface: `/gm.html` (no player-side link). The GM page itself is public but all GM-only actions and vote/power details are protected by server-side HOST_KEY authentication.

## Rules implemented

Unlimited rounds, GM-controlled END GAME, team and individual winners including ties. Voting A/B/C (optional D), 10s/60s timers, secret SWAP assignment and one-use SWAP before voting closes, Double or Nothing, manual GM scoring with once-per-player-per-round protection. CHANGE and KO are running-order phases; their detailed effects are not implemented because their exact rules have not been supplied. Blind mode uses a 10-second timer but does not yet implement additional vote-visibility rules. Scores are derived from current player totals, so SWAP moves points between teams consistently.

All game state is in memory: a Render restart resets the game. For production use with persistent live games, add storage. Only one Node server instance is supported.

## Testing

Run `npm run check` for syntax. Browser and multi-device testing are separate and required before live use.
