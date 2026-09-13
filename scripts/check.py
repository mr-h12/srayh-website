#!/usr/bin/env python3
"""Sanity check: every listing has bilingual title/desc/location and photos that exist on disk."""
import json, os
root = os.path.dirname(os.path.abspath(__file__))
rows = json.load(open(os.path.join(root, 'data/listings.json'), encoding='utf-8'))
ids = set()
for l in rows:
    assert l['id'] not in ids, f"duplicate id {l['id']}"; ids.add(l['id'])
    for k in ('title', 'desc', 'location'):
        assert l[k].get('ar') and l[k].get('en'), f"{l['id']}: missing {k} ar/en"
    assert l['type'] in ('villa', 'apartment', 'chalet', 'land', 'duplex'), f"{l['id']}: bad type"
    assert l['status'] in ('sale', 'rent'), f"{l['id']}: bad status"
    assert l['photos'], f"{l['id']}: no photos"
    for p in l['photos']:
        assert os.path.exists(os.path.join(root, 'assets/img', p)), f"{l['id']}: missing photo {p}"
    if l['price']: assert l['price'].get('ar') and l['price'].get('en'), f"{l['id']}: price needs ar/en"
print(f"OK: {len(rows)} listings")
