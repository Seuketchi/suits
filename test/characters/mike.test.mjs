// mike's SKILL.md keeps what the research found a cited answer needs (docs/characters/mike/references.md).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/mike/SKILL.md", "utf8");

describe("mike", () => {
  test("has one citation form with a path, symbol, 12-character sha and subject", () => {
    assert.match(skill, /path:line \(symbol\) @ <12-char sha> \("subject"\)/);
  });
  test("found says how it was seen: read, ran or recorded", () => {
    assert.match(skill, /`read`.*`ran`.*`recorded`/s);
  });
  test("inferred names what it rests on and carries a confidence with its reason", () => {
    assert.match(skill, /Inferred\* lists the found claims it rests on/);
    assert.match(skill, /one-word confidence/);
  });
  test("not found names its search", () => {
    assert.match(skill, /Not found\* names the search/);
  });
  test("there is no fourth tag: assumed is gone", () => {
    assert.doesNotMatch(skill, /\bassumed\b/);
    assert.match(skill, /not checked/);
  });
  test("a stale memory shows both sides and is never called wrong", () => {
    assert.match(skill, /Recorded: Y \(source, date\)\. Code at <sha>: Z\./);
    assert.match(skill, /never says the memory was wrong/);
  });
  test("the quick look is three fixed answers and never says accidental", () => {
    assert.match(skill, /Three answers, always in this order/);
    assert.match(skill, /Never "accidental"/);
  });
  test("the voice does not invite answering from memory", () => {
    assert.doesNotMatch(skill, /total recall/i);
  });
  describe("if a server is connected", () => {
    const section = () => {
      const m = skill.match(/^## If a server is connected\n([\s\S]*?)(?=^## )/m);
      assert.ok(m, "no ## If a server is connected section");
      return m[1];
    };
    test("sits between Hard rules and Working with the others", () => {
      const at = (h) => skill.indexOf(`\n## ${h}\n`);
      assert.ok(at("Hard rules") > -1);
      assert.ok(at("Hard rules") < at("If a server is connected"));
      assert.ok(at("If a server is connected") < at("Working with the others"));
    });
    test("names the kind of server, and no product", () => {
      assert.match(section(), /code search or code graph server/);
      assert.match(section(), /who else uses a symbol/);
      assert.match(section(), /where it is defined/);
    });
    test("says what he does without one", () => {
      const s = section();
      assert.match(s, /[Ww]ithout one/);
      assert.match(s, /`git grep`/);
      assert.match(s, /`git log -L`/);
      assert.match(s, /`git blame -w -M -C`/);
    });
    test("a server hit is a lead and the citation stays the one form, read from the file", () => {
      const s = section();
      assert.match(s, /lead/);
      assert.match(s, /path:line \(symbol\) @ <12-char sha> \("subject"\)/);
      assert.match(s, /read from the file/);
    });
    test("is three to five lines", () => {
      const n = section().trim().split("\n").length;
      assert.ok(n >= 3 && n <= 5, `${n} lines`);
    });
  });

  describe("the quick look, as the eval found it", () => {
    const quick = () => skill.match(/^## The quick look\n([\s\S]*?)(?=^## )/m)[1];
    test("the callers are listed as path:line hits: a grep hit is not a citation and is not blamed", () => {
      const q = quick();
      assert.match(q, /list each hit as `path:line`/);
      assert.match(q, /not cited with a commit/);
    });
    test("the answer holds the three answers and nothing else", () => {
      const q = quick();
      assert.match(q, /Nothing before, between or after them/);
      assert.match(q, /no analysis of the change/);
      assert.match(q, /no list of what he did not check/);
    });
    test("when the outputs are given he uses them and cites the introducing commit's own subject", () => {
      const q = quick();
      assert.match(q, /When the outputs are in the ask, use them/);
      assert.match(q, /the subject from the log output/);
    });
    test("not found names only the search that was run, never a wider one", () => {
      const q = quick();
      assert.match(q, /`not found` names the command that was run and its paths, exactly as shown/);
      assert.match(q, /never a wider search that was not run/);
    });
    test("not found also says it was the tree at that commit, not history, and what was left unsearched", () => {
      const q = quick();
      assert.match(q, /searched the tree at that commit, not its history, so renames are not in question/);
      assert.match(q, /nothing outside those paths was searched/);
    });
  });
});
