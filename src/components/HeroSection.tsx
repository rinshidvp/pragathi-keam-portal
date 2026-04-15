import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-cream py-20 sm:py-32 lg:py-40">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-sunset-yellow rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-sunset-red rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sunset-orange rounded-full blur-3xl" />
      </div>

      {/* TKMCE Emblem Watermark */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vh] h-[70vh] pointer-events-none"
        style={{
          opacity: 0.12,
          filter: "blur(3px)",
          mixBlendMode: "luminosity",
          zIndex: 0,
        }}
      >
        <img
          src="/images/tkmce-emblem.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain rounded-full"
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-sm sm:text-base font-semibold tracking-widest uppercase text-muted-foreground mb-4">
            TKM College of Engineering
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight">
            <span className="text-gradient-sunset">Your Gateway to TKMCE:</span>
            <br />
            <span className="text-foreground">Official KEAM</span>
            <br />
            <span className="text-gradient-sunset">Help Desk 2026.</span>
          </h1>
          <p className="mt-6 sm:mt-8 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
            Run by Pragathi College Union. For the Students, By the Students.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#resources"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-sunset text-primary-foreground font-bold text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Access Mock Tests
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#contacts"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-border text-foreground font-bold text-base hover:bg-accent transition-colors"
          >
            <Users className="w-4 h-4" />
            Join Aspirant Community
          </a>
        </motion.div>
      </div>
    </section>
  );
}
