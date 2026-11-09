import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Unique Labs",
    short_name: "Unique Labs",
    description: "KOC and consultancy services, digital marketing and blockchain development — helping brands and Web3 projects build, launch and grow.",
    start_url: "/",
    display: "browser",
    background_color: "#0d0d10",
    theme_color: "#0d0d10",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/brand/icon-192.png", type: "image/png", sizes: "192x192" },
      { src: "/brand/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
  };
}
