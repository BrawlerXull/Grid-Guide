/** Shared links and copy for the GridGuide demo site (all data fictional). */

export const DEMO_URL =
  "https://ai.egain.cloud/k9xg/system/web/apps/aiagent/demo.html?agentId=d477ba83-83e2-4ae5-a6aa-1f484718fc74&backgroundUrl=https://cdn.aiagent.egain.cloud/TMPRODB47326917/screenshots/fb707244-36a6-4e36-b394-6bfe3b5e463a.png";

export const CONTACT = {
  emergency: { label: "(800) 555-0111", tel: "+18005550111" },
  service: { label: "(800) 555-0100", tel: "+18005550100" },
  medical: { label: "(800) 555-0155", tel: "+18005550155" },
  email: "help@brightvale-electric.example",
};

export interface Scenario {
  id: string;
  title: string;
  steps: string;
  copy?: string;
  expect: string;
  shows: string;
}

/** Test scenarios for judges and reviewers. */
export const SCENARIOS: Scenario[] = [
  {
    id: "known",
    title: "Known outage, no duplicate ticket",
    steps: "Choose “Power outage”, enter ZIP 90001, answer “No”, then type “my power is out”.",
    copy: "90001",
    expect: "GridGuide shows the live cause and estimated restoration time and offers text alerts instead of opening a new ticket.",
    shows: "Live action plus good judgment",
  },
  {
    id: "new",
    title: "New outage, real ticket",
    steps: "Choose “Power outage”, enter ZIP 90002, pick “Breakers are fine…”, then last 4 digits 0178.",
    copy: "90002",
    expect: "A ticket such as BV-12345 is filed, then you can sign up for restoration texts.",
    shows: "Process workflow tied to an intent",
  },
  {
    id: "safety",
    title: "Downed line safety stop",
    steps: "Choose “Safety emergency” or type “a power line is down and sparking”.",
    expect: "An immediate safety script with 911 and the Emergency Line, plus a dispatch alert. No troubleshooting in chat.",
    shows: "Knowing when not to act",
  },
  {
    id: "medical",
    title: "Medical Priority",
    steps: "Type “my dad uses an oxygen concentrator and our power is out, my number is 555-0142”.",
    expect: "A Medical Priority callback within about 15 minutes, with a reminder to call 911 if anyone is in danger.",
    shows: "Protecting vulnerable customers",
  },
  {
    id: "billing",
    title: "More time to pay",
    steps: "Choose “Billing and payments”, ask for more time, enter 10 days and any 4 digits. Try 25 days next.",
    copy: "10",
    expect: "10 days is approved with a new due date. 25 days goes to Customer Care review, never auto-approved.",
    shows: "Bounded autonomy",
  },
  {
    id: "person",
    title: "Talk to a person",
    steps: "Type “I want to talk to a person”.",
    expect: "Choose a callback, an email to Customer Care, or the phone number. The specialist gets the conversation.",
    shows: "Escalation workflow",
  },
  {
    id: "error",
    title: "System error handling",
    steps: "Choose “Power outage” and enter ZIP 90009.",
    copy: "90009",
    expect: "GridGuide apologizes and offers a callback or phone number instead of inventing data.",
    shows: "Reliability",
  },
];

export const RULES = [
  { title: "Safety first", body: "Downed lines, sparks or fire get a safety stop and a dispatch alert. GridGuide never troubleshoots them in chat." },
  { title: "Medical Priority", body: "Households with powered medical equipment get a priority callback, and are told honestly it does not mean faster restoration." },
  { title: "No duplicate tickets", body: "Known outages get an estimate and alerts, not another report. Estimates are always called estimates." },
  { title: "Bounded autonomy", body: "Extensions up to 14 days are approved once a year. Anything longer goes to a person, with no promises." },
  { title: "Claims stay human", body: "GridGuide explains the policy but never approves or denies a claim." },
  { title: "Privacy", body: "Only a ZIP code and the last 4 digits of a phone number. Never full account numbers, passwords or card details." },
];
