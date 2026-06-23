import os, json, re

ROOT = "/tmp/lixen-src/lixenai-marketing-agents"

# Conceptual category mapping by folder
CAT = {
    "agents": "Agents",
    "workflows": "Workflows",
    "templates": "Templates",
    "qa": "QA / Checklists",
    "config": "Config / Constraints",
    "examples": "Examples",
}

def title_from(path, content):
    # markdown first H1
    m = re.search(r'^#\s+(.+)$', content, re.M)
    if m:
        return m.group(1).strip()
    base = os.path.basename(path)
    name = os.path.splitext(base)[0].replace("-", " ").replace("_", " ")
    return name.title()

def summary_from(path, content):
    if path.endswith(".md"):
        # find first paragraph after a Role/Purpose heading or first non-heading line
        lines = content.splitlines()
        # try Role / Purpose section
        for sec in ["## Role", "## Purpose"]:
            if sec in content:
                idx = content.index(sec) + len(sec)
                rest = content[idx:].strip().splitlines()
                para = []
                for l in rest:
                    if l.strip().startswith("#"):
                        break
                    if l.strip():
                        para.append(l.strip())
                    elif para:
                        break
                if para:
                    return " ".join(para)[:400]
        # fallback: first non-heading, non-code paragraph
        para = []
        for l in lines:
            s = l.strip()
            if not s or s.startswith("#") or s.startswith("```"):
                if para: break
                continue
            para.append(s)
        return (" ".join(para)[:400]) if para else ""
    else:  # yaml
        # first description: or top-level key + a few keys
        m = re.search(r'description:\s*["\']?(.+?)["\']?\s*$', content, re.M)
        topkeys = re.findall(r'^([a-zA-Z_]+):', content, re.M)
        desc = m.group(1).strip() if m else ""
        if topkeys:
            return (desc + (" " if desc else "") + "Top-level keys: " + ", ".join(dict.fromkeys(topkeys[:6]))).strip()[:400]
        return desc[:400]

def headings(content):
    return re.findall(r'^##\s+(.+)$', content, re.M)[:8]

items = []
for folder, cat in CAT.items():
    d = os.path.join(ROOT, folder)
    if not os.path.isdir(d):
        continue
    for fn in sorted(os.listdir(d)):
        p = os.path.join(d, fn)
        if not os.path.isfile(p):
            continue
        with open(p, encoding="utf-8") as fh:
            content = fh.read()
        kind = "yaml" if fn.endswith((".yaml", ".yml")) else "markdown"
        items.append({
            "id": f"{folder}/{fn}",
            "category": cat,
            "folder": folder,
            "filename": fn,
            "kind": kind,
            "title": title_from(p, content),
            "summary": summary_from(p, content),
            "sections": headings(content) if kind == "markdown" else [],
            "lines": content.count("\n") + 1,
            "bytes": len(content.encode("utf-8")),
            "repoPath": f"lixenai-marketing-agents/{folder}/{fn}",
        })

# README agent table lists 7 agents but repo has 4 files; add the 3 referenced-but-missing agents as seeded entries
existing_agents = {i["filename"] for i in items if i["folder"] == "agents"}
referenced = {
    "ads-manager-agent.md": ("Ads Manager Agent", "Ad angles, ad copy, creative briefs, and paid-readiness gating. Referenced in the README agent roster but not yet present as a file in the source repo — seeded from repo documentation."),
    "social-media-agent.md": ("Social Media Agent", "LinkedIn, Instagram, TikTok, Shorts, and content calendars for organic-first partner recruitment. Referenced in the README agent roster but not yet present as a file in the source repo — seeded from repo documentation."),
    "sales-enablement-agent.md": ("Sales Enablement Agent", "Discovery, demo, objection handling, proposals, and partner training. Referenced in the README agent roster but not yet present as a file in the source repo — seeded from repo documentation."),
}
for fn,(t,s) in referenced.items():
    if fn not in existing_agents:
        items.append({
            "id": f"agents/{fn}", "category":"Agents","folder":"agents","filename":fn,"kind":"markdown",
            "title":t,"summary":s,"sections":[],"lines":0,"bytes":0,
            "repoPath": f"lixenai-marketing-agents/agents/{fn}", "seeded": True,
        })

out = {
    "source": {
        "repo": "https://github.com/LixenAI/SaaS-marketing-agent-team",
        "root": "lixenai-marketing-agents",
        "note": "Documentation / prompt-spec library (Markdown + YAML). Ingested into static catalog at build time.",
    },
    "categories": list(dict.fromkeys(CAT.values())),
    "items": items,
}
os.makedirs("/home/user/workspace/lixen-operator-app/server", exist_ok=True)
with open("/home/user/workspace/lixen-operator-app/server/catalog.json", "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2)
print("items:", len(items))
for c in out["categories"]:
    print(c, sum(1 for i in items if i["category"]==c))
