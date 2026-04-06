# ChildCompass — Design System

## Colors (CSS variables in `globals.css`)

| Token | Value | Usage |
|---|---|---|
| `--primary` | `hsl(221, 83%, 53%)` | CTAs, buttons (blue) |
| `--accent` | `hsl(38, 92%, 60%)` | Highlights (orange) |

### Card Color Variants
| Name | Color |
|---|---|
| `sky` | Blue |
| `sunshine` | Orange |
| `mint` | Green |
| `coral` | Red |
| `lavender` | Purple |

## Typography

- **Font**: Plus Jakarta Sans (Google Fonts)
- **Weights**: 400, 500, 600, 700, 800
- Applied via `font-sans` Tailwind class or `var(--font-plus-jakarta-sans)`

## Animations (`tailwind.config.ts`)

| Class | Effect |
|---|---|
| `animate-fade-up` | Fade + slide up (0.5s) |
| `animate-pop` | Scale bounce (0.4s) |
| `animate-float` | Infinite gentle bounce |
| `animate-slide-in` | Slide from left |

## Utility

```typescript
import { cn } from '@/lib/utils/cn'

// Merge conditional Tailwind classes
<div className={cn('base', condition && 'extra')} />
```

## Radix UI Components (in `src/components/ui/`)

Dialog, Dropdown Menu, Select, Tabs, Toast, Avatar, Label, Slot
