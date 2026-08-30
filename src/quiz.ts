import "./style.css";
import { classify, ARCHETYPES, type QuizAnswers, type Genre, type ArchetypeKey } from "./quiz-logic.ts";
import { bestMatch, surprisePick, bookshopUrl, type Book } from "./books-logic.ts";
import { books, alsoEnjoy, bonusSuggestions, BOOKSHOP_AFFILIATE_ID, AFFILIATE_DISCLOSURE } from "./books-data.ts";

function buyButton(item: { isbn?: string; buyUrl?: string }): string {
  const url = bookshopUrl(item, BOOKSHOP_AFFILIATE_ID);
  return url
    ? `<a href="${url}" target="_blank" rel="sponsored noopener noreferrer" class="inline-block mt-2 bg-sage hover:bg-sage/80 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors">🛍️ Buy on Bookshop.org</a>`
    : "";
}

const DISCLOSURE_HTML = BOOKSHOP_AFFILIATE_ID
  ? `<p class="text-xs text-charcoal/40 max-w-md mx-auto mt-4 leading-snug">${AFFILIATE_DISCLOSURE}</p>`
  : "";

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

// --- Question types ---
type ChoiceOpt = { e?: string; t: string; val: string };
type ChoiceQ = { type: "choice"; key: string; q: string; hint?: string; opts: ChoiceOpt[] };
type TextQ = { type: "text"; key: string; q: string; hint?: string; placeholder?: string; optional?: boolean };
type MultiQ = { type: "multi"; key: string; q: string; hint?: string; opts: string[] };
type Question = ChoiceQ | TextQ | MultiQ;

const NOPE_ANYTHING = "Nothing — I'll try anything";

// Q1 — everyone
const genreQ: ChoiceQ = {
  type: "choice", key: "genre", q: "First things first — what's your genre?",
  opts: [
    { e: "🕵️", t: "Mystery", val: "mystery" },
    { e: "💞", t: "Romance", val: "romance" },
    { e: "🐉", t: "Fantasy & Sci-Fi", val: "fantasy" },
    { e: "📓", t: "Nonfiction", val: "nonfiction" },
    { e: "🎲", t: "I'll read anything", val: "anything" },
  ],
};

// Per-genre branch: [decisive (sets shelf), flavor]
const BRANCH: Record<Genre, Question[]> = {
  mystery: [
    {
      type: "choice", key: "shelf", q: "What's your ideal mystery?",
      opts: [
        { e: "☕", t: "Cozy & charming — tea, a nosy amateur sleuth, small-town secrets", val: "mystery_cozy" },
        { e: "🔪", t: "Twisty & tense — high stakes, can't-trust-anyone, keeps me up at night", val: "mystery_thriller" },
      ],
    },
    {
      type: "choice", key: "flavor", q: "How much grit?",
      opts: [
        { e: "🧩", t: "Clever & bloodless", val: "clever & bloodless" },
        { e: "🩸", t: "Dark & gritty", val: "dark & gritty" },
      ],
    },
  ],
  romance: [
    {
      type: "choice", key: "shelf", q: "How do you like your romance?",
      opts: [
        { e: "🌸", t: "Sweet & swoony — slow-burn, banter, closed-door", val: "romance_clean" },
        { e: "🔥", t: "Spicy and/or dark — heat, tension, morally-gray love interests", val: "romance_spicy" },
      ],
    },
    {
      type: "choice", key: "flavor", q: "Angst level?",
      opts: [
        { e: "🫖", t: "Cozy comfort", val: "cozy comfort" },
        { e: "💔", t: "Make me ache", val: "make-me-ache angst" },
      ],
    },
  ],
  fantasy: [
    {
      type: "choice", key: "shelf", q: "What pulls you into a world?",
      opts: [
        { e: "🗺️", t: "The adventure — quests, magic, found family, epic fun", val: "fantasy_adventure" },
        { e: "🌌", t: "The big questions — mind-bending ideas, aching wonder", val: "fantasy_existential" },
      ],
    },
    {
      type: "choice", key: "flavor", q: "Which way do you lean?",
      opts: [
        { e: "⚔️", t: "More fantasy", val: "fantasy-leaning" },
        { e: "🚀", t: "More sci-fi", val: "sci-fi-leaning" },
      ],
    },
  ],
  nonfiction: [
    {
      type: "choice", key: "shelf", q: "What are you here for?",
      opts: [
        { e: "😄", t: "To laugh & learn — witty, surprising, delightful rabbit-holes", val: "nonfiction_fun" },
        { e: "🫀", t: "To think & feel — big ideas and stories that stay with me", val: "nonfiction_sad" },
      ],
    },
    {
      type: "multi", key: "topics", q: "What topics hook you?", hint: "Pick any.",
      opts: ["Memoir", "History", "Science", "True crime", "Nature", "Culture & society"],
    },
  ],
};

// Universal tail
const recentQ: TextQ = {
  type: "text", key: "recent", q: "What have you read and loved lately?",
  hint: "A title, an author, or just “anything cozy.” Totally optional.",
  placeholder: "e.g. anything by T.J. Klune…", optional: true,
};
const nopeQ: MultiQ = {
  type: "multi", key: "nope", q: "What's a hard no for you?",
  hint: "Pick any — I'll steer clear.",
  opts: ["Cliffhangers", "Too much spice", "Heavy or sad endings", "Slow burns", "Gore & violence", NOPE_ANYTHING],
};

// --- State ---
let step = 0;
const choiceAns: Record<string, string> = {};
const multiSets: Record<string, Set<string>> = { topics: new Set(), nope: new Set() };
let recentAns = "";

function flow(): Question[] {
  const g = choiceAns.genre;
  if (!g) return [genreQ];
  if (g === "anything") return [genreQ, recentQ, nopeQ];
  return [genreQ, ...BRANCH[g as Genre], recentQ, nopeQ];
}

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

function matchCard(book: Book): string {
  const cover = book.cover
    ? `<img src="${book.cover}" alt="${esc(book.title)}" class="w-full h-full object-cover" />`
    : `<div class="w-full h-full bg-gradient-to-br from-navy to-teal flex items-center justify-center p-2 text-center"><span class="font-display text-white text-xs leading-tight">${esc(book.title)}</span></div>`;
  const chips = book.tags.slice(0, 4)
    .map((t) => `<span class="bg-cream-dark text-charcoal/70 text-[0.62rem] px-2 py-0.5 rounded-full">${esc(t)}</span>`)
    .join("");
  const blurb = book.blurb ? `<p class="text-xs text-charcoal/60 mt-1.5">${esc(book.blurb)}</p>` : "";
  return `
    <div class="max-w-sm mx-auto my-6 bg-warm-white border border-amber-light/40 rounded-2xl shadow-lg overflow-hidden text-left">
      <p class="text-center text-xs uppercase tracking-[0.22em] text-amber font-bold pt-3">✦ Your blind date ✦</p>
      <div class="flex gap-3 p-4 pt-2">
        <div class="w-20 h-28 flex-shrink-0 rounded-md overflow-hidden shadow">${cover}</div>
        <div class="min-w-0">
          <h3 class="font-display text-lg text-navy leading-tight">${esc(book.title)}</h3>
          <p class="text-xs text-charcoal/60 mb-2">by ${esc(book.author)}</p>
          <div class="flex flex-wrap gap-1">${chips}</div>
          ${blurb}
          ${buyButton(book)}
        </div>
      </div>
    </div>`;
}

function genreCard(genreLabel: string): string {
  return `
    <div class="blind-wrap max-w-xs mx-auto my-6 shadow-lg" style="background-image:url('/images/blind dates.jpg')">
      <div class="font-script text-xl">✦ your blind date ✦</div>
      <div class="font-display text-xl mt-0.5">${esc(genreLabel)}</div>
      <div class="text-xs uppercase tracking-[0.1em] opacity-90 mt-1">hand-wrapped by Kayla</div>
    </div>`;
}

function render(): void {
  const Q = flow()[step];
  if (!Q || !bar || !qcount || !qtext || !qhint || !opts || !backBtn || !contBtn) return;

  const total = choiceAns.genre === "anything" ? 3 : 5;
  bar.style.width = `${(step / total) * 100}%`;
  qcount.textContent = `Question ${step + 1} of ${total}`;
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
      b.innerHTML = o.e ? `<span class="text-xl">${o.e}</span><span>${o.t}</span>` : `<span>${o.t}</span>`;
      b.addEventListener("click", () => {
        if (Q.key === "genre" && choiceAns.genre !== o.val) {
          // switching genre invalidates the old branch's answers
          delete choiceAns.shelf;
          delete choiceAns.flavor;
          multiSets.topics.clear();
        }
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
    const set = multiSets[Q.key] ?? (multiSets[Q.key] = new Set());
    for (const label of Q.opts) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quiz-opt" + (set.has(label) ? " sel" : "");
      b.innerHTML = `<span>${label}</span>`;
      b.addEventListener("click", () => {
        if (label === NOPE_ANYTHING) {
          set.clear();
          set.add(label);
        } else {
          set.delete(NOPE_ANYTHING);
          if (set.has(label)) set.delete(label);
          else set.add(label);
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
  if (step < flow().length) render();
  else showResult();
}

function collect(): QuizAnswers {
  const genre = (choiceAns.genre ?? "mystery") as Genre;
  const shelf = (choiceAns.shelf ?? "mystery_cozy") as ArchetypeKey;
  const flavor: string[] = [];
  if (choiceAns.flavor) flavor.push(choiceAns.flavor);
  flavor.push(...multiSets.topics);
  return { genre, shelf, flavor, recent: recentAns, nope: [...multiSets.nope] };
}

function descLines(recent: string, nopes: string[]): string {
  const recentLine = recent
    ? `<p class="text-sm text-charcoal/65">Because you loved <strong>${esc(recent)}</strong>, I've got ideas already. 😊</p>`
    : "";
  const nopeItems = nopes
    .map((n) => `<span class="font-semibold text-blush-dark">${esc(n.toLowerCase())}</span>`)
    .join(", ");
  const nopeLine = nopes.length
    ? `<p class="text-sm text-charcoal/65">I'll steer clear of ${nopeItems}.</p>`
    : "";
  return recentLine + nopeLine;
}

function alsoEnjoyHTML(shelf: ArchetypeKey): string {
  const extras = alsoEnjoy[shelf] ?? [];
  return extras.length
    ? `<div class="max-w-md mx-auto mb-5"><p class="text-xs uppercase tracking-[0.16em] text-amber font-bold mb-1">You might also enjoy</p><p class="text-sm text-charcoal/70">${extras.map(esc).join(" &middot; ")}</p></div>`
    : "";
}

function bonusHTML(shelf: ArchetypeKey): string {
  const b = bonusSuggestions[shelf];
  if (!b) return "";
  const buy = buyButton(b);
  return `<div class="max-w-md mx-auto mb-5 bg-cream border border-blush/40 rounded-xl px-4 py-3"><p class="text-sm text-charcoal/80">${esc(b.prompt)} &rarr; <strong class="text-blush-dark">${esc(b.title)}</strong> <span class="text-charcoal/55">by ${esc(b.author)}</span></p>${buy}</div>`;
}

type ResultView = {
  name: string;
  sub: string;
  shelfLabel: string;
  blurb: string;
  desc: string;
  reveal: string;
  alsoHtml: string;
  bonus: string;
  ctaLabel: string;
  quizResult: string;
  vibeValue: string;
  loved: string;
};

function resultShell(v: ResultView): string {
  return `
    <div class="text-center">
      <span class="inline-block bg-navy text-amber-light text-xs uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">Your reader type</span>
      <h2 class="font-display text-3xl text-navy mt-3 mb-0.5">${esc(v.name)}</h2>
      <p class="text-xs text-blush-dark italic mb-1">${esc(v.sub)}</p>
      <p class="text-xs uppercase tracking-[0.12em] text-teal-dark font-bold">Your shelf → ${esc(v.shelfLabel)}</p>
      <div class="max-w-md mx-auto mt-4 text-left space-y-2">
        <p class="text-sm text-charcoal/75">${v.blurb}</p>
        ${v.desc}
      </div>

      ${v.reveal}
      <p class="text-xs text-charcoal/50 italic -mt-2 mb-4 max-w-xs mx-auto">Don't love this month's pick? The shelves refresh monthly — check back next month! 📅</p>
      ${v.alsoHtml}
      ${v.bonus}

      <button type="button" id="open-match" class="inline-block bg-amber hover:bg-amber-light text-navy px-8 py-3 rounded-full text-xs uppercase tracking-[0.12em] font-bold transition-colors shadow-md">${v.ctaLabel}</button>
      <div class="mt-3"><button type="button" id="retake" class="text-teal-dark text-sm hover:underline">↺ retake the quiz</button></div>
      ${DISCLOSURE_HTML}

      <form action="${FORMSPREE_ENDPOINT}" method="POST" id="match-form" class="hidden text-left bg-cream border border-dashed border-teal/50 rounded-2xl p-6 mt-6 space-y-4">
        <input type="hidden" name="_subject" value="💌 Reader match request — Willow Wisp Books" />
        <input type="hidden" name="request_type" value="matchmaking" />
        <input type="hidden" name="quiz_result" value="${esc(v.quizResult)}" />
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
          <input type="text" id="m-loved" name="loved_lately" value="${esc(v.loved)}" placeholder="Title — or 'anything cozy'" class="w-full px-4 py-3 bg-warm-white border border-amber-light/40 rounded-lg text-sm placeholder-charcoal/30 focus:outline-none focus:border-teal transition" />
        </div>
        <div>
          <label for="m-vibe" class="block text-xs uppercase tracking-wider text-navy font-bold mb-1">Your reading vibe &amp; hard-no's</label>
          <textarea id="m-vibe" name="reading_vibe" rows="3" class="w-full px-4 py-3 bg-warm-white border border-amber-light/40 rounded-lg text-sm focus:outline-none focus:border-teal transition resize-y">${v.vibeValue}</textarea>
        </div>
        <div class="text-center pt-1">
          <button type="submit" class="inline-block bg-navy hover:bg-navy-light text-white px-8 py-3 rounded-full text-xs uppercase tracking-[0.15em] font-bold transition-colors shadow-md">Send to Kayla</button>
        </div>
      </form>
    </div>`;
}

function mountResult(body: HTMLElement, html: string): void {
  body.innerHTML = html;
  document.getElementById("open-match")?.addEventListener("click", () => {
    const f = document.getElementById("match-form");
    f?.classList.remove("hidden");
    f?.scrollIntoView({ behavior: "smooth" });
  });
  document.getElementById("retake")?.addEventListener("click", () => location.reload());
}

function showResult(): void {
  const body = document.getElementById("quiz-body");
  if (!body || !bar) return;
  bar.style.width = "100%";

  const nopes = [...multiSets.nope].filter((n) => n !== NOPE_ANYTHING);

  // "I'll read anything" → a surprise pick, no genre-specific questions.
  if (choiceAns.genre === "anything") {
    const pick = surprisePick(books, [...multiSets.nope]);
    const vibeBits = ["open to anything"];
    if (pick) vibeBits.push(`matched to: ${pick.title}`);
    if (nopes.length) vibeBits.push(`no: ${nopes.join(", ").toLowerCase()}`);
    mountResult(body, resultShell({
      name: "The Open Book",
      sub: "the trailer's favorite kind of reader",
      shelfLabel: "Reader's choice",
      blurb: "You'll read anything — which makes you exactly who Blind Dates were made for. Here's one I think you'll love.",
      desc: descLines(recentAns, nopes),
      reveal: pick ? matchCard(pick) : genreCard("Surprise Me"),
      alsoHtml: pick ? alsoEnjoyHTML(pick.shelf) : "",
      bonus: pick ? bonusHTML(pick.shelf) : "",
      ctaLabel: pick ? "💌 Ask Kayla to wrap this for me" : "💌 Let Kayla match me for real",
      quizResult: pick ? `The Open Book · ${pick.title}` : "The Open Book",
      vibeValue: esc(vibeBits.join(" · ")),
      loved: recentAns,
    }));
    return;
  }

  const a = collect();
  const r = ARCHETYPES[classify(a)];
  const flavor = a.flavor.filter(Boolean);
  const match = bestMatch(books, a);

  const vibeBits = [`${r.shelf} reader`];
  if (match) vibeBits.push(`matched to: ${match.title}`);
  if (flavor.length) vibeBits.push(`likes: ${flavor.join(", ").toLowerCase()}`);
  if (nopes.length) vibeBits.push(`no: ${nopes.join(", ").toLowerCase()}`);

  mountResult(body, resultShell({
    name: r.name,
    sub: "a Willow Wisp reader type",
    shelfLabel: r.shelf,
    blurb: r.blurb,
    desc: descLines(a.recent, nopes),
    reveal: match ? matchCard(match) : genreCard(r.genreLabel),
    alsoHtml: alsoEnjoyHTML(classify(a)),
    bonus: bonusHTML(classify(a)),
    ctaLabel: match ? "💌 Ask Kayla to wrap this for me" : "💌 Let Kayla match me for real",
    quizResult: `${r.name} · ${r.shelf}`,
    vibeValue: esc(vibeBits.join(" · ")),
    loved: a.recent,
  }));
}

render();
