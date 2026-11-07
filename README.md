# GridGuide

**An eGain AI agent that helps storm-hit customers of Brightvale Electric (a fictional utility) without the hold line.**

Built for the eGain *Build, Demo, and Take Home a Working AI Support Bot* hackathon.

GridGuide answers safety, restoration and billing questions from Brightvale's own knowledge base, and it takes real actions through a live backend. It checks outage status, files tickets only when an outage is new, signs customers up for restoration texts, approves bill extensions within policy, and books callbacks. It also knows when **not** to act. Downed lines get an instant safety stop and dispatch alert. Households with medical equipment get priority callbacks. Anything outside policy goes to a person, with the conversation attached.

| | Link |
|---|---|
| Try it (live eGain demo, no login) | [Open the demo](https://ai.egain.cloud/k9xg/system/web/apps/aiagent/demo.html?agentId=d477ba83-83e2-4ae5-a6aa-1f484718fc74&backgroundUrl=https://cdn.aiagent.egain.cloud/TMPRODB47326917/screenshots/fb707244-36a6-4e36-b394-6bfe3b5e463a.png). Click the chat bubble in the bottom-right corner. |
| Project overview and test scenarios | https://gridguide.vercel.app |
| Live dispatcher console | https://gridguide.vercel.app/dashboard |
| Fictional Brightvale Electric site | https://gridguide.vercel.app/brightvale |

## How it works

1. **Pre-chat workflow** collects the topic, ZIP code and a medical-equipment flag. "Safety emergency" goes straight to a safety stop.
2. **eGain AI Agent for Customer** answers from 10 knowledge articles and follows ~3,500 characters of judgment rules.
3. **Custom intents** route outage reports and payment-extension requests to **process workflows**, which have On Error and On Timeout branches.
4. **Four Custom API actions** and workflow API nodes call the GridGuide backend using a stored API-key credential:
   - Check Outage Status
   - Subscribe to Restoration Alerts
   - Book Customer Care Callback
   - Alert Emergency Dispatch
5. **The escalation workflow** (Connect with a Person) runs when a customer asks for a person, when the agent can't answer, or on a thumbs-down.
6. **The GridGuide backend** (Next.js on Vercel, Upstash Redis) applies Brightvale policy and logs each action to the **dispatcher console**.

## Repository layout

| Path | What it is |
|---|---|
| [`gridguide-backend/`](gridguide-backend/) | Next.js app: agent-facing API (`/api/outages`, `/reports`, `/alerts`, `/extensions`, `/callbacks`, `/safety`, `/slots`) plus the overview page, the dispatcher console and the Brightvale site |
| [`knowledge-base/`](knowledge-base/) | The 10 knowledge articles uploaded to eGain |
| [`gridguide_transcripts.csv`](gridguide_transcripts.csv) | 51 sample conversations for eGain transcript mapping |
| [`egain-config/`](egain-config/) | Custom Action definitions, personalization text, and the scripts that generate the eGain workflow JSON |
| [`SUBMISSION.md`](SUBMISSION.md) | Form answers, reviewer instructions and the demo video script |

## Run the backend locally

```bash
cd gridguide-backend
npm install
vercel link && vercel env pull   # GRIDGUIDE_API_KEY and Upstash credentials
npm run dev
```

Every API route requires the `x-api-key` header. Without Upstash credentials the app falls back to in-memory storage.

## Deployment

The `gridguide-backend` folder is the Vercel project root. Pushing to `main` deploys to production, and pull requests get preview deployments.

---

Brightvale Electric is fictional. All names, phone numbers (555) and data are fictional, and email addresses use the reserved `.example` domain.
