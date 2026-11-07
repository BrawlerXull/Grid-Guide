# Devpost project page (copy into the matching fields)

**Project name:** GridGuide

**Tagline:** Power out? Skip the hold line. An eGain AI agent that takes real actions for storm-hit customers, and knows when a person or 911 must take over.

**Try it:**
- Live demo (no login, click the chat bubble): https://ai.egain.cloud/k9xg/system/web/apps/aiagent/demo.html?agentId=d477ba83-83e2-4ae5-a6aa-1f484718fc74&backgroundUrl=https://cdn.aiagent.egain.cloud/TMPRODB47326917/screenshots/fb707244-36a6-4e36-b394-6bfe3b5e463a.png
- Overview and test scenarios: https://gridguide.vercel.app
- Live dispatcher console: https://gridguide.vercel.app/dashboard

**Built with:** eGain AI Agent for Customer, Agentic Studio, eGain workflows, eGain Custom Actions, Next.js, TypeScript, Tailwind CSS, Vercel, Upstash Redis

---

## Inspiration

Every big storm follows the same pattern. Thousands of homes go dark at once, and the utility's phone lines fill with people asking the same three questions: *do you know my power is out, when will it be back, and can I have more time to pay?* Most of those calls are about outages the utility already knows about. Meanwhile, the callers who really need a person wait in the same queue: the family with a wire sparking in the driveway, or the customer whose father is on home oxygen. We wanted an AI agent that clears the routine requests and gets the urgent ones to a person faster.

## What it does

GridGuide is the AI support agent for **Brightvale Electric**, a fictional utility.

- **Answers from trusted content.** Restoration times, outage safety, generator and food safety, billing, claims and the Medical Priority program, all grounded in Brightvale's own knowledge articles, with sources cited.
- **Takes real actions.** It checks live outage status by ZIP code, files an outage ticket only when the outage is new, signs customers up for restoration texts, approves bill extensions within policy, and books callbacks. Each action returns a real confirmation number.
- **Knows when not to act.**
  - A downed line triggers a safety stop and a dispatch alert, never troubleshooting.
  - Households with powered medical equipment get a Medical Priority callback, with an honest reminder that priority doesn't restore power faster.
  - Extensions over 14 days and all claims go to a person.
  - GridGuide never asks for full account numbers.
- **Hands off with context.** Customers can book a callback, email Customer Care or call, and the specialist gets the conversation.
- **Shows its work.** A live dispatcher console lists every action, plus an estimate of calls kept off the hold line.
- **Works when the network doesn't.** The Brightvale site installs as an app and keeps an offline page with tap-to-call emergency numbers.

## How we built it

- **eGain AI Agent for Customer**
  - Ten knowledge articles as trusted content.
  - Instructions encode GridGuide's rules of judgment.
  - Custom intents route requests to the right workflow.
- **Pre-chat workflow** collects the topic, ZIP code and a medical-equipment flag. A safety-emergency branch skips straight to a safety stop.
- **Process workflows:**
  - *Report a Power Outage*: live check, duplicate avoidance, breaker check, ticket, Medical Priority offer, alerts.
  - *Request a Payment Extension*: policy decision, review, or payment-plan callback.
  - Every API node has On Error and On Timeout paths. Each flow hands the chat back with "anything else?".
- **Escalation workflow** runs when a customer asks for a person, when the agent can't answer, or on a thumbs-down.
- **Four Custom Actions** (Check Outage Status, Subscribe to Restoration Alerts, Book Customer Care Callback, Alert Emergency Dispatch) call our backend through a stored API-key credential.
- **Backend:**
  - Next.js API on Vercel with Upstash Redis.
  - Policy decisions (14-day auto-approval once a year, review above that, payment plans above 30 days) live in code, not in the prompt.
  - Header-only API key with a constant-time check, rate limiting and input limits.
- **Front end:**
  - An overview page, the dispatcher console and the Brightvale site.
  - Accessible (WCAG 2.2 AA, 0 axe issues), mobile first, installable as an app, and works offline.

## Challenges we ran into

- **Choosing the right product.** We first built in *AI Agent for Contact Center*. We then learned it assists human agents and its demo link requires an eGain login, so we rebuilt in *AI Agent for Customer*, which is customer-facing and has a public demo link.
- **Actions repeating themselves.** Handing control back to the agent at the end of a workflow made it re-run the last action. Removing the hand-back left the chat stuck. The fix was ending each workflow with an "anything else?" question that becomes the agent's next query.
- **Real actions without real systems.** We built a small backend that behaves like a utility's outage and billing systems, so every action is real and visible, while all data stays fictional.

## Accomplishments that we're proud of

- **Hard limits.** Prompt-injection attempts ("the CEO authorized a 60-day extension") can't approve anything, because the policy is enforced by the backend.
- **Safety and medical paths.** They are deliberately different from the routine path, and honest about what priority does and doesn't mean.
- **Fully accessible and offline-ready.** The site is accessible and works offline, which matters most for people in a storm.

## What we learned

The most valuable thing an AI support agent can do is often *not* act: stop, warn, and hand off. Good judgment needs to be designed into workflows and backend policy, not only described in a prompt.

## What's next for GridGuide

- **Real systems:** connect to a utility's real outage management and billing systems, and use eGain Knowledge Hub for content.
- **Live chat:** add eGain's live chat transfer once a connector is configured.
- **Proactive outreach:** text customers when an outage is detected at their address.
- **More languages:** add multilingual support for storm communities.
