// ---------- Tab navigation ----------
const tabButtons = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".panel");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    panels.forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");

    if (btn.dataset.target === "quiz") {
      generateQuiz();
    }
  });
});

// ---------- Number theory helpers ----------
function gcd(a, b) {
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function primeFactorise(n) {
  const factors = []; // [{prime, power}]
  let remaining = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p === 0) {
      let power = 0;
      while (remaining % p === 0) { remaining /= p; power++; }
      factors.push({ prime: p, power });
    }
  }
  if (remaining > 1) factors.push({ prime: remaining, power: 1 });
  return factors;
}

function totientFromFactors(n, factors) {
  let result = n;
  factors.forEach(f => {
    result = result - result / f.prime;
  });
  return Math.round(result);
}

function computePhi(n) {
  if (n === 1) return 1;
  return totientFromFactors(n, primeFactorise(n));
}

function bruteForceCoprimes(n) {
  if (n === 1) return [1];
  const list = [];
  for (let k = 1; k <= n; k++) {
    if (gcd(k, n) === 1) list.push(k);
  }
  return list;
}

// Records the division steps of the Euclidean algorithm for gcd(a, b).
function euclidSteps(a, b) {
  const steps = [];
  while (b !== 0) {
    const q = Math.floor(a / b);
    const r = a % b;
    steps.push({ a, b, q, r });
    a = b;
    b = r;
  }
  return { steps, gcd: a };
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Above this, the brute-force coprime list / grid is skipped for performance —
// the formula result is still exact regardless of n's size.
const BRUTE_FORCE_LIMIT = 3000;
// Trend chart bar cap, purely for a readable/renderable chart.
const TREND_LIMIT = 1000;

// ---------- Simulation wiring ----------
const nInput = document.getElementById("nInput");
const computeBtn = document.getElementById("computeBtn");
const simError = document.getElementById("simError");
const simResults = document.getElementById("simResults");

const resultPhi = document.getElementById("resultPhi");
const resultFactorisation = document.getElementById("resultFactorisation");
const resultFormula = document.getElementById("resultFormula");
const resultCoprimeCount = document.getElementById("resultCoprimeCount");
const resultCoprimeList = document.getElementById("resultCoprimeList");
const resultVerify = document.getElementById("resultVerify");
const gridSkippedNote = document.getElementById("gridSkippedNote");

function runSimulation(n) {
  simError.hidden = true;
  simResults.hidden = true;

  if (!Number.isInteger(n) || n < 1) {
    simError.textContent = "Enter a positive whole number.";
    simError.hidden = false;
    return;
  }

  const factors = n === 1 ? [] : primeFactorise(n);
  const phiFormula = n === 1 ? 1 : totientFromFactors(n, factors);

  resultPhi.textContent = phiFormula;

  resultFactorisation.textContent = n === 1
    ? "n = 1 (no prime factors; φ(1) = 1 by convention)"
    : `n = ${n} = ${factors.map(f => f.power > 1 ? `${f.prime}^${f.power}` : `${f.prime}`).join(" × ")}`;

  if (n === 1) {
    resultFormula.textContent = "φ(1) = 1";
  } else {
    const steps = factors.map(f => `(1 − 1/${f.prime})`).join(" × ");
    resultFormula.textContent =
      `φ(${n}) = ${n} × ${steps}\n` +
      `      = ${phiFormula}`;
  }

  if (n <= BRUTE_FORCE_LIMIT) {
    const coprimes = bruteForceCoprimes(n);
    const phiBrute = coprimes.length;

    resultCoprimeCount.textContent = `${phiBrute} integers in [1, ${n}] are coprime to ${n}.`;
    resultCoprimeList.textContent = coprimes.join(", ");

    resultVerify.innerHTML = phiFormula === phiBrute
      ? `<span style="color:#2e7d4f;font-weight:600;">✓ Formula result matches brute-force count (${phiFormula} = ${phiBrute}).</span>`
      : `<span style="color:#b3413a;font-weight:600;">✗ Mismatch — check the factorisation (formula: ${phiFormula}, brute-force: ${phiBrute}).</span>`;

    gridSkippedNote.hidden = true;
    renderCoprimeGrid(n, new Set(coprimes));
  } else {
    resultCoprimeCount.textContent = `Brute-force listing is skipped for n > ${BRUTE_FORCE_LIMIT} (too many values to enumerate quickly).`;
    resultCoprimeList.textContent = "";
    resultVerify.innerHTML = `<span style="color:var(--text-muted);">No brute-force cross-check for this n — the product-formula result above is still exact.</span>`;
    gridSkippedNote.hidden = false;
    gridSkippedNote.textContent = `Grid view skipped for n > ${BRUTE_FORCE_LIMIT} cells.`;
    coprimeGrid.innerHTML = "";
  }

  resetGcdPanel();
  simResults.hidden = false;
}

// ---------- Coprime grid ----------
const coprimeGrid = document.getElementById("coprimeGrid");

function renderCoprimeGrid(n, coprimeSet) {
  coprimeGrid.innerHTML = "";
  for (let k = 1; k <= n; k++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell " + (coprimeSet.has(k) ? "coprime" : "not-coprime");
    cell.textContent = k;
    cell.dataset.k = k;
    cell.title = `gcd(${k}, ${n}) = ${gcd(k, n)}`;
    cell.addEventListener("click", () => {
      document.querySelectorAll(".grid-cell.selected").forEach(c => c.classList.remove("selected"));
      cell.classList.add("selected");
      animateGcdCheck(k, n);
    });
    coprimeGrid.appendChild(cell);
  }
}

// ---------- Animated gcd check ----------
const gcdStepsEl = document.getElementById("gcdSteps");
const gcdConclusionEl = document.getElementById("gcdConclusion");
const gcdCheckLabel = document.getElementById("gcdCheckLabel");
const gcdHint = document.getElementById("gcdHint");

function resetGcdPanel() {
  gcdStepsEl.innerHTML = "";
  gcdConclusionEl.textContent = "";
  gcdCheckLabel.textContent = "";
  gcdHint.hidden = false;
}

function animateGcdCheck(k, n) {
  gcdHint.hidden = true;
  gcdStepsEl.innerHTML = "";
  gcdConclusionEl.textContent = "";
  gcdCheckLabel.textContent = `for k = ${k}, n = ${n}`;

  const { steps, gcd: g } = euclidSteps(Math.max(k, n), Math.min(k, n));
  steps.forEach((s, i) => {
    setTimeout(() => {
      const row = document.createElement("div");
      row.className = "gcd-step-row";
      row.textContent = `${s.a} = ${s.q} × ${s.b} + ${s.r}`;
      gcdStepsEl.appendChild(row);

      if (i === steps.length - 1) {
        setTimeout(() => {
          gcdConclusionEl.innerHTML = g === 1
            ? `<span style="color:#2e7d4f;">gcd(${k}, ${n}) = 1 → ${k} is coprime to ${n}.</span>`
            : `<span style="color:#b3413a;">gcd(${k}, ${n}) = ${g} → ${k} shares a factor with ${n}, not coprime.</span>`;
        }, 220);
      }
    }, i * 260);
  });

  if (steps.length === 0) {
    gcdConclusionEl.innerHTML = `k and n are equal or one divides the other directly — gcd(${k}, ${n}) = ${g}.`;
  }
}

// ---------- Trend chart (φ(m) for m = 1..user-chosen max) ----------
const trendChartEl = document.getElementById("trendChart");
const trendMaxInput = document.getElementById("trendMaxInput");
const trendUpdateBtn = document.getElementById("trendUpdateBtn");
const trendCapNote = document.getElementById("trendCapNote");

function renderTrendChart(requestedMax, highlightN) {
  let maxM = Math.max(2, Math.floor(requestedMax) || 60);

  if (maxM > TREND_LIMIT) {
    trendCapNote.hidden = false;
    trendCapNote.textContent = `Capped at ${TREND_LIMIT} bars for a readable chart (you asked for ${maxM}).`;
    maxM = TREND_LIMIT;
  } else {
    trendCapNote.hidden = true;
  }

  const values = [];
  for (let m = 1; m <= maxM; m++) {
    values.push(computePhi(m));
  }

  const width = Math.max(maxM * 10, 300);
  const height = 140;
  const barWidth = width / maxM;
  const maxVal = Math.max(...values, 1);
  const labelStep = Math.max(1, Math.ceil(maxM / 20));

  let bars = "";
  values.forEach((v, idx) => {
    const m = idx + 1;
    const barHeight = (v / maxVal) * (height - 20);
    const x = idx * barWidth;
    const y = height - barHeight - 14;
    const cls = m === highlightN ? "trend-bar current" : "trend-bar";
    bars += `<rect class="${cls}" x="${x + 1}" y="${y}" width="${Math.max(barWidth - 2, 1)}" height="${barHeight}"><title>φ(${m}) = ${v}</title></rect>`;
    if (m % labelStep === 0 || m === 1) {
      bars += `<text class="trend-axis-label" x="${x + barWidth / 2}" y="${height - 2}" text-anchor="middle">${m}</text>`;
    }
  });

  trendChartEl.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${bars}</svg>`;
}

computeBtn.addEventListener("click", () => {
  const n = parseInt(nInput.value, 10);
  runSimulation(n);
  renderTrendChart(parseInt(trendMaxInput.value, 10), n);
});

document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    nInput.value = btn.dataset.n;
    const n = parseInt(btn.dataset.n, 10);
    runSimulation(n);
    renderTrendChart(parseInt(trendMaxInput.value, 10), n);
  });
});

trendUpdateBtn.addEventListener("click", () => {
  renderTrendChart(parseInt(trendMaxInput.value, 10), parseInt(nInput.value, 10));
});

// Run once on load with the default value
runSimulation(parseInt(nInput.value, 10));
renderTrendChart(parseInt(trendMaxInput.value, 10), parseInt(nInput.value, 10));

// ---------- Quiz (randomised every time the tab is opened) ----------

// Conceptual question bank — a random subset is drawn each time.
const conceptualBank = [
  {
    q: "What does φ(n) count?",
    options: [
      "The number of divisors of n",
      "The number of integers from 1 to n that are coprime to n",
      "The number of prime factors of n",
      "The largest prime factor of n"
    ],
    correct: 1,
    explain: "φ(n) counts integers k in [1, n] with gcd(k, n) = 1."
  },
  {
    q: "For a prime number p, what is φ(p)?",
    options: ["p", "p + 1", "p − 1", "1"],
    correct: 2,
    explain: "Every integer from 1 to p−1 shares no factor with p, so φ(p) = p − 1."
  },
  {
    q: "If n = p · q where p and q are distinct primes, φ(n) equals:",
    options: ["p·q − 1", "(p − 1)(q − 1)", "p + q − 2", "p·q − p − q"],
    correct: 1,
    explain: "φ is multiplicative over coprime factors, so φ(pq) = φ(p)·φ(q) = (p−1)(q−1). This is exactly the value RSA key generation uses."
  },
  {
    q: "What is φ(p^k) for a prime p and k ≥ 1?",
    options: ["p^k − p^(k−1)", "p^k − 1", "p^(k−1)", "p^k / 2"],
    correct: 0,
    explain: "Only multiples of p are excluded from [1, p^k], leaving p^k − p^(k−1) coprime values."
  },
  {
    q: "Why is φ(n) important in RSA?",
    options: [
      "It is used directly as the encrypted message",
      "It sets the modulus n used for encryption",
      "It defines the group used to pick e and compute the private exponent d",
      "It determines the block size of the plaintext"
    ],
    correct: 2,
    explain: "e is chosen coprime to φ(n), and d is the modular inverse of e mod φ(n) — both steps depend directly on φ(n)."
  },
  {
    q: "If gcd(a, b) = 1, what is φ(a·b)?",
    options: ["φ(a) + φ(b)", "φ(a) · φ(b)", "φ(a) − φ(b)", "φ(a · b) can't be found from φ(a), φ(b)"],
    correct: 1,
    explain: "φ is multiplicative: for coprime a and b, φ(ab) = φ(a)·φ(b)."
  },
  {
    q: "What is φ(1)?",
    options: ["0", "1", "Undefined", "−1"],
    correct: 1,
    explain: "By convention, φ(1) = 1 (the single integer 1 is counted as coprime to itself)."
  }
];

const CONCEPTUAL_COUNT = 2;
const COMPUTED_COUNT = 3;
const COMPUTED_N_MIN = 1;
const COMPUTED_N_MAX = 60;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildComputedQuestion(n) {
  const correct = computePhi(n);
  const factors = n === 1 ? [] : primeFactorise(n);
  const factorStr = n === 1
    ? "n = 1 (by convention)"
    : `n = ${n} = ${factors.map(f => f.power > 1 ? `${f.prime}^${f.power}` : `${f.prime}`).join(" × ")}`;
  const explain = n === 1
    ? "φ(1) = 1 by convention."
    : `${factorStr}, so φ(${n}) = ${n} × ${factors.map(f => `(1 − 1/${f.prime})`).join(" × ")} = ${correct}.`;

  const candidateSet = new Set();
  [correct - 1, correct + 1, correct - 2, correct + 2, n - 1, n, Math.max(1, Math.floor(n / 2))]
    .forEach(c => { if (c > 0 && c !== correct) candidateSet.add(c); });

  let distractors = shuffle([...candidateSet]).slice(0, 3);
  while (distractors.length < 3) {
    const filler = randomInt(1, Math.max(correct + 5, 10));
    if (filler !== correct && !distractors.includes(filler)) distractors.push(filler);
  }

  const optionValues = shuffle([correct, ...distractors]);
  const correctIndex = optionValues.indexOf(correct);

  return {
    q: `What is φ(n) for n = ${n}?`,
    options: optionValues.map(String),
    correct: correctIndex,
    explain
  };
}

let quizData = [];

function generateQuiz() {
  const conceptualPicks = shuffle(conceptualBank).slice(0, CONCEPTUAL_COUNT);

  const usedN = new Set();
  const computedPicks = [];
  while (computedPicks.length < COMPUTED_COUNT) {
    const n = randomInt(COMPUTED_N_MIN, COMPUTED_N_MAX);
    if (usedN.has(n)) continue;
    usedN.add(n);
    computedPicks.push(buildComputedQuestion(n));
  }

  quizData = shuffle([...conceptualPicks, ...computedPicks]);
  renderQuiz();
  quizScore.hidden = true;
}

const quizForm = document.getElementById("quizForm");
const submitQuizBtn = document.getElementById("submitQuiz");
const newQuizBtn = document.getElementById("newQuizBtn");
const quizScore = document.getElementById("quizScore");

function renderQuiz() {
  quizForm.innerHTML = "";
  quizData.forEach((item, qi) => {
    const wrapper = document.createElement("div");
    wrapper.className = "quiz-question";
    wrapper.id = `q-${qi}`;

    const qText = document.createElement("p");
    qText.className = "q-text";
    qText.textContent = `${qi + 1}. ${item.q}`;
    wrapper.appendChild(qText);

    item.options.forEach((opt, oi) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${qi}`;
      input.value = oi;
      label.appendChild(input);
      label.append(" " + opt);
      wrapper.appendChild(label);
    });

    const feedback = document.createElement("p");
    feedback.className = "q-feedback";
    feedback.hidden = true;
    wrapper.appendChild(feedback);

    quizForm.appendChild(wrapper);
  });
}

// Build the first quiz up front so it's ready whenever the tab is opened.
generateQuiz();

submitQuizBtn.addEventListener("click", () => {
  let score = 0;
  quizData.forEach((item, qi) => {
    const wrapper = document.getElementById(`q-${qi}`);
    const selected = wrapper.querySelector(`input[name="q${qi}"]:checked`);
    const feedback = wrapper.querySelector(".q-feedback");
    wrapper.classList.remove("correct", "incorrect");

    if (!selected) {
      wrapper.classList.add("incorrect");
      feedback.hidden = false;
      feedback.textContent = "No answer selected. " + item.explain;
      return;
    }

    const isCorrect = parseInt(selected.value, 10) === item.correct;
    if (isCorrect) score++;
    wrapper.classList.add(isCorrect ? "correct" : "incorrect");
    feedback.hidden = false;
    feedback.textContent = (isCorrect ? "Correct. " : "Not quite. ") + item.explain;
  });

  quizScore.hidden = false;
  quizScore.textContent = `Score: ${score} / ${quizData.length}`;
});

newQuizBtn.addEventListener("click", generateQuiz);
