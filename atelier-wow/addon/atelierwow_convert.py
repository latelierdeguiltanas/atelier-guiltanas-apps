#!/usr/bin/env python3
"""Convertit le SavedVariables AtelierWow.lua du client WoW Forever en JSON importable.
Usage : python atelierwow_convert.py "/chemin/AtelierWow.lua" [sortie.json]
Aucun accès réseau, aucune dépendance externe.
"""
import json
import re
import sys
from pathlib import Path

def extract(source: str) -> dict:
    match = re.search(r'(?m)^\s*AtelierWowExportJSON\s*=\s*("(?:\\.|[^"\\])*")', source, re.S)
    if not match:
        raise ValueError("AtelierWowExportJSON introuvable. Active l'addon, tape /atelierwow scan puis /reload.")
    try:
        raw = json.loads(match.group(1))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Chaîne export invalide : {exc}") from exc
    payload = json.loads(raw)
    if payload.get("schema") != "atelierwow-v1":
        raise ValueError("Version d'export non reconnue.")
    if not isinstance(payload.get("characters"), list):
        raise ValueError("Le relevé ne contient pas de tableau de personnages.")
    return payload

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        raise SystemExit(2)
    src = Path(sys.argv[1])
    dest = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_name("atelier-wow-compte.json")
    data = extract(src.read_text(encoding="utf-8-sig"))
    dest.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"OK : {len(data['characters'])} personnages → {dest}")
    for p in data["characters"]:
        print("  ", p.get("name"), len(p.get("items", [])), "piles,", len(p.get("professions", [])), "métiers")
if __name__ == "__main__":
    main()
