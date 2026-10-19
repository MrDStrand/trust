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
- Live hypothetical projected points appear as soon as 2 players have voted, calculated among submitted votes only. Missing voters show no projection. This preview is explicitly labeled hypothetical: **the official rule is unchanged**. Daniel may close with missing votes, but in that case no one earns points for that round. This makes last-second withholding risky.
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

## Export results (Game Master)

Open `/host` and scroll to **Export game results**. **Download scoreboard CSV** exports current rankings, scores, current votes and provisional points, even mid-round. **Download round history CSV** exports every completed round's individual votes and points. CSV files open in Excel; the exports are downloaded to your browser and are useful backups before a Render restart. These are snapshots, not automatic cloud backups.

## 3-second closing countdown
Daniel's host dashboard has a second close button, **Close with 3-second countdown**. It broadcasts a prominent 3-2-1 banner to all connected players. Voting and vote changes remain possible until the server-side deadline, then the server closes and scores the round automatically. **Close immediately** remains available, including during the countdown. Refreshing a page during countdown restores the remaining time. Server restart during countdown interrupts the timer; do not redeploy mid-round.

When any registered player has not voted, the completed round awards zero points (consistent with the existing on-screen rules). Live hypothetical projections remain visible.

## Compact player layout
The player page now shows three side-by-side columns on desktop: vertical voting buttons, current named votes and projected scores, and official leaderboard. Live vote/outcome and round history remain below. On small screens the columns stack for readability. No server changes are required for this layout.


## Updated scoring rules

- Exactly 15 votes on the same option: +150 each.
- Exactly one vote on an option: +200 for that voter, even if other votes are split.
- Largest voting group(s), unless unanimous: 0 each (ties are all treated as largest).
- Other voting groups with 2 or more players: -50 each.
- No vote when the round closes: -25. Abstaining never blocks scoring.
- Round 5 doubles all scores, including penalties.
- Live projected points always show the outcome if the round were closed now.

For fewer than 15 registered players, unanimity does not trigger the +150 cooperation bonus. Register 15 players before the session.

## 10-second blind countdown

When the host chooses **Close with 10-second blind countdown**, the publicly visible votes, totals and projections are frozen immediately. Players who had already cast a vote may privately switch A/B/C or withdraw during the countdown; only their own screen acknowledges the change. Players without a vote when the countdown begins cannot cast one during those ten seconds. At the end, the server scores the final actual votes and reveals the results to everyone. Immediate close still closes without a countdown. All rounds use the same scoring (no final-round multiplier).
