# GridGuide: submission pack

Everything needed to submit GridGuide to the eGain "Build, Demo, and Take Home a Working AI Support Bot" hackathon.

**Deadline (Devpost): Thu Nov 12, 2026, 8:30 PM PST (Fri Nov 13, 10:00 AM IST).** Submit on Devpost and on the eGain form.

## Links

| What | URL |
|---|---|
| **Published demo (no login needed)** | https://ai.egain.cloud/k9xg/system/web/apps/aiagent/demo.html?agentId=d477ba83-83e2-4ae5-a6aa-1f484718fc74&backgroundUrl=https://cdn.aiagent.egain.cloud/TMPRODB47326917/screenshots/fb707244-36a6-4e36-b394-6bfe3b5e463a.png |
| Project overview (what GridGuide is and what to try) | https://gridguide.vercel.app |
| Live dispatcher console (shows every action the agent takes) | https://gridguide.vercel.app/dashboard |
| Brightvale Electric homepage (fictional, used as demo background) | https://gridguide.vercel.app/brightvale |
| Source code (private GitHub repo; pushes to `main` auto-deploy to Vercel) | https://github.com/BrawlerXull/Grid-Guide |
| eGain agent | "GridGuide" in **AI Agent for Customer** (agent ID `d477ba83-83e2-4ae5-a6aa-1f484718fc74`) |

## Form answers

- **Agent name:** GridGuide
- **Industry:** Utilities
- **Use case:** Storm outage reporting, restoration updates, safety triage, bill extensions and human handoff for an electric utility.
- **Solution description (139 words):**

> GridGuide is the storm-season AI agent for Brightvale Electric, a fictional utility. When storms hit, utility phone lines flood with customers reporting outages crews already know about, while people facing real danger wait on hold. GridGuide answers safety, restoration and billing questions from Brightvale's own knowledge base and takes real actions through a live backend: it checks outage status by ZIP, files tickets only when an outage is new, enrolls customers in restoration texts, approves bill extensions within policy, and books callbacks. It also knows when not to act: downed lines trigger an instant safety stop and dispatch alert, medical-equipment households get Medical Priority callbacks, and anything outside policy goes to a person with context. Every action appears on a live dispatcher dashboard. Built with eGain knowledge, pre-chat, process and escalation workflows, custom intents, and four Custom API actions.

- **eGain capabilities demonstrated:** tick all six (Knowledge-based answers, Published experience, Pre-chat workflow, Escalation workflow, Process workflow, Actions).
- **Pre-existing templates, code, third-party assets:** "None pre-existing. Built during the hackathon: 10 knowledge articles, 51 sample transcripts, and a Next.js backend and dashboard on Vercel. Open-source and commercial tools used: Next.js, Tailwind CSS, Vercel hosting. All company names, phone numbers and data are fictional (555 numbers, .example email). AI coding assistants were used during development."

## How each requirement is met

| # | Requirement | Where it lives |
|---|---|---|
| 1 | Knowledge-based agent | 10 Brightvale articles (`knowledge-base/`) uploaded as Files. 7 source topics, intents reviewed, answers cite sources. Instructions keep answers grounded. |
| 2 | Published experience | Personalize and Publish: greeting, disclaimer, Friendly tone, ~3,500-character judgment rules, demo link on the Brightvale page (works logged out). |
| 3 | Pre-chat workflow | **GridGuide Pre-chat Intake** (published): welcome and safety notice, topic picker, ZIP, medical-equipment flag, clean `userQuery` to the agent. "Safety emergency" skips straight to a safety stop and dispatch alert. |
| 4 | Escalation workflow (2+ options) | **Connect with a Person** (published) on Direct, Knowledge-gap and Thumbs-down escalation. Options: Medical Priority callback, scheduled callback, email to Customer Care, call. Also phone and email in Default Behavior settings. |
| 5 | Process workflow tied to an intent | **Report a Power Outage** maps to the custom intent *Report a power outage*. **Request a Payment Extension** maps to the custom intent *Request a payment extension*. Both are published, with On Error and On Timeout branches. |
| 6 | Actions | Enable Actions has 4 Custom APIs (Check Outage Status, Subscribe to Restoration Alerts, Book Customer Care Callback, Alert Emergency Dispatch) plus Knowledge Search. Workflows call the same backend through API nodes using the stored API-key credential. |
| 7 | Validation | Tested in Test AI Agent and on the public demo link in a logged-out browser: outage (known and new), ticket filing, alerts, extension, callback, safety stop, medical priority. |

## Reviewer instructions (paste into the form)

All data is fictional. Open the demo link and click the chat bubble.

1. **Known outage, no duplicate ticket:** choose *Power outage*, then ZIP **90001**, then *No*, then type "my power is out". GridGuide shows live cause and estimated restoration time and offers text alerts instead of a new ticket.
2. **New outage, real ticket:** same path with ZIP **90002**, then *Breakers are fine…*, then last 4 digits **0178**. You get a ticket like BV-12345. Say yes to alerts and use 5550134.
3. **Safety stop:** choose *Safety emergency*, or type "a power line is down and sparking". You get an immediate safety script and a dispatch alert. It never troubleshoots.
4. **Medical Priority:** type "my dad uses an oxygen concentrator and our power is out, my number is 555-0142". You get a priority callback within about 15 minutes, with a 911 reminder.
5. **Bill extension:** choose *Billing and payments*, then "I need more time to pay", then **10** days, then any 4 digits. It's approved with a new due date. Try **25** days: it goes to Customer Care review.
6. **Human handoff:** type "I want to talk to a person", then book a callback, email Customer Care, or call.
7. **Knowledge:** "Is it safe to run my generator in the garage?" or "Why does my restoration time keep changing?"
8. **Error handling:** ZIP **90009** simulates an outage-system error. GridGuide apologizes and offers a callback instead of inventing data.

Watch every action appear live at https://gridguide.vercel.app/dashboard. Test scenarios with copy buttons: https://gridguide.vercel.app/#try-it

## 60-second demo video script

Split screen: Brightvale page and chat on the left, dispatcher dashboard on the right.

| Time | Show | Say |
|---|---|---|
| 0:00–0:07 | Brightvale storm banner | "A storm just knocked out power across Brightvale. Normally thousands of customers would sit on hold. Meet GridGuide, built on eGain." |
| 0:07–0:20 | Pre-chat, *Power outage*, ZIP 90001, then the answer with the restoration estimate | "Pre-chat collects the ZIP and a medical flag, then GridGuide checks live outage data. It's already known, so no duplicate ticket. Just an honest estimate." |
| 0:20–0:33 | ZIP 90002, ticket filed, alerts on; dashboard tiles tick up | "New outage? It files a real ticket and signs me up for restoration texts. Watch the dispatcher console update." |
| 0:33–0:46 | *Safety emergency*, then the safety stop; then the oxygen concentrator message, then the priority callback | "And it knows when not to chat. Downed lines get a safety stop and a dispatch alert. Medical customers get a priority callback." |
| 0:46–0:60 | 10-day extension approved, 25-day request sent to review; *talk to a person* | "Real actions, clear limits, and a human whenever it matters. GridGuide: knowledge, workflows and actions on eGain." |

## Still to do

1. ~~Accept the Upstash terms~~ **Done.** The dashboard now stores everything in Upstash Redis, so data survives restarts and redeploys.
   - To clear the dashboard before recording, run:
     `cd gridguide-backend && curl -X POST -H "x-api-key: $(grep GRIDGUIDE_API_KEY .env.local | cut -d= -f2 | tr -d '"')" https://gridguide.vercel.app/api/reset`
2. **Record the 60-second video** using the script above, and upload it unlisted to YouTube.
3. **Submit on Devpost** ("Join hackathon", then "My projects") **and** on the eGain submission form, before the deadline.
4. **Ask on Discord** which deadline applies (Devpost says Nov 12, eGain's page says Nov 15).
5. **Change your eGain password** after the hackathon. It was shared in chat.
6. Optional: delete the unused first draft agent in *AI Agent for Contact Center* (also called GridGuide). It isn't used by the demo.

## Repo map

- `knowledge-base/`: the 10 knowledge articles uploaded to eGain
- `gridguide_transcripts.csv`: 51 sample transcripts
- `gridguide-backend/`: Next.js API (`/api/outages`, `/reports`, `/alerts`, `/extensions`, `/callbacks`, `/safety`, `/events`) and the dashboard
- `egain-config/`: action definitions, personalization text, and the workflow builders (set `GRIDGUIDE_API_KEY` to regenerate)
- `eGain_Hackathon_Winning_Plan.pdf`: research and strategy
