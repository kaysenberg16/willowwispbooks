import "./style.css";

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

// --- Email signup handler ---
const emailForm = document.getElementById("email-signup") as HTMLFormElement | null;
emailForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = emailForm.querySelector("button") as HTMLButtonElement;
  const original = btn.textContent;
  btn.textContent = "Signed up!";
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
    emailForm.reset();
  }, 3000);
});

// ============================================================
// Instagram Gallery — runtime fetch with static fallback
// ============================================================

interface InstaPost {
  id: string;
  caption?: string;
  media_url: string;
  permalink: string;
  timestamp: string;
  media_type: string;
}

// Set your Instagram Graph API long-lived token here or in an env var.
// Generate one at: https://developers.facebook.com/docs/instagram-basic-display-api/
// Then exchange for a long-lived token (60 days).
const INSTAGRAM_TOKEN = import.meta.env.VITE_INSTAGRAM_TOKEN as string | undefined;
const INSTAGRAM_COUNT = 7;

const galleryGrid = document.getElementById("insta-grid");

// --- Modal ---
const modal = document.createElement("div");
modal.id = "gallery-modal";
modal.className =
  "fixed inset-0 z-[100] hidden items-center justify-center bg-black/80 p-4 cursor-pointer";
modal.innerHTML = `
  <button id="modal-close" class="absolute top-4 right-4 text-white/80 hover:text-white text-3xl leading-none z-10" aria-label="Close">&times;</button>
  <div id="modal-inner" class="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
    <img id="modal-img" class="max-h-[75vh] w-auto max-w-full object-contain rounded-lg" src="" alt="" />
    <p id="modal-caption" class="text-white/90 text-sm mt-4 text-center max-w-lg leading-relaxed"></p>
    <a id="modal-link" href="#" target="_blank" rel="noopener noreferrer"
       class="mt-3 text-teal hover:text-teal-dark text-xs uppercase tracking-widest font-semibold transition-colors">
      View on Instagram &rarr;
    </a>
  </div>
`;
document.body.appendChild(modal);

function openModal(imgSrc: string, caption: string, permalink: string) {
  const img = modal.querySelector("#modal-img") as HTMLImageElement;
  const cap = modal.querySelector("#modal-caption") as HTMLParagraphElement;
  const link = modal.querySelector("#modal-link") as HTMLAnchorElement;
  img.src = imgSrc;
  img.alt = caption;
  cap.textContent = caption;
  if (permalink) {
    link.href = permalink;
    link.classList.remove("hidden");
  } else {
    link.classList.add("hidden");
  }
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "";
}

modal.addEventListener("click", (e) => {
  if (e.target === modal || (e.target as Element).id === "modal-close") {
    closeModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// --- Build a gallery tile ---
function createTile(
  imgSrc: string,
  caption: string,
  permalink: string
): HTMLElement {
  const tile = document.createElement("div");
  tile.className = "gallery-tile overflow-hidden aspect-square relative cursor-pointer group";

  tile.innerHTML = `
    <img src="${imgSrc}" alt="${caption.replace(/"/g, "&quot;")}"
         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-end p-3">
      <p class="text-white text-xs leading-snug opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-3">
        ${caption}
      </p>
    </div>
  `;

  tile.addEventListener("click", () => openModal(imgSrc, caption, permalink));
  return tile;
}

// --- Static fallback data ---
const staticPosts: { src: string; caption: string }[] = [
  { src: "/images/gallery-1.jpg", caption: "Set up and ready for a great day at the market!" },
  { src: "/images/gallery-5.jpg", caption: "The cozy interior with all the bookish vibes" },
  { src: "/images/gallery-2.jpg", caption: "Fairy lights, ivy, and a whole lot of stories" },
  { src: "/images/gallery-3.jpg", caption: "Mushroom decor and whimsical touches everywhere" },
  { src: "/images/gallery-4.jpg", caption: "Kids books corner - so many colorful reads!" },
  { src: "/images/gallery-6.jpg", caption: "Celestial vibes with this gorgeous tapestry" },
  { src: "/images/gallery-7.jpg", caption: "Happy visitors checking out the trailer!" },
];

// --- Load gallery ---
async function loadGallery() {
  if (!galleryGrid) return;

  // Try Instagram API first
  if (INSTAGRAM_TOKEN) {
    try {
      const url = `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,timestamp,media_type&limit=${INSTAGRAM_COUNT}&access_token=${INSTAGRAM_TOKEN}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Instagram API ${res.status}`);
      const json = await res.json();
      const posts: InstaPost[] = json.data;

      galleryGrid.innerHTML = "";
      for (const post of posts) {
        if (post.media_type === "VIDEO") continue;
        const caption = post.caption ?? "";
        const tile = createTile(post.media_url, caption, post.permalink);
        galleryGrid.appendChild(tile);
      }
      console.log(`Loaded ${posts.length} posts from Instagram`);
      return;
    } catch (err) {
      console.warn("Instagram API failed, falling back to static images:", err);
    }
  }

  // Static fallback — attach hover + modal to existing tiles, or rebuild
  galleryGrid.innerHTML = "";
  for (const post of staticPosts) {
    const tile = createTile(post.src, post.caption, "https://www.instagram.com/willowwispbooks/");
    // Show on mobile, hide extras on small screens
    if (staticPosts.indexOf(post) >= 5) {
      tile.classList.add("hidden", "md:block");
    }
    galleryGrid.appendChild(tile);
  }
}

loadGallery();
