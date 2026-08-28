import "./style.css";
import { events } from "./events-data.ts";
import {
  splitEvents, nextOccurrence, startOfToday,
  formatChip, formatFull, isWithinDays,
  type UpcomingEvent, type PastOccurrence,
} from "./events-logic.ts";

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

// --- Scroll fade-in observer ---
const fadeEls = document.querySelectorAll(".fade-in");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
fadeEls.forEach((el) => observer.observe(el));

// --- Date-aware events rendering ---
const today = startOfToday(new Date());
const { upcoming, past } = splitEvents(events, today);

function upcomingCard(u: UpcomingEvent): string {
  const ev = u.event;
  const poster = ev.image
    ? `<div class="sm:w-48 flex-shrink-0"><img src="${ev.image}" alt="${ev.name}" class="w-full h-48 sm:h-full object-cover" /></div>`
    : "";
  const time = ev.time
    ? `<p class="flex items-start gap-2"><svg class="w-4 h-4 text-charcoal/40 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" /></svg><span>${ev.time}</span></p>`
    : "";
  const locationText = ev.address ? ev.address : ev.place;
  const location = `<p class="flex items-start gap-2"><svg class="w-4 h-4 text-charcoal/40 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg><span>${locationText}</span></p>`;
  const chips = u.futureDates.map((d, i) => {
    const soon = i === 0 && isWithinDays(d, today, 21);
    return soon
      ? `<span class="bg-sage text-white text-xs px-3 py-1 rounded-full">${formatChip(d)} • next</span>`
      : `<span class="bg-cream-dark text-charcoal/70 text-xs px-3 py-1 rounded-full">${formatChip(d)}</span>`;
  }).join("");
  return `<article class="bg-warm-white rounded-2xl shadow-sm overflow-hidden mb-6"><div class="flex flex-col sm:flex-row">${poster}<div class="p-6 flex-1"><h2 class="font-display text-xl text-navy font-semibold mb-2">${ev.name}</h2><div class="flex flex-col gap-1 mb-3 text-sm text-charcoal/70">${time}${location}</div><p class="text-xs text-charcoal/40 uppercase tracking-wider mb-3">Upcoming dates:</p><div class="flex flex-wrap gap-2">${chips}</div></div></div></article>`;
}

function pastEntry(p: PastOccurrence): string {
  const ev = p.event;
  const o = p.occurrence;
  let photos = "";
  if (o.photos && o.photos.length) {
    const cols = o.photos.length === 1 ? "grid-cols-1" : o.photos.length === 2 ? "grid-cols-2" : "grid-cols-3";
    const maxW = o.photos.length === 1 ? " max-w-md" : "";
    const tiles = o.photos.map((src) =>
      `<div class="aspect-[4/3] overflow-hidden"><img src="${src}" alt="${ev.name}" class="w-full h-full object-cover" loading="lazy" /></div>`
    ).join("");
    photos = `<div class="grid ${cols} gap-2 rounded-xl overflow-hidden${maxW}">${tiles}</div>`;
  }
  const credit = o.credit
    ? `<p class="text-xs text-charcoal/40 mt-2">Photo by <a href="${o.credit.url}" target="_blank" rel="noopener noreferrer" class="text-teal hover:text-teal-dark transition-colors">${o.credit.text}</a></p>`
    : "";
  return `<article><div class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 mb-3"><p class="text-xs text-charcoal/40 uppercase tracking-wider sm:w-40 flex-shrink-0">${formatFull(o.date)}</p><h3 class="font-display text-lg text-navy font-semibold">${ev.name} &mdash; <span class="font-normal">${ev.place}</span></h3></div>${photos}${credit}</article>`;
}

function nextBanner(): string {
  const n = nextOccurrence(events, today);
  if (n === null) return "";
  return `<div class="bg-navy text-white rounded-2xl shadow-md px-6 py-5 mb-8 flex items-center gap-4 flex-wrap"><span class="w-2.5 h-2.5 rounded-full bg-sage flex-shrink-0"></span><div><p class="text-xs uppercase tracking-widest text-amber-light">Catch us next at</p><p class="font-display text-lg">${n.event.name}</p><p class="text-sm text-white/70">${formatFull(n.date)} &middot; ${n.event.place}</p></div></div>`;
}

const nextEl = document.getElementById("events-next");
const upEl = document.getElementById("events-upcoming");
const pastEl = document.getElementById("events-past");
const emptyEl = document.getElementById("events-empty");

if (nextEl) nextEl.innerHTML = nextBanner();
if (upEl) upEl.innerHTML = upcoming.map(upcomingCard).join("");
if (pastEl) pastEl.innerHTML = past.map(pastEntry).join("");
if (emptyEl && upcoming.length === 0) emptyEl.classList.remove("hidden");

