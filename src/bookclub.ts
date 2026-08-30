import "./style.css";
import { currentPick, pastPicks, CUSDIS_APP_ID, CUSDIS_HOST } from "./club-data.ts";
import { bookshopUrl } from "./books-logic.ts";
import { BOOKSHOP_AFFILIATE_ID, AFFILIATE_DISCLOSURE } from "./books-data.ts";

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

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// --- Current pick ---
const pickEl = document.getElementById("club-pick");
if (pickEl) {
  const cover = currentPick.cover
    ? `<img src="${currentPick.cover}" alt="${esc(currentPick.title)}" class="w-full h-full object-cover" />`
    : `<div class="w-full h-full bg-gradient-to-br from-[#6b3a5b] to-navy flex items-center justify-center p-3 text-center"><span class="font-display text-white text-base leading-tight">${esc(currentPick.title)}</span></div>`;
  const past = pastPicks.length
    ? `<div class="mt-8 text-center"><p class="text-xs uppercase tracking-[0.16em] text-amber font-bold mb-1">Past reads</p><p class="text-sm text-charcoal/60">${pastPicks.map((p) => `${esc(p.title)} — ${esc(p.author)}`).join(" &middot; ")}</p></div>`
    : "";

  const buyUrl = bookshopUrl(currentPick, BOOKSHOP_AFFILIATE_ID);
  const buyBtn = buyUrl
    ? `<a href="${buyUrl}" target="_blank" rel="sponsored noopener noreferrer" class="inline-block mt-3 bg-sage hover:bg-sage/80 text-white px-5 py-2 rounded-full text-xs font-bold transition-colors">🛍️ Get the book on Bookshop.org</a>`
    : "";
  const disclosure = BOOKSHOP_AFFILIATE_ID
    ? `<p class="text-xs text-charcoal/40 text-center mt-4 leading-snug">${AFFILIATE_DISCLOSURE}</p>`
    : "";

  pickEl.innerHTML = `
    <div class="bg-warm-white rounded-2xl shadow-lg border border-amber-light/30 overflow-hidden">
      <div class="flex flex-col sm:flex-row gap-5 p-6">
        <div class="w-32 h-44 flex-shrink-0 mx-auto sm:mx-0 rounded-lg overflow-hidden shadow-md">${cover}</div>
        <div class="flex-1 text-center sm:text-left">
          <p class="text-xs uppercase tracking-[0.14em] text-blush-dark font-bold">${esc(currentPick.monthLabel)}</p>
          <h2 class="font-display text-2xl text-navy leading-tight mt-1">${esc(currentPick.title)}</h2>
          <p class="text-sm text-charcoal/60 mb-3">by ${esc(currentPick.author)}</p>
          <p class="text-sm text-charcoal/75 leading-relaxed">${esc(currentPick.blurb)}</p>
          ${buyBtn}
        </div>
      </div>
    </div>
    ${disclosure}
    ${past}`;
}

// --- Discussion (Cusdis, or a placeholder until connected) ---
const mount = document.getElementById("discussion-mount");
if (mount) {
  if (CUSDIS_APP_ID) {
    const thread = document.createElement("div");
    thread.id = "cusdis_thread";
    thread.setAttribute("data-host", CUSDIS_HOST);
    thread.setAttribute("data-app-id", CUSDIS_APP_ID);
    thread.setAttribute("data-page-id", currentPick.threadId);
    thread.setAttribute("data-page-url", location.href);
    thread.setAttribute("data-page-title", `Unhinged Book Club — ${currentPick.title}`);
    mount.appendChild(thread);

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = `${CUSDIS_HOST}/js/cusdis.es.js`;
    document.body.appendChild(script);
  } else {
    mount.innerHTML = `
      <div class="bg-warm-white border border-dashed border-amber/50 rounded-2xl p-8 text-center">
        <div class="text-3xl mb-2">💬</div>
        <h3 class="font-display text-lg text-navy mb-1">The discussion opens soon</h3>
        <p class="text-sm text-charcoal/65 max-w-sm mx-auto">We're just wiring up the comment box. Check back shortly — or follow along on
          <a href="https://www.instagram.com/willowwispbooks/" target="_blank" rel="noopener noreferrer" class="text-teal hover:text-teal-dark font-semibold">Instagram</a>
          for club chatter in the meantime.</p>
      </div>`;
  }
}
