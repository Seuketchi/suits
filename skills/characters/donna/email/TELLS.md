# Tells to remove

The last check before delivery. A tell is a habit of machine-written text. Sent in an email, it tells the reader nobody wrote this for them. The list is self-contained: use it as written.

Remove tells by **rewriting the sentence with the real fact**, not by swapping in a synonym. A synonym keeps the empty sentence. Formal is not a tell, and neither is correct grammar: "Dear Ms. Reyes," and "Regards," are normal. The tells are the stock phrases and shapes below.

## 1. Run the scan

`$f` is the draft file. Every hit is a candidate: rewrite it, or keep it only when it is a name or a quoted term (a street called "Landscape Road").

```bash
grep -niE "hope (this|you)|finds you|wanted to (reach|touch|follow|flag|check|share)|reach(ing)? out|writing to (inform|let you|follow)|please find|kindly|herewith|pursuant|please be advised|take this opportunity|hesitate|feel free|let me know if|any (questions|concerns)|look(ing)? forward|thanks? in advance|thank you for (your|reaching|taking)|earliest convenience|circl(e|ing) back|touch base|moving forward|going forward|per my|as per|in order to|delve|seamless|leverag|utili[sz]|facilitat|streamlin|robust|comprehensive|crucial|pivotal|vibrant|landscape|tapestry|testament|underscor|foster|enhanc|showcas|empower|synerg|holistic|multifaceted|game.?chang|cutting.edge|excited|thrilled|delighted|pleased to|great question|valuable|worth noting|important to note|key takeaway|in summary|to summari[sz]e|in conclusion|overall,|additionally,|furthermore,|moreover,|not (just|only) |just (wanted|checking)|sorry to bother|any inconvenience|might possibly|could potentially|may possibly|—|–| - |[“”’]|!" "$f"
```

It prints nothing when the draft is clean. It finds words, not shapes, so go on to step 2.

## 2. Check the shapes by eye

| Shape | Why it reads as machine | Do instead |
|---|---|---|
| **A list of three for effect**: "clear, concise and actionable"; "on time, on budget and on scope" | Three is the default rhythm of generated text. | List only what exists: the real slots, files or options, however many. Where the three are adjectives or abstract nouns, keep the one that carries a fact. |
| **A last sentence that repeats the email or offers help**: "In summary, ..."; "This will ensure a smooth process." | Generated text closes by restating itself. | Stop after the ask, or after the one fact the reader needs to act. |
| **"Not just X, but Y"** and **"Not X, but Y"** | A stock contrast, used where no one claimed X. | Say Y. |
| **An opener that adds a transition**: "Additionally,", "Furthermore,", "Moreover," | Connective filler between sentences that already follow. | Delete it. If the order is not obvious, put the date or number first. |
| **Every sentence the same length** | Generated text tends to hold every sentence in one narrow length band. | Run the length check below. Mix a short sentence with a longer one that holds a date or a condition. Keep every sentence at 25 words or fewer. |
| **A hedging stack**: "I just wanted to quickly check if perhaps it might be possible to ..." | Soft words piled up so nothing is committed to. | Ask the question straight. Keep one soft word, at the place where you are truly unsure, or none. |
| **A sentence that fits any email**: "I appreciate your time and attention to this matter." | It holds no fact about this reader or this job. | If swapping the names leaves the sentence unchanged, add the specific fact or cut it. |
| **Feelings and praise you cannot back**: "excited", "great work", "valuable insights" | Praise the draft cannot support with a fact. | State the fact: "Your 4 November notes fixed the fuel figures." |
| **The same thing under two names**: "the report ... the document ... the paper" | Synonym cycling, to avoid repeating a word. | Pick one word and repeat it. |
| **Decoration**: em dash, spaced hyphen as a dash, bold, bullets, emoji, curly quotes, exclamation marks | Plain text between two people carries none of these. | Use a full stop, a colon or a comma. Do not replace every dash with a comma by reflex: reshape the sentence. Straight quotes only. |
| **Semicolons** | Easily misread, and long sentences use them. | Make two sentences. |

### Length check

Prints the word count of each sentence in the body (`$f` is the draft file):

```bash
sed -n '/^Dear/,/^Regards,/p' "$f" | sed '1d;$d' | sed -E 's/\b(Ms|Mr|Mrs|Dr|Prof)\./\1/g' | tr '\n' ' ' | sed -E 's/([.?!]) /\1\n/g' | awk 'NF{print NF}'
```

Fail if any number is above 25, or if three or more sentences fall within two words of each other.

## 3. Common phrases and what to write

| Instead of | Write |
|---|---|
| I hope this email finds you well. / I hope you are doing well. | Nothing. Start with the point. |
| I wanted to reach out to ... / I am writing to inform you that ... | The point itself: "The audit report will be late." |
| Please find attached ... / I am attaching ... for your perusal | "Attached is ..." |
| Please do not hesitate to contact me. / Feel free to reach out. | Nothing, or the one route: "Call me on [number] if the dates do not work." |
| Let me know if you have any questions. | Nothing. The ask already invites a reply. |
| Looking forward to hearing from you. / Thank you for your time and consideration. | Nothing. End on the ask or the fact. |
| Thanks in advance. | Nothing, or "Thank you" after they have done it. |
| I just wanted to follow up / circle back / touch base on ... | "On 4 November I asked for X and I do not have it yet." |
| At your earliest convenience | A date. |
| Moving forward / Going forward | "From 16 November" or cut. |
| In order to | to |
| utilise, leverage | use |
| facilitate, streamline | help, simplify |
| delve into, deep dive | look at, check |
| seamless, robust, comprehensive, crucial, pivotal | A fact or a number, or cut. |
| kindly, herewith, pursuant to, please be advised, take this opportunity | Cut. Say the thing. |
| Sorry to bother you / any inconvenience this may cause | Cut. Apologise once only in an apology email, for the specific error. |
| It is important to note that / it is worth noting that | Cut and say it. |
