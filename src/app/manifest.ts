import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Unique Labs",
    short_name: "Unique Labs",
    description: "Useful digital products that make everyday digital experiences better.",
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
