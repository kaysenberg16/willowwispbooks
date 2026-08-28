import "./style.css";
import { classify, ARCHETYPES, type QuizAnswers, type Genre } from "./quiz-logic.ts";

// Where matchmaking + gift requests are delivered. Reuses the existing Formspree
// form; swap for a dedicated form ID anytime (see CLAUDE.md).
const FORMSPREE_ENDPOINT = "https://formspree.io/f/maqaykbr";

// --- Mobile menu toggle ---
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
menuToggle?.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  mobileMenu?.classList.toggle("hidden");
});
mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.add("hidden");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

// --- Quiz definitions (Kayla's real matching flow) ---
type ChoiceOpt = { e: string; t: string; val: string };
type ChoiceQ = { type: "choice"; key: "genre" | "ride" | "spice" | "dark"; q: string; hint?: string; opts: ChoiceOpt[] };
type TextQ = { type: "text"; key: "recent"; q: string; hint?: string; placeholder?: string; optional?: boolean };
type MultiQ = { type: "multi"; key: "nope"; q: string; hint?: string; opts: string[] };
type Question = ChoiceQ | TextQ | MultiQ;

const NOPE_ANYTHING = "Nothing — I'll try anything";

const QUESTIONS: Question[] = [
  {
    type: "choice", key: "genre", q: "First things first — what's your genre?",
    opts: [
      { e: "🕵️", t: "Mystery", val: "mystery" },
      { e: "💞", t: "Romance", val: "romance" },
      { e: "🐉", t: "Fantasy & Sci-Fi", val: "fantasy" },
      { e: "📓", t: "Nonfiction", val: "nonfiction" },
    ],
  },
  {
    type: "text", key: "recent", q: "What have you read and loved lately?",
    hint: "A title, an author, or just “anything cozy.” Totally optional.",
    placeholder: "e.g. anything by T.J. Klune…", optional: true,
  },
  {
    type: "multi", key: "nope", q: "What's a hard no for you?",
    hint: "Pick any — I'll steer clear.",
    opts: ["Cliffhangers", "Too much spice", "Heavy or sad endings", "Slow burns", "Gore & violence", NOPE_ANYTHING],
  },
  {
    type: "choice", key: "ride", q: "Emotional rollercoaster, or smooth sailing?",
    opts: [
      { e: "🎢", t: "Rollercoaster — wreck me", val: "coaster" },
      { e: "⛵", t: "Smooth sailing, please", val: "smooth" },
    ],
  },
  {
    type: "choice", key: "spice", q: "Spice?",
    opts: [
      { e: "🌶️", t: "Yes — bring the heat", val: "spicy" },
      { e: "🧊", t: "Keep it clean", val: "clean" },
    ],
  },
  {
    type: "choice", key: "dark", q: "Do you like it to get dark?",
    opts: [
      { e: "🖤", t: "Go dark", val: "dark" },
      { e: "🌤️", t: "Keep it light", val: "light" },
    ],
  },
];

// --- State ---
let step = 0;
const choiceAns: Record<string, string> = {};
const nopeSet = new Set<string>();
let recentAns = "";

const bar = document.getElementById("bar");
const qcount = document.getElementById("qcount");
const qtext = document.getElementById("qtext");
const qhint = document.getElementById("qhint");
const opts = document.getElementById("opts");
const backBtn = document.getElementById("back");
const contBtn = document.getElementById("cont");

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function render(): void {
  const Q = QUESTIONS[step];
  if (!bar || !qcount || !qtext || !qhint || !opts || !backBtn || !contBtn) return;

  bar.style.width = `${(step / QUESTIONS.length) * 100}%`;
  qcount.textContent = `Question ${step + 1} of ${QUESTIONS.length}`;
  qtext.textContent = Q.q;
  if (Q.hint) {
    qhint.textContent = Q.hint;
    qhint.classList.remove("hidden");
  } else {
    qhint.classList.add("hidden");
  }
  opts.innerHTML = "";
  backBtn.classList.toggle("invisible", step === 0);
  contBtn.classList.add("hidden");

  if (Q.type === "choice") {
    for (const o of Q.opts) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quiz-opt";
      b.innerHTML = `<span class="text-xl">${o.e}</span><span>${o.t}</span>`;
      b.addEventListener("click", () => {
        choiceAns[Q.key] = o.val;
        next();
      });
      opts.appendChild(b);
    }
  } else if (Q.type === "text") {
    const inp = document.createElement("input");
    inp.type = "text";
    inp.className = "w-full px-4 py-3 bg-cream border border-amber-light/40 rounded-xl text-base focus:outline-none focus:border-teal transition";
    inp.placeholder = Q.placeholder ?? "";
    inp.value = recentAns;
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        recentAns = inp.value.trim();
        next();
      }
    });
    opts.appendChild(inp);
    inp.focus();
    contBtn.textContent = Q.optional ? "Skip / Continue →" : "Continue →";
    contBtn.classList.remove("hidden");
    contBtn.onclick = () => {
      recentAns = inp.value.trim();
      next();
    };
  } else {
    for (const label of Q.opts) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quiz-opt" + (nopeSet.has(label) ? " sel" : "");
      b.innerHTML = `<span>${label}</span>`;
      b.addEventListener("click", () => {
        if (label === NOPE_ANYTHING) {
          nopeSet.clear();
          nopeSet.add(label);
        } else {
          nopeSet.delete(NOPE_ANYTHING);
          if (nopeSet.has(label)) nopeSet.delete(label);
          else nopeSet.add(label);
        }
        render();
      });
      opts.appendChild(b);
    }
    contBtn.textContent = "Continue →";
    contBtn.classList.remove("hidden");
    contBtn.onclick = () => next();
  }
}

backBtn?.addEventListener("click", () => {
  if (step > 0) {
    step--;
    render();
  }
});

function next(): void {
  step++;
  if (step < QUESTIONS.length) render();
  else showResult();
}

function collect(): QuizAnswers {
  return {
    genre: (choiceAns.genre ?? "mystery") as Genre,
    recent: recentAns,
    nope: [...nopeSet],
    ride: (choiceAns.ride ?? "smooth") as QuizAnswers["ride"],
    spice: (choiceAns.spice ?? "clean") as QuizAnswers["spice"],
    dark: (choiceAns.dark ?? "light") as QuizAnswers["dark"],
  };
}

function showResult(): void {
  const body = document.getElementById("quiz-body");
  if (!body || !bar) return;
  bar.style.width = "100%";

  const ans = collect();
  const r = ARCHETYPES[classify(ans)];
  const nopes = ans.nope.filter((n) => n !== NOPE_ANYTHING);

  const recentLine = ans.recent
    ? `<p class="text-sm text-charcoal/60 mt-2">Because you loved <strong>${esc(ans.recent)}</strong>, I've got ideas already. 😊</p>`
    : "";
  const nopeLine = nopes.length
    ? `<p class="text-sm text-blush-dark mt-1">I'll steer clear of: ${esc(nopes.join(", "))}.</p>`
    : "";

  const vibeValue = esc([`${r.shelf} reader`, ...(nopes.length ? [`no: ${nopes.join(", ")}`] : [])].join(" · "));

  body.innerHTML = `
    <div class="text-center">
      <span class="inline-block bg-navy text-amber-light text-xs uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">Your reader type</span>
      <h2 class="font-display text-3xl text-navy mt-3 mb-0.5">${r.name}</h2>
      <p class="text-xs text-blush-dark italic mb-1">a Willow Wisp reader type</p>
      <p class="text-xs uppercase tracking-[0.12em] text-teal-dark font-bold">Your shelf → ${esc(r.shelf)}</p>
      <p class="text-sm text-charcoal/75 max-w-md mx-auto mt-3">${r.blurb}</p>
      ${recentLine}${nopeLine}

      <div class="blind-wrap max-w-xs mx-auto my-6 shadow-lg" style="background-image:url('/images/blind dates.jpg')">
        <div class="font-script text-xl">✦ your blind date ✦</div>
        <div class="font-display text-xl mt-0.5">${esc(r.genreLabel)}</div>
        <div class="text-xs uppercase tracking-[0.1em] opacity-90 mt-1">hand-wrapped by Kayla</div>
      </div>

      <button type="button" id="open-match" class="inline-block bg-amber hover:bg-amber-light text-navy px-8 py-3 rounded-full text-xs uppercase tracking-[0.12em] font-bold transition-colors shadow-md">💌 Let Kayla match me for real</button>
      <div class="mt-3"><button type="button" id="retake" class="text-teal-dark text-sm hover:underline">↺ retake the quiz</button></div>

      <form action="${FORMSPREE_ENDPOINT}" method="POST" id="match-form" class="hidden text-left bg-cream border border-dashed border-teal/50 rounded-2xl p-6 mt-6 space-y-4">
        <input type="hidden" name="_subject" value="💌 Reader match request — Willow Wisp Books" />
        <input type="hidden" name="request_type" value="matchmaking" />
        <input type="hidden" name="quiz_result" value="${esc(`${r.name} · ${r.shelf}`)}" />
        <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />
        <h3 class="font-display text-xl text-navy text-center">Let Kayla match you</h3>
        <p class="text-sm text-charcoal/65 text-center">Tell me your vibe and I'll personally wrap you a Blind Date. Lands right in my inbox.</p>
        <div>
          <label for="m-name" class="block text-xs uppercase tracking-wider text-navy font-bold mb-1">Your name *</label>
          <input type="text" id="m-name" name="reader_name" required class="w-full px-4 py-3 bg-warm-white border border-amber-light/40 rounded-lg text-sm focus:outline-none focus:border-teal transition" />
        </div>
        <div>
          <label for="m-email" class="block text-xs uppercase tracking-wider text-navy font-bold mb-1">Email *</label>
          <input type="email" id="m-email" name="email" required class="w-full px-4 py-3 bg-warm-white border border-amber-light/40 rounded-lg text-sm focus:outline-none focus:border-teal transition" />
        </div>
        <div>
          <label for="m-loved" class="block text-xs uppercase tracking-wider text-navy font-bold mb-1">A book you loved lately</label>
          <input type="text" id="m-loved" name="loved_lately" value="${esc(ans.recent)}" placeholder="Title — or 'anything cozy'" class="w-full px-4 py-3 bg-warm-white border border-amber-light/40 rounded-lg text-sm placeholder-charcoal/30 focus:outline-none focus:border-teal transition" />
        </div>
        <div>
          <label for="m-vibe" class="block text-xs uppercase tracking-wider text-navy font-bold mb-1">Your reading vibe &amp; hard-no's</label>
          <textarea id="m-vibe" name="reading_vibe" rows="3" class="w-full px-4 py-3 bg-warm-white border border-amber-light/40 rounded-lg text-sm focus:outline-none focus:border-teal transition resize-y">${vibeValue}</textarea>
        </div>
        <div class="text-center pt-1">
          <button type="submit" class="inline-block bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-full text-xs uppercase tracking-[0.15em] font-bold transition-colors shadow-md">Send to Kayla</button>
        </div>
      </form>
    </div>`;

  document.getElementById("open-match")?.addEventListener("click", () => {
    const f = document.getElementById("match-form");
    f?.classList.remove("hidden");
    f?.scrollIntoView({ behavior: "smooth" });
  });
  document.getElementById("retake")?.addEventListener("click", () => location.reload());
}

render();
