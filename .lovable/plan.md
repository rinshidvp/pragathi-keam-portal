

## Plan: Fix TKMCE Logo Watermark — Use Original Logo, Fully Visible

**Problem**: The current watermark is too large (`70vh`), causing it to be cropped on mobile. Also, the logo was pre-processed (emblem isolated), altering the original college logo which is not acceptable.

### Changes

**1. Replace the logo asset**
- Copy the user's uploaded original TKMCE logo (`user-uploads://Screenshot_20260414-224815-2.png`) to `public/images/tkmce-emblem.png`, replacing the previously processed version.
- This restores the authentic college emblem with the full circular text border.

**2. Update `src/components/HeroSection.tsx`**
- Reduce the watermark size from `w-[70vh] h-[70vh]` to `w-[50vh] h-[50vh]` so the full logo is visible on all screen sizes without cropping.
- Keep the current blur (`blur(3px)`), opacity (`0.12`), and `mixBlendMode: "luminosity"` — the user confirmed these look good.
- Remove `rounded-full` from the `<img>` since the original logo already has a circular shape with transparent corners.

