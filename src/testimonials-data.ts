// Kayla edits this list. These are REAL things real people have said — keep them
// verbatim. The homepage shows the first three; the whole section disappears on its
// own if this list is empty, so it's safe to clear it out or swap quotes any time.
//
// `attribution` is how the person gets credited, and it's allowed to be as long and
// as funny as the truth requires. `place` is optional ("Maple Valley, WA").
// If you want to remember where a quote came from (Google, Facebook, said out loud
// at a market), just leave yourself a // comment next to the entry.

export type Testimonial = {
  quote: string;
  attribution: string;
  place?: string;
};

export const testimonials: Testimonial[] = [
  {
    // said out loud at a market, late morning
    quote:
      "I'm a little tipsy, but even if I hadn't been drinking all morning, these are the cutest books I've ever seen.",
    attribution: "Drunk but nice lady at a market",
  },
  {
    // said out loud at a market
    quote:
      "I don't like books or reading, but your setup is really cute. Really good vibes, even if there are books.",
    attribution: "Book-hating lady who still loved my shop",
  },
  {
    // my own child, one full year into this business
    quote: "Wow, this is all really awesome? What's this?",
    attribution:
      "My teenage son, stopping by the shop for the first time after a year, somehow surprised by things he has definitely already seen at our house",
  },
];
