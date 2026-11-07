import sys
sys.path.insert(0, __import__("os").path.dirname(__file__))
from wflib import WF

w = WF("Escalation: Medical Priority customers get an immediate priority callback; everyone else can book a callback, email Customer Care, or call. Every handoff includes the conversation context.")
w.start(ending="Thanks for your patience. A Brightvale specialist will take it from here.")
w.say("node_intro001", 320, 0, "I'll connect you with a Brightvale Customer Care specialist. They'll see our conversation, so you won't need to repeat yourself.")
w.cond("node_medchk01", 640, 0, "Does someone at the address rely on powered medical equipment?", [
    ("grp_medical", "Medical Priority", "wsMedical", "equals", ["Yes"]),
])
# Medical Priority path
w.say("node_medsay01", 960, -240, "Because someone at your address relies on medical equipment, I'm requesting a Medical Priority callback. If anyone is in danger or the equipment has stopped, call 911 now.")
w.ask_input("node_medph001", "phone", 1280, -240, "What number should our Medical Priority team call?", "wsPhone", skip=True)
w.api("node_apimed01", 1600, -240, "POST", "/api/callbacks", "Request a Medical Priority callback",
      [("wsApiMessage", "message"), ("wsCaseId", "callbackId")],
      body={"phone": "{{wsPhone}}", "priority": "yes", "reason": "Medical Priority: {{userQuery}}"})
w.say("node_medok001", 1920, -240, "{{wsApiMessage}}")
# Standard path
w.ask_select("node_method01", 960, 120, "How would you like to reach Customer Care?", "wsContactMethod", [
    ("Book a callback", "callback"), ("Email Customer Care", "email"), ("Call Customer Service now", "call")])
w.ask_input("node_cbphn001", "phone", 1280, 0, "What number should we call?", "wsPhone", skip=True)
w.ask_text("node_cbtime01", 1600, 0, "When would you like the call? For example: today at 3 PM, or tomorrow morning.", "wsCallbackTime", placeholder="e.g. today at 3 PM")
w.api("node_apicb001", 1920, 0, "POST", "/api/callbacks", "Book a Customer Care callback",
      [("wsApiMessage", "message"), ("wsCaseId", "callbackId")],
      body={"phone": "{{wsPhone}}", "time": "{{wsCallbackTime}}", "priority": "no", "reason": "{{userQuery}}"})
w.say("node_cbok0001", 2240, 0, "{{wsApiMessage}}")
w.ask_input("node_email001", "email", 1280, 200, "What email address should Customer Care reply to?", "wsEmail", skip=True)
w.api("node_apiem001", 1600, 200, "POST", "/api/callbacks", "Send the request to Customer Care by email",
      [("wsApiMessage", "message"), ("wsCaseId", "caseId")],
      body={"channel": "email", "email": "{{wsEmail}}", "reason": "{{userQuery}}"})
w.say("node_emok0001", 1920, 200, "{{wsApiMessage}}")
w.say("node_call0001", 1280, 400, "You can call Customer Service at (800) 555-0100, 7 AM to 8 PM Monday to Saturday, and 24 hours a day during storm emergencies. For downed lines or sparks, call 911 and our Emergency Line at (800) 555-0111.")
w.say("node_err00001", 2240, 400, "Sorry, I couldn't book that just now. Please call Customer Service at (800) 555-0100 or email help@brightvale-electric.example. In an emergency, call 911.")

w.edge("node_start001", "node_intro001")
w.edge("node_intro001", "node_medchk01")
w.edge("node_medchk01", "node_medsay01", "grp_medical")
w.edge("node_medchk01", "node_method01", "else")
w.edge("node_medsay01", "node_medph001")
w.edge("node_medph001", "node_apimed01")
w.edge("node_medph001", "node_apimed01", "onSkip")
w.edge("node_apimed01", "node_medok001", "success")
w.edge("node_apimed01", "node_err00001", "onError")
w.edge("node_apimed01", "node_err00001", "onTimeout")
w.edge("node_method01", "node_cbphn001", "opt_1")
w.edge("node_method01", "node_email001", "opt_2")
w.edge("node_method01", "node_call0001", "opt_3")
w.edge("node_cbphn001", "node_cbtime01")
w.edge("node_cbphn001", "node_cbtime01", "onSkip")
w.edge("node_cbtime01", "node_apicb001")
w.edge("node_apicb001", "node_cbok0001", "success")
w.edge("node_apicb001", "node_err00001", "onError")
w.edge("node_apicb001", "node_err00001", "onTimeout")
w.edge("node_email001", "node_apiem001")
w.edge("node_email001", "node_apiem001", "onSkip")
w.edge("node_apiem001", "node_emok0001", "success")
w.edge("node_apiem001", "node_err00001", "onError")
w.edge("node_apiem001", "node_err00001", "onTimeout")

# Hand the conversation back to GridGuide: the customer's next message becomes the agent's new question
w.ask_text("node_anyelse1", 2560, 0, "Is there anything else I can help you with?", "userQuery", placeholder="Type your question, or say no thanks")
w.to_agent("node_toagent1", 2880, 0, ["wsCaseId", "wsMedical"], send_query=True)
w.edge("node_anyelse1", "node_toagent1")
w.edge("node_medok001", "node_anyelse1")
w.edge("node_cbok0001", "node_anyelse1")
w.edge("node_emok0001", "node_anyelse1")
w.edge("node_call0001", "node_anyelse1")
w.edge("node_err00001", "node_anyelse1")
w.dump(sys.argv[1])
