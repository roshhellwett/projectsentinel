import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "India Verified - AI-Verified Indian News",
    short_name: "India Verified",
    description:
      "Fully automated, AI-powered Indian news aggregator. Every story verified through cross-referencing multiple trusted sources.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    background_color: "#ffffff",
    theme_color: "#f2efe9",
    orientation: "portrait",
    categories: ["news", "politics", "technology"],
    lang: "en",
    dir: "ltr",
    prefer_related_applications: false,
    shortcuts: [
      {
        name: "Swipe stories",
        short_name: "Swipe",
        url: "/swipe/",
        description: "Swipe through the latest verified stories",
      },
      {
        name: "Saved stories",
        short_name: "Saved",
        url: "/saved/",
        description: "Your bookmarked stories",
      },
      {
        name: "Search",
        short_name: "Search",
        url: "/search/",
        description: "Search verified Indian news",
      },
    ],
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
