import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import VibePattern from "../ui/VibePattern";
import { fadeUp, staggerContainer, buttonTap, ambientFloat } from "../../animations/variants";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy text-canvas">
      <VibePattern vibe="sunset" className="absolute inset-0" opacity={0.08} />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "linear-gradient(180deg, rgba(232,115,74,0) 0%, rgba(232,115,74,0.18) 100%)",
        }}
      />

      {/* Ambient floating glow, kept subtle — atmosphere, not focal motion */}
      <motion.div
        {...ambientFloat(0.5)}
        className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-sunset/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-24 sm:pt-36">
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer(0.12)}
          className="max-w-2xl"
        >
          <motion.p variants={fadeUp} className="eyebrow mb-5 text-gold">
            Hacker House Goa · 2026
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-semibold leading-[1.08] sm:text-6xl"
          >
            Frame your builder story.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-lg text-base leading-relaxed text-canvas/70 sm:text-lg"
          >
            The official Builder Identity Generator for HH Goa. Upload a
            photo, pick your vibe, and claim the frame and card that says you
            were here.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
            <motion.a
              href="#upload"
              variants={buttonTap}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="inline-flex items-center gap-2 rounded-full bg-sunset px-6 py-3 text-sm font-semibold text-canvas shadow-lift"
            >
              Upload Photo
              <ArrowRight size={16} />
            </motion.a>
            <motion.a
              href="#demo"
              variants={buttonTap}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="inline-flex items-center gap-2 rounded-full border border-canvas/25 px-6 py-3 text-sm font-semibold text-canvas"
            >
              <PlayCircle size={16} />
              View Demo
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
