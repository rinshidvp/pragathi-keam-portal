

## Plan: Replace TKMCE Watermark with Original Full Logo

**Problem**: The current processed emblem is cropped/altered from the original. The logo appears too large, cutting off edges. The user wants the complete, unmodified college logo visible as a watermark.

### Changes

**1. Replace the logo asset**
- Copy the user's uploaded original logo (`user-uploads://Screenshot_20260414-224815-2.png`) to `public/images/tkmce-emblem.png`, overwriting the previously processed version.

**2. Update `src/components/HeroSection.tsx`**
- Reduce watermark size from `w-[70vh] h-[70vh]` to `w-[45vh] h-[45vh]` so the entire logo fits on screen without cropping.
- Remove `rounded-full` from the `<img>` tag since the original logo has its own circular shape.
- Keep the current blur, opacity (0.12), and `mixBlendMode: "luminosity"` unchanged — the user confirmed these look good.

