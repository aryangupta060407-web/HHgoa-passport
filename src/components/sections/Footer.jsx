import { Twitter, Instagram, ArrowUpRight } from "lucide-react";
import VibePattern from "../ui/VibePattern";

const LINKS = {
  Product: [
    { label: "Frame your story", href: "#upload" },
    { label: "Builder vibes", href: "#how-it-works" },
    { label: "View demo", href: "#demo" },
  ],
  "Hacker House Goa": [
    { label: "About HH Goa 2026", href: "https://hackerhouse.dev" },
    { label: "Shortlisting task", href: "#" },
    { label: "Rules", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy text-canvas">
      {/* Horizon divider — a sun arc dipping into the tile line, echoing the hero */}
      <svg
        className="absolute -top-px left-0 w-full"
        height="48"
        viewBox="0 0 1000 48"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,48 Q500,-16 1000,48 Z" fill="#10263F" />
        <circle cx="500" cy="20" r="10" fill="#E8734A" opacity="0.85" />
      </svg>

      <VibePattern
        vibe="heritage"
        className="absolute inset-0"
        opacity={0.05}
        color="#F1E6D2"
      />

      <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-10">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className="font-display text-xl font-semibold">HH Goa</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-canvas/60">
              The official Builder Identity Generator for Hacker House Goa
              2026. Frame your story, claim your place.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://x.com"
                aria-label="HH Goa on X"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-canvas/20 transition-colors hover:border-sunset hover:text-sunset"
              >
                <Twitter size={16} />
              </a>
              <a
                href="https://instagram.com"
                aria-label="HH Goa on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-canvas/20 transition-colors hover:border-sunset hover:text-sunset"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <p className="eyebrow text-gold">{heading}</p>
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="group inline-flex items-center gap-1 text-sm text-canvas/75 transition-colors hover:text-canvas"
                    >
                      {item.label}
                      <ArrowUpRight
                        size={13}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-4 border-t border-canvas/10 pt-6 text-xs text-canvas/50 sm:flex-row sm:items-center">
          <p>© 2026 Hacker House Goa. Built by builders, for builders.</p>
          <p className="font-mono">#FrameInGoa</p>
        </div>
      </div>
    </footer>
  );
}
