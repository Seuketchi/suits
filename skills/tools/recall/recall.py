#!/usr/bin/env python3
"""Search past Claude Code sessions.

Indexes what the user and Claude said (never tool input or output, never
thinking) from the transcripts under ~/.claude/projects/ into a SQLite FTS5
index at ~/.claude/recall/index.db.

  recall.py hook                 index the transcript named in a hook's stdin JSON
  recall.py index FILE...        index transcript files
  recall.py reindex [ROOT]       index every transcript (default ~/.claude/projects)
  recall.py search QUERY...      best-matching sessions, newest first among ties
      [--project TEXT] [--limit N]
  recall.py show SESSION_ID      print a session's messages
      [--grep WORD] [--context N]
"""

import json
import os
import sqlite3
import sys
from pathlib import Path

DB = Path(os.environ.get("RECALL_DB", Path.home() / ".claude" / "recall" / "index.db"))
ROOT = Path(os.environ.get("CLAUDE_CONFIG_DIR", Path.home() / ".claude")) / "projects"


def connect():
    DB.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB)
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS sessions (
          session_id TEXT PRIMARY KEY, project TEXT, title TEXT,
          started TEXT, ended TEXT, path TEXT, mtime REAL);
        CREATE VIRTUAL TABLE IF NOT EXISTS messages USING fts5(
          text, session_id UNINDEXED, role UNINDEXED, ts UNINDEXED, seq UNINDEXED);
        """
    )
    return db


def said(entry):
    """The text the user or Claude said in one transcript line, or None."""
    if entry.get("type") not in ("user", "assistant"):
        return None
    if entry.get("isSidechain") or entry.get("isMeta"):
        return None
    content = (entry.get("message") or {}).get("content")
    if isinstance(content, str):
        return content.strip() or None
    if isinstance(content, list):
        parts = [b.get("text", "") for b in content if isinstance(b, dict) and b.get("type") == "text"]
        text = "\n".join(p for p in parts if p).strip()
        return text or None
    return None


def index_file(db, path):
    path = Path(path)
    try:
        mtime = path.stat().st_mtime
    except OSError:
        return False
    row = db.execute("SELECT mtime FROM sessions WHERE path = ?", (str(path),)).fetchone()
    if row and row[0] == mtime:
        return False

    session_id, cwd, title, first, last = path.stem, None, None, None, None
    rows = []
    with open(path, encoding="utf-8", errors="replace") as f:
        for line in f:
            try:
                entry = json.loads(line)
            except ValueError:
                continue
            if entry.get("type") == "ai-title":
                title = entry.get("aiTitle") or title
                continue
            text = said(entry)
            if text is None:
                continue
            ts = entry.get("timestamp") or ""
            cwd = cwd or entry.get("cwd")
            first = first or ts
            last = ts or last
            rows.append((text, session_id, entry["type"], ts, len(rows)))

    db.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
    db.executemany("INSERT INTO messages (text, session_id, role, ts, seq) VALUES (?, ?, ?, ?, ?)", rows)
    project = Path(cwd).name if cwd else path.parent.name
    db.execute(
        "INSERT OR REPLACE INTO sessions VALUES (?, ?, ?, ?, ?, ?, ?)",
        (session_id, project, title, first, last, str(path), mtime),
    )
    db.commit()
    return True


def fts_query(words):
    # Quote every word so punctuation in a query can't break FTS5 syntax.
    return " ".join('"' + w.replace('"', '""') + '"' for w in words if w.strip())


def search(db, words, project=None, limit=10):
    sql = """
        SELECT m.session_id, s.project, s.title, s.ended,
               snippet(messages, 0, '[', ']', ' … ', 12) AS snip
        FROM messages m JOIN sessions s ON s.session_id = m.session_id
        WHERE messages MATCH ?"""
    args = [fts_query(words)]
    if project:
        sql += " AND s.project LIKE ?"
        args.append(f"%{project}%")
    sql += " ORDER BY bm25(messages), s.ended DESC LIMIT 300"
    seen, out = set(), []
    for sid, proj, title, ended, snip in db.execute(sql, args):
        if sid in seen:
            continue
        seen.add(sid)
        out.append((sid, proj, title, ended, snip))
        if len(out) >= limit:
            break
    return out


def show(db, session_id, grep=None, context=1):
    rows = db.execute(
        "SELECT role, ts, text FROM messages WHERE session_id = ? ORDER BY CAST(seq AS INTEGER)",
        (session_id,),
    ).fetchall()
    keep = range(len(rows))
    if grep:
        hits = [i for i, r in enumerate(rows) if grep.lower() in r[2].lower()]
        keep = sorted({j for i in hits for j in range(i - context, i + context + 1) if 0 <= j < len(rows)})
    for i in keep:
        role, ts, text = rows[i]
        body = text if len(text) <= 1500 else text[:1500] + " …"
        print(f"--- {role} · {ts[:16].replace('T', ' ')}\n{body}\n")


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    cmd, rest = argv[0], argv[1:]

    if cmd == "hook":
        # Runs on SessionEnd: never fail loudly, never block the user.
        try:
            path = json.load(sys.stdin).get("transcript_path")
            if path:
                index_file(connect(), path)
        except Exception:
            pass
        return 0

    db = connect()
    if cmd == "index":
        for p in rest:
            index_file(db, p)
        return 0

    if cmd == "reindex":
        root = Path(rest[0]) if rest else ROOT
        files = sorted(root.glob("*/*.jsonl"))
        done = sum(index_file(db, p) for p in files)
        print(f"indexed {done} of {len(files)} transcripts into {DB}")
        return 0

    if cmd == "search":
        project, limit, words = None, 10, []
        i = 0
        while i < len(rest):
            if rest[i] == "--project":
                project, i = rest[i + 1], i + 2
            elif rest[i] == "--limit":
                limit, i = int(rest[i + 1]), i + 2
            else:
                words.append(rest[i])
                i += 1
        results = search(db, words, project, limit)
        if not results:
            print("no matching sessions")
        for sid, proj, title, ended, snip in results:
            print(f"{(ended or '')[:10]} · {proj} · {title or '(untitled)'} · {sid}\n    {snip}")
        return 0

    if cmd == "show":
        grep, context = None, 1
        if "--grep" in rest:
            grep = rest[rest.index("--grep") + 1]
        if "--context" in rest:
            context = int(rest[rest.index("--context") + 1])
        show(db, rest[0], grep, context)
        return 0

    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
