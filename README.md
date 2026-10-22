# Don't Trust Your Teammates — Team Wars

## Deploy

1. Upload the contents of this folder to your GitHub repository (replace the old `server.js`, `public/index.html`, and `public/host.html`).
2. On Render use Node, build command `npm install`, start command `npm start`.
3. Set `HOST_KEY` in Render environment variables to a private, strong value.
4. Visit `/` for players and `/host` for Game Master.
5. **Reset the game before starting Team Wars** if you previously ran an older version. Old saved data is not migrated reliably.

## Rules

- Players join by name and are auto-assigned to the smaller of Blue and Red. Game Master can manually assign or randomly balance before rounds.
- Each team has independent A/B/C voting, vote counts and scoring. The other team's live votes are hidden from players; Game Master can see both.
- Scoring per team: all participating voters choose the same option: +150 each; otherwise sole voter on an option +200, largest groups 0, other groups of 2+ -50; abstainers -25.
- Five rounds; team winner has highest total points, summed from members' individual points.
- Voting supports immediate close, 10-second blind countdown, or 60-second countdown (first 30 seconds live, last 30 blind).
- During blind phase, public counts and projections freeze. Only players who voted before blind phase can change or withdraw. Optional secret D is offered to up to 3 eligible voters **per team**.
- After voting, every player with positive round winnings may choose Even/Odd to risk **only current-round winnings**, with a fresh server-generated random integer 1–100 for each attempt. A win doubles, a loss sets current-round winnings to zero. They can repeat or bank whenever they like. Players with zero or negative awards skip gambling and retain their voting award.
- No automatic gambling time limit. Game Master clicks **Close Double or Nothing & bank points** to apply all current-round winnings/penalties and advance.
- Previous rounds' scores are never gambled. Results are persisted in `game-data.json` (or the `DATA_FILE` path).
- Game Master can download team-aware CSV scoreboard and round results.

## Important

This is an in-memory real-time game with JSON persistence. Render ephemeral filesystem storage can be lost on redeploy/restart; use persistent disk or external storage for durable records. A browser's player ID is stored in localStorage; avoid sharing browsers during a game. Set a strong HOST_KEY. No voice chat is included.

## KO visibility improvements
- Players assigned KO see a prominent private notification immediately, before the superpower stage.
- Round history shows each KO victim, the points removed, and the reset to zero. The holder identity is shown only to Game Master, not other players.


## Round multiplier and compact layouts

Before opening a round, the Game Master can select a **1x–20x multiplier** (whole numbers). The setting applies to that round's **voting points and penalties**: for example, unanimous +150 at 3x becomes +450, and an abstention −25 becomes −75. Double or Nothing starts from the multiplied positive award and continues to double normally. KO still sets the victim's full positive accumulated score to zero; it is not multiplied. Each completed round stores its multiplier in history and CSV export. The multiplier cannot be changed once voting has opened.

Desktop player and host views use denser controls and scrollable history/player tables; the voting countdown is pinned to the top of the player viewport and visible while scrolling. On phones, the layout remains stacked and scrollable.
