"""Generate the GridGuide pre-chat workflow JSON."""
import json, sys

nodes, edges = [], []
def node(nid, ntype, x, y, data):
    nodes.append({"id": nid, "nodeType": ntype, "position": {"x": x, "y": y}, "data": data})
def edge(src, dst, handle="default"):
    edges.append({"source": src, "target": dst, "sourceHandle": handle, "targetHandle": "input", "id": f"edge_{src[-4:]}_{dst[-4:]}_{handle[-4:]}"})

node("node_start001", "start", 0, 0, {
    "defaultInvalidMessage": "Sorry, I didn't catch that. Please try again.",
    "defaultEndingMessage": "Thanks for contacting Brightvale Electric. Stay safe!",
    "maxRuns": 3})
node("node_welcome1", "statement", 0, 140, {"text": "Hi, I'm GridGuide, Brightvale Electric's virtual assistant. If you see a downed power line, sparks or fire, stay at least 35 feet away and call 911 and our Emergency Line at (800) 555-0111 right now."})
node("node_topic001", "question.select", 340, 140, {
    
    "text": "What can I help you with today?",
    "skipIfPresent": False,
    "variableKey": "wsTopic",
    "options": [
        {"id": "opt_1", "label": "Power outage", "value": "outage"},
        {"id": "opt_2", "label": "Safety emergency", "value": "safety"},
        {"id": "opt_3", "label": "Billing and payments", "value": "billing"},
        {"id": "opt_4", "label": "Something else", "value": "other"},
    ]})
# Safety branch: show the safety stop, then hand to the AI Agent with a query that triggers emergency dispatch
node("node_safety01", "statement", 700, -60, {"text": "Your safety comes first. Please stay at least 35 feet away, keep others away, and call 911 and our 24-hour Emergency Line at (800) 555-0111 now. Downed lines can't be fixed through chat. I'm alerting our emergency dispatch team."})
node("node_safetyq1", "setVariable", 1040, -60, {"assignments": [
    {"variable": "userQuery", "valueType": "static", "value": "Safety emergency reported in pre-chat: possible downed power line or electrical hazard. Alert emergency dispatch now and repeat the safety instructions."}]})
# Outage branch
node("node_zip00001", "question.text", 700, 120, {
    "text": "What's the 5-digit ZIP code of the address without power?",
    "skipIfPresent": True, "variableKey": "wsZip", "placeholder": "e.g. 90001", "retryLimit": 2,
    "retryMessage": "Please enter a 5-digit ZIP code, for example 90001.", "minLength": 5, "maxLength": 5})
node("node_medical1", "question.select", 1040, 120, {
    
    "text": "Does anyone at this address rely on powered medical equipment, like oxygen, dialysis or refrigerated medicine?",
    "skipIfPresent": True, "variableKey": "wsMedical",
    "options": [{"id": "opt_1", "label": "Yes", "value": "Yes"}, {"id": "opt_2", "label": "No", "value": "No"}]})
node("node_outageq1", "question.text", 1380, 120, {
    "text": "Thanks. In a few words, what's happening? For example: my power is out, or only part of my house has power.",
    "skipIfPresent": False, "variableKey": "userQuery", "placeholder": "Type your answer..."})
# Billing / other
node("node_otherq01", "question.text", 700, 330, {
    "text": "Sure. In a few words, how can I help?",
    "skipIfPresent": False, "variableKey": "userQuery", "placeholder": "Type your question..."})
node("node_send0001", "sendToAIAgent", 1720, 200, {
    "dataSource": "userQuery", "sendUserQuery": True, "sendQueryOps": False,
    "variables": ["wsTopic", "wsZip", "wsMedical"]})

edge("node_start001", "node_welcome1")
edge("node_welcome1", "node_topic001")
edge("node_topic001", "node_zip00001", "opt_1")
edge("node_topic001", "node_safety01", "opt_2")
edge("node_topic001", "node_otherq01", "opt_3")
edge("node_topic001", "node_otherq01", "opt_4")
edge("node_safety01", "node_safetyq1")
edge("node_safetyq1", "node_send0001")
edge("node_zip00001", "node_medical1")
edge("node_medical1", "node_outageq1", "opt_1")
edge("node_medical1", "node_outageq1", "opt_2")
edge("node_zip00001", "node_medical1", "onSkip")
edge("node_medical1", "node_outageq1", "onSkip")
edge("node_outageq1", "node_send0001")
edge("node_otherq01", "node_send0001")

wf = {"description": "Greets the customer, shows the safety notice, captures the topic, ZIP code and medical-equipment flag, then hands a clean userQuery to GridGuide.",
      "inputs": [], "nodes": nodes, "edges": edges}
json.dump(wf, open(sys.argv[1], "w"), indent=1)
print(len(nodes), "nodes,", len(edges), "edges")
