import { motion } from "framer-motion";
import { ImagePlus, Palette, Sparkles, Share2 } from "lucide-react";
import { staggerContainer, stepReveal } from "../../animations/variants";

// The full product flow is Landing → Upload → Editor → Vibe → Generate →
// Download → Share. Editor and Download are implementation detail, not
// decision points for the user — so the section compresses to the four
// moments a builder actually chooses something. Order carries real meaning
// here (you can't pick a vibe before uploading), which is why numbered
// steps are used instead of unordered feature cards.

const STEPS = [
  {
    number: "01",
    icon: ImagePlus,
    title: "Frame Your Builder Story",
    description:
      "Drop in a photo — JPG, PNG or HEIC. Crop and straighten it in real time, no waiting.",
  },
  {
    number: "02",
    icon: Palette,
    title: "Pick Your Builder Vibe",
    description:
      "Sunset, Ocean, Heritage or Tropical. Each restyles your frame's accent, pattern and mood.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Create My Builder Identity",
    description:
      "We assemble your profile frame and Builder Card — archetype, tech stack, builder number.",
  },
  {
    number: "04",
    icon: Share2,
    title: "Claim & Share",
    description:
      "Download in full resolution and post with a caption ready to go. #FrameInGoa",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-canvas">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stepReveal}
          className="max-w-2xl"
        >
          <p className="eyebrow mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-navy leading-tight">
            Four decisions between you and your identity.
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer(0.12)}
          className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Tide-line connector — desktop only, sits behind the step cards */}
          <svg
            className="pointer-events-none absolute left-0 right-0 top-10 hidden lg:block"
            width="100%"
            height="24"
            viewBox="0 0 1000 24"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,12 C 100,2 150,22 250,12 S 400,2 500,12 S 650,22 750,12 S 900,2 1000,12"
              fill="none"
              stroke="#C79A4B"
              strokeWidth="1.5"
              strokeDasharray="2 6"
              strokeLinecap="round"
            />
          </svg>

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                custom={i}
                variants={stepReveal}
                className="relative flex flex-col items-start"
              >
                <div className="relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-canvas shadow-lift">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <span className="font-mono text-xs text-gold mb-2">
                  {step.number}
                </span>
                <h3 className="text-lg font-semibold text-navy mb-2">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-navy/65">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
