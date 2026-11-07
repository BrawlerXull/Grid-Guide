import sys
sys.path.insert(0, __import__("os").path.dirname(__file__))
from wflib import WF

w = WF("Checks live outage status for the customer's ZIP code, avoids duplicate reports, files an outage ticket when needed, and offers restoration text alerts. Handles API errors and timeouts gracefully.")
w.start(ending="Thanks for reporting your outage. Stay safe!")
w.ask_text("node_zip00001", 320, 0, "What's the 5-digit ZIP code of the address without power?", "wsZip", skip=True, placeholder="e.g. 90001")
w.api("node_apichk01", 640, 0, "GET", "/api/outages?zip={{wsZip}}", "Check live outage status for the ZIP code",
      [("wsOutageStatus", "status"), ("wsEtr", "etr"), ("wsCustomersAffected", "customersAffected"), ("wsOutageCause", "cause"), ("wsApiMessage", "message")])
w.cond("node_known001", 960, 0, "Is this outage already known or reported?", [
    ("grp_known", "Known outage", "wsOutageStatus", "equals", ["known"]),
    ("grp_reported", "Already reported", "wsOutageStatus", "equals", ["reported"]),
])
# known / reported: no duplicate ticket
w.say("node_saykn001", 1280, -160, "{{wsApiMessage}}")
# not known: check breakers, then file a report
w.ask_select("node_breaker1", 1280, 160, "We don't have a known outage at {{wsZip}} yet. Have you checked your circuit breakers, and do your neighbors have power?", "wsBreakers", [
    ("Breakers are fine, neighbors are out too", "full"),
    ("Only my home, or only part of it, is out", "partial"),
    ("I haven't checked yet", "unchecked"),
])
w.say("node_saybrk01", 1600, 360, "Please check your breaker panel and reset any tripped breakers. If the power is still out, I'll file the report now so a crew can take a look.")
w.ask_text("node_last4001", 1920, 160, "To file the report, what are the last 4 digits of the phone number on the account? (Please don't share your full account number.)", "wsPhoneLast4", skip=True, placeholder="e.g. 0178", minLength=4, maxLength=4)
w.api("node_apirep01", 2240, 160, "POST", "/api/reports", "File an outage report",
      [("wsTicketId", "ticketId"), ("wsApiMessage", "message")],
      body={"zip": "{{wsZip}}", "phoneLast4": "{{wsPhoneLast4}}", "partial": "{{wsBreakers}}"})
w.say("node_sayrep01", 2560, 160, "{{wsApiMessage}}")
# alerts (shared by both paths)
w.ask_select("node_alerts01", 2880, 0, "Would you like restoration text alerts? We'll text you when the estimate changes and when power is back.", "wsWantsAlerts", [("Yes, text me", "Yes"), ("No thanks", "No")])
w.ask_input("node_phone001", "phone", 3200, -120, "What mobile number should we text?", "wsPhone", skip=False)
w.api("node_apialt01", 3520, -120, "POST", "/api/alerts", "Enroll the mobile number in restoration alerts",
      [("wsApiMessage", "message")], body={"phone": "{{wsPhone}}", "zip": "{{wsZip}}"})
w.say("node_sayalt01", 3840, -120, "{{wsApiMessage}}")
w.say("node_saynoa01", 3200, 140, "No problem. You can check back here any time for the latest estimate.")
# graceful failure
w.say("node_sayerr01", 960, 360, "Sorry, I couldn't reach our outage system just now. Please try again in a few minutes, call Customer Service at (800) 555-0100, or ask me to book a callback. If you see a downed line, call 911 and (800) 555-0111.")

w.edge("node_start001", "node_zip00001")
w.edge("node_zip00001", "node_apichk01")
w.edge("node_zip00001", "node_apichk01", "onSkip")
w.edge("node_apichk01", "node_known001", "success")
w.edge("node_apichk01", "node_sayerr01", "onError")
w.edge("node_apichk01", "node_sayerr01", "onTimeout")
w.edge("node_known001", "node_saykn001", "grp_known")
w.edge("node_known001", "node_saykn001", "grp_reported")
w.edge("node_known001", "node_breaker1", "else")
w.edge("node_saykn001", "node_alerts01")
w.edge("node_breaker1", "node_last4001", "opt_1")
w.edge("node_breaker1", "node_last4001", "opt_2")
w.edge("node_breaker1", "node_saybrk01", "opt_3")
w.edge("node_saybrk01", "node_last4001")
w.edge("node_last4001", "node_apirep01")
w.edge("node_last4001", "node_apirep01", "onSkip")
w.edge("node_apirep01", "node_sayrep01", "success")
w.edge("node_apirep01", "node_sayerr01", "onError")
w.edge("node_apirep01", "node_sayerr01", "onTimeout")
w.edge("node_sayrep01", "node_alerts01")
w.edge("node_alerts01", "node_phone001", "opt_1")
w.edge("node_alerts01", "node_saynoa01", "opt_2")
w.edge("node_phone001", "node_apialt01")
w.edge("node_apialt01", "node_sayalt01", "success")
w.edge("node_apialt01", "node_sayerr01", "onError")
w.edge("node_apialt01", "node_sayerr01", "onTimeout")
w.dump(sys.argv[1])
