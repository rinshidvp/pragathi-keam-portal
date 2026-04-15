
## Plan: Fix CosmIQ Badge Text Truncation

The CosmIQ watermark badge in the bottom-left corner has a `max-w-[60px]` constraint when not hovered, which cuts off the "CosmIQ" name (only showing "Built by C" as seen in the screenshot).

### Change Required

**File: `src/components/CosmIQBadge.tsx`**
- Line ~52: Change `${isHovered ? "max-w-[200px] opacity-100" : "max-w-[60px] opacity-90"}` 
- To: `${isHovered ? "max-w-[200px] opacity-100" : "max-w-[140px] opacity-90"}`

This increases the default width from 60px to 140px, allowing "Built by CosmIQ" to be fully visible at all times while still expanding slightly on hover for the sparkle effect.
