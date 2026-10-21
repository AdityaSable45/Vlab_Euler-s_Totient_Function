# Integration README

**Group:** Euler's Totient Function
**Roll No.:** 10697 (Sandhu Dilpreet Kaur), 10695, 10696, 10698, 10699

**Experiment ID:** EXP-TOTIENT

**Experiment Name:** Euler's Totient Function

**Folder:** `/experiments/eulers-totient/`

**Entry File:**
```
index.html
```

**Navigation Title:**
```
Euler's Totient Function
```

**Short Description:**
```
Evaluate Euler's Totient function φ(n) for various values of n, with a
step-by-step prime-factorisation walkthrough and brute-force verification.
```

**Required Libraries:**
```
None — vanilla HTML/CSS/JavaScript only.
```

**Input:**
```
n (integer, 1–500)
```

**Output:**
```
φ(n), its prime factorisation, the (1 − 1/p) product walkthrough, and the
full list of integers coprime to n for verification.
```

**Expected Navigation Link:**
```
/experiments/eulers-totient/
```

---

## What this module contains

| File | Purpose |
|---|---|
| `index.html` | Aim, theory, procedure, interactive simulation, RSA demo, quiz, and references — all in one self-contained page with tabbed navigation. |
| `style.css` | Styling, following the lab's shared warm-brown header / cream content colour theme. |
| `script.js` | Tab switching, φ(n) computation (formula + brute-force), and quiz grading logic. |
| `README.md` | This file. |

## How the module works

1. **Theory tab** — defines φ(n), derives the product formula from the prime
   factorisation of n, and lists the standard special cases (prime, prime
   power, product of coprimes).
2. **Procedure tab** — the steps a student follows while using the simulator.
3. **Simulation tab** — enter any n from 1–500 (or use a preset: a prime, a
   prime power, and a composite number). The module shows:
   - the prime factorisation of n,
   - the product-formula walkthrough,
   - the brute-force list of integers coprime to n, and
   - a verification line confirming the formula result matches the
     brute-force count.
4. **Coprime grid** — every integer 1..n rendered as a coloured cell (green
   = coprime, red = not), skipped automatically past n = 3000 for
   performance (φ(n) itself has no size limit — it's always computed via
   the factorisation formula). Clicking a cell animates the Euclidean
   algorithm steps for that number against n.
5. **φ(m) trend chart** — an inline SVG bar chart with its own range
   control (independent of n), showing φ(m) for m = 1 up to whatever the
   student sets, capped at 1000 bars for readability. Primes sit on the
   φ(m) = m − 1 diagonal, composites fall below it.
6. **Quiz tab** — 5 randomly-drawn questions every time the tab is opened
   (or "New Questions" is clicked): a mix of conceptual multiple-choice and
   direct "what is φ(n) for n = …?" computations with plausible distractors,
   graded on submission with a "New Questions" option to retry.

## Test cases

| n | Expected φ(n) | Notes |
|---|---|---|
| 1 | 1 | Convention |
| 13 | 12 | Prime |
| 27 | 18 | Prime power (3³) |
| 36 | 12 | Composite, 2² × 3² |
| 100 | 40 | Composite, 2² × 5² |

All five are verified by the module's own brute-force check when entered.

## Integration notes

- The module does not modify any file outside `/experiments/eulers-totient/`.
- No external libraries or CDN dependencies are used, so it works fully
  offline once linked into the main application shell.
- Colour tokens are defined as CSS variables at the top of `style.css`
  (`--header-brown`, `--accent-blue`, `--bg-cream`, etc.) — update these
  centrally if the integration team finalises a different shared palette.
- The back-link in the header (`../../index.html`) assumes this module sits
  two levels below the site root, per the shared `experiments/<name>/`
  folder structure. Adjust if the integration team's actual routing differs.
# Vlab_Euler-s_Totient_Function
