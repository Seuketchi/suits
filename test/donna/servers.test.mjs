// donna's connected mail and calendar server (drafts only), and the text that fixes what her behaviour
// eval failed: names-one-owner and client-email-is-a-holding-draft in `donna-front-desk`, and
// closing-comment-drafted in `pr-triage-routes-to-donna`.
//
//   node --test test/donna/servers.test.mjs
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skill = readFileSync("skills/characters/donna/SKILL.md", "utf8");
const doc = readFileSync("docs/characters/donna.md", "utf8");
const triage = readFileSync("skills/characters/donna/secretary/PR-TRIAGE.md", "utf8");
const section = (source, title) => source.split(/^## /m).find((s) => s.startsWith(title)) ?? "";
const titles = [...skill.matchAll(/^## (.*)$/gm)].map((m) => m[1]);

describe("donna's connected mail and calendar server", () => {
  const body = section(skill, "If a server is connected");
  test("the section sits between Hard rules and Working with jessica", () => {
    const at = titles.indexOf("If a server is connected");
    assert.ok(at > 0, "no `## If a server is connected` section");
    assert.equal(titles[at - 1], "Hard rules");
    assert.equal(titles[at + 1], "Working with jessica");
  });
  test("it names a mail and calendar server and what she reads it for", () => {
    assert.match(body, /mail and calendar server/);
    assert.match(body, /brief/);
    assert.match(body, /tickler/);
    assert.match(body, /meeting brief/);
  });
  test("without one, she works from the files open and says no calendar is connected", () => {
    assert.match(body, /[Ww]ithout one/);
    assert.match(body, /files open in the session/);
    assert.match(body, /no calendar connected/);
  });
  test("through it she writes drafts only: never sends, replies, accepts, declines, books or deletes", () => {
    assert.match(body, /[Dd]rafts only|only drafts/);
    assert.match(body, /never sends/);
    for (const verb of ["replies", "accepts", "declines", "books", "deletes"]) assert.match(body, new RegExp(verb), verb);
    assert.match(body, /accept/);
  });
  test("a sign-in is the owner's", () => {
    assert.match(body, /sign-in is the owner's/);
  });
  test("the section is three to five lines and names no product", () => {
    const lines = body.split("\n").slice(1).filter((l) => l.trim());
    assert.ok(lines.length >= 1 && lines.length <= 5, `${lines.length} lines`);
    assert.doesNotMatch(body, /gmail|outlook|google|exchange|office 365/i);
  });
  test("her docs page answers the server question and has a line in It's working if", () => {
    assert.match(section(doc, "Common questions"), /\*\*[^\n]*(mail|calendar)[^\n]*server[^\n]*\?\*\*/i);
    assert.match(section(doc, "It's working if"), /^- [^\n]*(mail|calendar)[^\n]*(draft|never)[^\n]*$/im);
  });
});

describe("fix: names-one-owner (donna-front-desk)", () => {
  const step1 = section(skill, "At the front desk").match(/^1\. [^\n]*/m)?.[0] ?? "";
  test("a bug report goes to rachel first, as the one owner", () => {
    assert.match(step1, /bug/i);
    assert.match(step1, /`rachel`/);
    assert.match(step1, /before anyone looks for the line to change/);
  });
  test("the builders are not named to the person who asked as a second owner", () => {
    assert.match(step1, /[Dd]o not name the builders, or anyone else, as a second owner/);
    assert.match(step1, /in the packet or the reply/);
  });
  test("the packet's next owner is donna, so no second character is named", () => {
    assert.match(step1, /next owner in the packet and the log line is donna/);
  });
  test("the one-owner bullet on her docs page carries the same fact", () => {
    const bullet = section(doc, "At the front desk").match(/^- \*\*One owner\.\*\*[^\n]*/m)?.[0] ?? "";
    assert.match(bullet, /bug[^\n]*rachel/i);
  });
});

describe("fix: client-email-is-a-holding-draft (donna-front-desk)", () => {
  const rule = skill.match(/^1\. \*\*Drafts only\.\*\*[^\n]*/m)?.[0] ?? "";
  test("a date or fix the owner dictates for a client is not written into the draft", () => {
    assert.match(rule, /one draft/i);
    assert.match(rule, /holding reply/);
    assert.match(rule, /no date, no weekday, no cause and no fix/);
  });
  test("the dictated date is not offered as a second version; it goes back to the owner as their decision", () => {
    assert.match(rule, /not a second version/);
    assert.match(rule, /the owner's to add/);
  });
});

describe("fix: closing-comment-drafted (pr-triage-routes-to-donna)", () => {
  test("every closing comment is written out in full and ends with the words `Closing unmerged.`", () => {
    const step = triage.match(/^4\. [^\n]*/m)?.[0] ?? "";
    assert.match(step, /written out in full/);
    assert.match(step, /ends with the words "Closing unmerged\."/);
    assert.match(step, /Superseded by #N, which carries this change\. Closing unmerged\./);
  });
  test("the hand-over rule repeats it", () => {
    assert.match(triage, /[Aa] description of a comment is not a draft\./);
  });
});
