import type { WWEvent } from "./events-logic.ts";

// Kayla edits this list. To add a market date, add an ISO "YYYY-MM-DD" string to
// that event's `dates` array. Past dates move to "Past Events" automatically.
// For a past date with photos, use the object form (see the NW Metaphysical example).
export const events: WWEvent[] = [
  {
    name: "Maple Valley Farmers Market",
    place: "Maple Valley, WA",
    address: "25719 Maple Valley Black Diamond Rd SE, Maple Valley, WA 98038",
    time: "Saturdays, 9:00 AM – 2:00 PM",
    image: "/images/Maple Valley Farmer's Market.png",
    dates: ["2026-09-05", "2026-10-03", "2026-10-31", "2026-08-01", "2026-05-02"],
  },
  {
    name: "The Witching Hour: An Enchanted Market",
    place: "Gig Harbor, WA",
    address: "Volunteer Vern Pavilion, Gig Harbor, WA",
    time: "5:00 – 8:00 PM",
    image: "/images/the-witching-hour.jpg",
    dates: ["2026-09-10"],
  },
  {
    name: "NW Metaphysical Market",
    place: "Tacoma, WA",
    image: "/images/NW Metaphysical MarketMe.jpg",
    dates: [
      "2026-08-22",
      "2026-07-25",
      "2026-04-25",
      {
        date: "2026-04-11",
        photos: ["/images/NW Metaphysical MarketMe.jpg"],
        credit: { text: "@wayfarerwellspring", url: "https://www.instagram.com/wayfarerwellspring/" },
      },
    ],
  },
  {
    name: "Bees in the Burbs",
    place: "Maple Valley, WA",
    dates: [{ date: "2026-04-04", photos: ["/images/Bees.jpeg", "/images/bees2.jpeg", "/images/bees3.jpeg"] }],
  },
  {
    name: "CCB Community Shopping Event",
    place: "Maple Valley, WA",
    dates: [{ date: "2026-03-22", photos: ["/images/CCB 3.22 (2).jpeg", "/images/CCB 3.22 (3).jpeg", "/images/CCB 3.22.jpeg"] }],
  },
  {
    name: "Eastside Alchemy Market",
    place: "Bellevue, WA",
    dates: [{ date: "2026-03-07", photos: ["/images/Eastside Alchemy Market.jpeg", "/images/IMG_0424.jpeg", "/images/blind dates.jpg"] }],
  },
  {
    name: "Holiday Night Market",
    place: "Benbow Room, West Seattle",
    dates: [{ date: "2025-12-17", photos: ["/images/Benbow4.jpeg", "/images/IMG_0680.jpeg", "/images/Benbow3.jpeg"] }],
  },
  {
    name: "Northwest Christmas Market",
    place: "Enumclaw Expo Center, Enumclaw, WA",
    dates: [{ date: "2025-12-05", photos: ["/images/Enumclaw Xmas.jpeg", "/images/Enumclaw Xmas (2).jpeg", "/images/blind-date-book.jpg"] }],
  },
];
