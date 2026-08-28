import { defineConfig } from "vite";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        events: resolve(__dirname, "events.html"),
        quiz: resolve(__dirname, "quiz.html"),
        bookclub: resolve(__dirname, "bookclub.html"),
        reviews: resolve(__dirname, "reviews.html"),
        submissions: resolve(__dirname, "submissions.html"),
      },
    },
  },
});
