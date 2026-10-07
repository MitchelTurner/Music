# Eli Roundy

A porch-session site for bluegrass and country player Eli Roundy, from Ketchikan, Alaska.

The record player, banjo strings, and Inside Passage chart all run in the browser. Open it with a static server so the scripts can load:

```bash
python3 -m http.server 4173
```

Then visit `http://127.0.0.1:4173`.

Railpack serves the same files with Caddy when `index.html` is in the build (`Staticfile` sets the root). The default branch `main` is only this README until the site branch is merged, so a builder pointed at `main` will not see the page.
