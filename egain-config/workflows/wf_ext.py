import sys
sys.path.insert(0, __import__("os").path.dirname(__file__))
from wflib import WF

w = WF("Guides the customer through a bill payment extension. Up to 14 days is approved automatically once every 12 months; longer or repeat requests are sent to Customer Care review, and over 30 days is offered a payment plan.")
w.start(ending="Thanks for contacting Brightvale Electric.")
w.say("node_intro001", 320, 0, "I can help with more time to pay. Extensions of up to 14 days are usually approved right away, once every 12 months. Longer requests go to our Customer Care team for review.")
w.ask_input("node_days0001", "number", 640, 0, "How many extra days do you need? (1 to 30)", "wsExtensionDays")
w.ask_text("node_last4001", 960, 0, "What are the last 4 digits of the phone number on the account? (Please don't share your full account number.)", "wsPhoneLast4", skip=True, placeholder="e.g. 3307", minLength=4, maxLength=4)
w.api("node_apiext01", 1280, 0, "POST", "/api/extensions", "Request a payment extension under the Brightvale policy",
      [("wsDecision", "decision"), ("wsApiMessage", "message"), ("wsCaseId", "caseId")],
      body={"days": "{{wsExtensionDays}}", "phoneLast4": "{{wsPhoneLast4}}"})
w.cond("node_decide01", 1600, 0, "What did the extension policy decide?", [
    ("grp_approved", "Auto-approved", "wsDecision", "equals", ["approved"]),
    ("grp_review", "Needs human review", "wsDecision", "equals", ["needs_review"]),
])
w.say("node_sayok001", 1920, -200, "{{wsApiMessage}}")
w.say("node_sayrev01", 1920, 0, "{{wsApiMessage}}")
w.say("node_saynot01", 1920, 220, "{{wsApiMessage}}")
w.ask_select("node_wantcb01", 2240, 100, "Would you like a callback from Customer Care to talk it through?", "wsWantsCallback", [("Yes, please call me", "Yes"), ("No thanks", "No")])
w.ask_input("node_phone001", "phone", 2560, 0, "What number should Customer Care call?", "wsPhone")
w.api("node_apicb001", 2880, 0, "POST", "/api/callbacks", "Book a Customer Care callback about the payment request",
      [("wsApiMessage", "message"), ("wsCaseId", "callbackId")],
      body={"phone": "{{wsPhone}}", "reason": "Payment extension or payment plan ({{wsExtensionDays}} days requested)", "priority": "no"})
w.say("node_saycb001", 3200, 0, "{{wsApiMessage}}")
w.say("node_nocb0001", 2560, 220, "No problem. If you need anything else, I'm here to help.")
w.say("node_sayerr01", 1600, 380, "Sorry, I couldn't reach our billing system just now. Please try again shortly, or call Customer Service at (800) 555-0100.")

w.edge("node_start001", "node_intro001")
w.edge("node_intro001", "node_days0001")
w.edge("node_days0001", "node_last4001")
w.edge("node_last4001", "node_apiext01")
w.edge("node_last4001", "node_apiext01", "onSkip")
w.edge("node_apiext01", "node_decide01", "success")
w.edge("node_apiext01", "node_sayerr01", "onError")
w.edge("node_apiext01", "node_sayerr01", "onTimeout")
w.edge("node_decide01", "node_sayok001", "grp_approved")
w.edge("node_decide01", "node_sayrev01", "grp_review")
w.edge("node_decide01", "node_saynot01", "else")
w.edge("node_sayrev01", "node_wantcb01")
w.edge("node_saynot01", "node_wantcb01")
w.edge("node_wantcb01", "node_phone001", "opt_1")
w.edge("node_wantcb01", "node_nocb0001", "opt_2")
w.edge("node_phone001", "node_apicb001")
w.edge("node_apicb001", "node_saycb001", "success")
w.edge("node_apicb001", "node_sayerr01", "onError")
w.edge("node_apicb001", "node_sayerr01", "onTimeout")
w.dump(sys.argv[1])
