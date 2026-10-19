# Don't Trust Your Teammates — Live

A live multiplayer voting game hosted by **Daniel Strand**. No player logins: participants register a name once in their browser.

## Quick start

1. Install Node.js 18+.
2. In this folder, run `npm install`.
3. Set a private host key and start:
   - macOS/Linux: `HOST_KEY='your-long-secret' npm start`
   - Windows PowerShell: `$env:HOST_KEY='your-long-secret'; npm start`
4. Open `http://localhost:3000/host` for Daniel's control page. Enter the host key.
5. Share `http://localhost:3000/` with players **only if they are on the same computer**. For remote participants, deploy the app to a public Node.js hosting service and share its HTTPS address.

## Hosting for a remote team

Deploy this directory to a Node.js hosting service that supports persistent Socket.IO/WebSocket connections (e.g. Render, Railway, Fly.io, or your own server). Configure `HOST_KEY` as a secret environment variable. Start command: `npm start`. The app listens on the host-provided `PORT`.

**Persistence:** By default the game is saved in `game-data.json` on the server. Many cloud hosts have ephemeral filesystems. Use a persistent volume and set `DATA_FILE` to its mounted file path, or game progress may be lost after restart/redeploy. Run **one server instance** only; this demo does not synchronize across multiple instances.

## Gameplay

- Players join with a unique name. Names and live votes are visible to everyone.
- Daniel opens voting. Players can choose A, B or C, change their vote, or withdraw it until closing.
- Projected points appear only when every registered player has voted. Daniel may close even if some players have not voted; in that case no one earns points for that round. This makes last-second withholding risky.
- Scoring (for a full set of votes): unanimous = +100 each; exactly one dissenter = +200 dissenter, +20 others; unique absolute majority with 2+ dissenters = 0 majority, -50 others; otherwise 0 everyone.
- Round 5 doubles all points.
- Daniel can announce messages, remove players between rounds, and reset the game.
- Closed rounds preserve scores and voting history; opening the next round clears current votes.

## Security & privacy notes

- Player registration has no authentication by design. Names are first-come-first-served, and a player's identity is stored in their browser's local storage. Clearing browser data loses that identity; the host may remove and re-add the player between rounds.
- Host actions require the private `HOST_KEY`; do not send the host key to players or include it in a shared URL.
- This is suitable for a friendly team activity, not high-security voting. It does not prevent someone from registering multiple names on different browsers.
- Votes, player names and scores are broadcast to all connected clients. Inform participants before starting.

## Dedicated Game Master page

- Player link: `https://YOUR-SERVICE.onrender.com/`
- Daniel Strand host dashboard: `https://YOUR-SERVICE.onrender.com/host`
- The host enters `HOST_KEY` in the host dashboard. The player page does not display host controls.
- After committing these files to GitHub, Render redeploys the updated site (if auto-deploy is enabled).
