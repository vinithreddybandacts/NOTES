#!/usr/bin/env python3
"""Generate a JSON index of Markdown files for md_viewer.html.

Run this script from the repository root:

    python scripts\build_md_index.py

It will write `md_index.json` at the repo root.
"""

import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "md_index.json"
INCLUDE_EXT = {".md", ".markdown"}
IGNORED_DIRS = {"node_modules", ".git", "__pycache__"}


def build_tree(path: Path):
    node = {"name": path.name, "type": "dir", "children": []}

    try:
        entries = sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
    except PermissionError:
        return node

    for entry in entries:
        if entry.name in IGNORED_DIRS or entry.name.startswith("."):
            continue
        if entry.is_dir():
            node["children"].append(build_tree(entry))
        elif entry.is_file() and entry.suffix.lower() in INCLUDE_EXT:
            rel = entry.relative_to(ROOT).as_posix()
            node["children"].append({"name": entry.name, "type": "file", "path": rel})

    return node


def main():
    root = build_tree(ROOT)
    # keep only root children (don't include root entry in display name)
    root["name"] = "Repository"

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(root, f, ensure_ascii=False, indent=2)

    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
