"""Tiny builder for eGain Agentic Studio workflow JSON."""
import json, os

BASE = "https://gridguide.vercel.app"
CRED_ID = "28a7b648-66a6-400d-bcda-6d00f0a763d6"
KEY = os.environ["GRIDGUIDE_API_KEY"]  # read from the environment; never commit the key


class WF:
    def __init__(self, description):
        self.description, self.nodes, self.edges = description, [], []

    def node(self, nid, ntype, x, y, data):
        self.nodes.append({"id": nid, "nodeType": ntype, "position": {"x": x, "y": y}, "data": data})
        return nid

    def edge(self, src, dst, handle="default"):
        self.edges.append({"source": src, "target": dst, "sourceHandle": handle, "targetHandle": "input",
                           "id": f"edge_{len(self.edges):03d}_{src[-5:]}_{dst[-5:]}"})

    # convenience builders
    def start(self, x=0, y=0, ending="Thanks for contacting Brightvale Electric."):
        return self.node("node_start001", "start", x, y, {
            "defaultInvalidMessage": "Sorry, I didn't catch that. Please try again.",
            "defaultEndingMessage": ending, "maxRuns": 3})

    def say(self, nid, x, y, text):
        return self.node(nid, "statement", x, y, {"text": text})

    def ask_text(self, nid, x, y, text, var, skip=False, placeholder="Type your answer...", **extra):
        d = {"text": text, "skipIfPresent": skip, "variableKey": var, "placeholder": placeholder}
        d.update(extra)
        return self.node(nid, "question.text", x, y, d)

    def ask_select(self, nid, x, y, text, var, options, skip=False):
        opts = [{"id": f"opt_{i+1}", "label": lbl, "value": val} for i, (lbl, val) in enumerate(options)]
        return self.node(nid, "question.select", x, y, {"text": text, "skipIfPresent": skip, "variableKey": var, "options": opts})

    def ask_input(self, nid, ntype, x, y, text, var, skip=False):
        return self.node(nid, ntype, x, y, {"text": text, "inputType": ntype, "skipIfPresent": skip, "variableKey": var})

    def api(self, nid, x, y, method, path, description, outputs, body=None):
        return self.node(nid, "api", x, y, {
            "method": method, "url": BASE + path, "description": description, "protocol": "rest",
            "credentialId": CRED_ID, "authType": "none", "authConfig": {}, "queryParams": [],
            "headers": [{"key": "x-api-key", "value": KEY}],
            "body": {"contentType": "application/json", "content": json.dumps(body) if body else ""},
            "outputVariables": [{"mappingType": "body", "responsePath": p, "mappedVariable": v} for v, p in outputs],
            "successCondition": "",
            "timeout": {"connection": 5000, "response": 15000},
            "retry": {"maxAttempts": 0, "backoff": "none", "initialDelayMs": 1000, "retryableCodes": [429, 500, 502, 503, 504]},
        })

    def cond(self, nid, x, y, description, groups):
        """groups: list of (group_id, label, variable, operator, [values])"""
        return self.node(nid, "condition", x, y, {"description": description, "groups": [
            {"id": gid, "label": label, "rules": [{"variableName": var, "operator": op, "values": vals}]}
            for gid, label, var, op, vals in groups]})

    def to_agent(self, nid, x, y, variables=(), send_query=False):
        return self.node(nid, "sendToAIAgent", x, y, {"dataSource": "userQuery", "sendUserQuery": send_query,
                                                       "sendQueryOps": False, "variables": list(variables)})

    def dump(self, path):
        json.dump({"description": self.description, "inputs": [], "nodes": self.nodes, "edges": self.edges}, open(path, "w"), indent=1)
        print(len(self.nodes), "nodes,", len(self.edges), "edges ->", path)
