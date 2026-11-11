import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import test from "node:test";

import { ADR, checkReadOnly, denyMessage, readOnlyCharacter } from "../../hooks/readonly.mjs";

// Commands a read-only version may run.
const ALLOWED = [
  "git log --oneline -20",
  "git log -p --follow -- src/a.ts",
  "git show HEAD~1:README.md",
  "git diff main...HEAD --stat",
  "git -C ../other diff HEAD",
  "git --no-pager blame -L 10,20 file.js",
  "git grep -n 'TODO' -- '*.ts'",
  "git status --short",
  "git ls-files | head -20",
  "git rev-parse --show-toplevel",
  "git cat-file -p HEAD",
  "git branch --show-current",
  "git config --get remote.origin.url",
  "gh pr view 22 --json title,body",
  "gh pr diff 22",
  "gh pr diff 22 | head -200",
  "gh pr list --state open",
  "gh issue view 5",
  "gh api repos/o/r/pulls/22/comments",
  "grep -rn 'foo' src",
  "grep -E 'a|b' file.txt | wc -l",
  "grep -n \"end$\" file",
  "rg --files-with-matches 'x' -g '*.mjs'",
  "cat README.md",
  "cat a.txt b.txt | sort | uniq -c",
  "ls -la docs",
  "find . -name '*.md' -not -path './node_modules/*'",
  "find src -type f -newer package.json",
  "head -n 5 file; tail -n 5 file",
  "pwd && ls",
  "cd docs && git log -1",
  "git log 2>/dev/null",
  "git log > /dev/null 2>&1",
  "gh pr diff 22 2>&1 | head",
  "echo 'a > b'",
  "wc -l a b",
  "jq '.name' package.json",
  "git log --format='%h %s' | cut -d' ' -f1",
  "git log\ngit diff",
  "git log;",
];

// Commands that write, start something, or that cannot be read with certainty.
const DENIED = [
  // redirection
  ["echo hi > out.txt", "redirection"],
  ["echo hi >> out.txt", "redirection"],
  ["cat a > b", "redirection"],
  ["git log >out", "redirection"],
  ["git log 2> err.txt", "redirection"],
  ["git log > /dev/nullx", "redirection"],
  ["git log > /dev/null/../x", "redirection"],
  ["cat < a", "redirection"],
  ["cat <<EOF\nx\nEOF", "redirection"],
  ["cat <(ls)", "redirection"],
  // writers and other programs
  ["rm -rf dist", "rm"],
  ["mv a b", "mv"],
  ["cp a b", "cp"],
  ["touch x", "touch"],
  ["mkdir d", "mkdir"],
  ["chmod +x a", "chmod"],
  ["tee out.txt", "tee"],
  ["ls | tee out.txt", "tee"],
  ["git log | xargs rm", "xargs"],
  ["sed -i 's/a/b/' f", "sed"],
  ["sed -n 'w out' f", "sed"],
  ["awk 'BEGIN{system(\"rm x\")}'", "awk"],
  ["sort -o out file", "sort"],
  ["sort --output=out file", "sort"],
  ["uniq in out", "uniq"],
  ["git log | sh", "sh"],
  ["bash -c 'ls'", "bash"],
  ["sh -c 'ls'", "sh"],
  ["eval ls", "eval"],
  ["env git log", "env"],
  ["python -c 'print(1)'", "python"],
  ["node -e '1'", "node"],
  ["npm install", "npm"],
  ["npm test", "npm"],
  ["pnpm add x", "pnpm"],
  ["pip install x", "pip"],
  ["curl https://example.com", "curl"],
  ["wget https://example.com", "wget"],
  ["dd if=a of=b", "dd"],
  ["ln -s a b", "ln"],
  ["sudo ls", "sudo"],
  ["time ls", "time"],
  ["nohup ls", "nohup"],
  ["xargs ls", "xargs"],
  ["for f in a b; do echo $f; done", "expansion"],
  ["if true; then ls; fi", "if"],
  ["./script.sh", "script"],
  ["/usr/bin/git log", "/usr/bin/git"],
  ["FOO=bar git log", "assignment"],
  ["PATH=/tmp git log", "assignment"],
  // git that writes
  ["git commit -m x", "commit"],
  ["git push", "push"],
  ["git push origin main", "push"],
  ["git checkout main", "checkout"],
  ["git switch main", "switch"],
  ["git reset --hard", "reset"],
  ["git clean -fd", "clean"],
  ["git add .", "add"],
  ["git rm a", "rm"],
  ["git mv a b", "mv"],
  ["git merge x", "merge"],
  ["git rebase main", "rebase"],
  ["git pull", "pull"],
  ["git fetch", "fetch"],
  ["git stash", "stash"],
  ["git tag v1", "tag"],
  ["git branch -D x", "branch"],
  ["git branch new", "branch"],
  ["git config user.name x", "config"],
  ["git config --global --unset a", "config"],
  ["git restore a", "restore"],
  ["git apply p.diff", "apply"],
  ["git worktree add ../x", "worktree"],
  ["git remote add a b", "remote"],
  ["git -c core.pager=sh log", "-c"],
  ["git -c alias.log='!rm x' log", "-c"],
  ["git diff --output=out.patch", "output"],
  ["git log --output out.txt", "output"],
  ["git show --output=x HEAD", "output"],
  ["git grep -O'sh' x", "git grep"],
  ["git grep --open-files-in-pager=sh x", "git grep"],
  ["git diff --ext-diff", "ext-diff"],
  ["git --exec-path=/tmp log", "exec-path"],
  ["git", "subcommand"],
  ["git -C", "directory"],
  // gh that writes
  ["gh pr create --fill", "create"],
  ["gh pr merge 22", "merge"],
  ["gh pr comment 22 -b hi", "comment"],
  ["gh pr checkout 22", "checkout"],
  ["gh pr close 22", "close"],
  ["gh issue create", "create"],
  ["gh api -X POST repos/o/r/issues", "api"],
  ["gh api --method DELETE repos/o/r", "api"],
  ["gh api repos/o/r/issues -f title=x", "api"],
  ["gh api repos/o/r/issues -F a=b", "api"],
  ["gh api graphql --input q.json", "api"],
  ["gh release create v1", "release"],
  ["gh auth login", "auth"],
  ["gh workflow run x", "workflow"],
  ["gh run rerun 1", "run"],
  // find, grep, rg flags that run or write
  ["find . -delete", "find"],
  ["find . -name x -delete", "find"],
  ["find . -exec rm {} ;", "find"],
  ["find . -exec rm {} +", "find"],
  ["find . -execdir rm {} ;", "find"],
  ["find . -ok rm {} ;", "find"],
  ["find . -okdir rm {} ;", "find"],
  ["find . -fprint out", "find"],
  ["find . -fprintf out %p", "find"],
  ["find . -fls out", "find"],
  ["rg --pre 'sh' x", "rg"],
  ["rg --pre=sh x", "rg"],
  ["rg --hostname-bin sh x", "rg"],
  ["file -C", "file"],
  // chaining, so that one writer anywhere denies the whole command
  ["ls && rm x", "rm"],
  ["ls; rm x", "rm"],
  ["ls || rm x", "rm"],
  ["ls | rm x", "rm"],
  ["ls\nrm x", "rm"],
  ["git log && git push", "push"],
  ["cd x && echo hi > y", "redirection"],
  // expansion and parsing the guard cannot follow
  ["ls $(rm x)", "substitution"],
  ["ls `rm x`", "substitution"],
  ["ls \"$(rm x)\"", "substitution"],
  ["ls \"`rm x`\"", "substitution"],
  ["echo ${HOME}", "expansion"],
  ["echo $HOME", "expansion"],
  ["git $X", "expansion"],
  ["echo $'a'", "expansion"],
  ["(rm x)", "group"],
  ["{ rm x; }", "{"],
  ["ls &", "background"],
  ["ls & rm x", "background"],
  ["ls |& cat", "|&"],
  ["ls #; rm x", "comment"],
  ["echo 'unterminated", "quote"],
  ["echo \"unterminated", "quote"],
  ["ls \\\nrm x", "continuation"],
  ["", "empty"],
  ["   ", "empty"],
  ["&& ls", "operator"],
  ["ls && && ls", "operator"],
  ["ls ||", "operator"],
  ["| ls", "operator"],
  [";;", "operator"],
];

test("allowed commands pass", () => {
  for (const command of ALLOWED) {
    const result = checkReadOnly(command);
    assert.equal(result.allowed, true, `${JSON.stringify(command)} should be allowed: ${result.why}`);
  }
});

test("everything else is denied, with a reason", () => {
  for (const [command, cause] of DENIED) {
    const result = checkReadOnly(command);
    assert.equal(result.allowed, false, `${JSON.stringify(command)} should be denied`);
    assert.ok(result.why?.toLowerCase().includes(cause.toLowerCase()), `${JSON.stringify(command)} was denied for "${result.why}", not for ${cause}`);
  }
});

test("a reason names what stopped the command", () => {
  assert.match(checkReadOnly("rm -rf x").why, /rm/);
  assert.match(checkReadOnly("echo a > b").why, /redirect/i);
  assert.match(checkReadOnly("git push").why, /git push/);
  assert.match(checkReadOnly("ls $(x)").why, /substitution/i);
});

test("input that is not a string is denied, not thrown", () => {
  for (const value of [undefined, null, 5, {}, []]) {
    assert.equal(checkReadOnly(value).allowed, false);
  }
});

test("a very long command is denied rather than scanned", () => {
  assert.equal(checkReadOnly("ls " + "a ".repeat(50_000)).allowed, false);
});

test("the three characters are read-only, nobody else", () => {
  for (const name of ["louis", "mike", "rachel"]) assert.equal(readOnlyCharacter(`suits:${name}`, "suits"), name);
  for (const type of ["suits:harvey", "suits:donna", "louis", "other:louis", "suits:louis2", "suits:", "", undefined, "general-purpose", "Explore"]) {
    assert.equal(readOnlyCharacter(type, "suits"), undefined, String(type));
  }
  assert.equal(readOnlyCharacter("renamed:louis", "renamed"), "louis");
});

test("the deny message names the character, the ADR and the command's cause", () => {
  const message = denyMessage("louis", "rm is not a read command");
  assert.match(message, /louis/);
  assert.ok(message.includes(ADR));
  assert.match(message, /ADR 0009/);
  assert.match(message, /rm is not a read command/);
});

test("the hook holds exactly the characters that have a file in agents/", () => {
  const names = readdirSync("agents").map((f) => f.replace(/\.md$/, "")).sort();
  assert.deepEqual(names, ["louis", "mike", "rachel"]);
  for (const name of names) assert.equal(readOnlyCharacter(`suits:${name}`, "suits"), name);
});
