# D-ONE MOTORS — Project Instructions

## About
D-ONE Motors is a luxury automotive import dealership website based in Tashkent, Uzbekistan. Single-page application with a dark, editorial luxury aesthetic.

## Tech Stack — DO NOT change versions
- **React 19** (JSX, no TypeScript)
- **Vite 7** (build tool)
- **Tailwind CSS 4** (via `@tailwindcss/vite` plugin, uses `@import "tailwindcss"` not `@tailwind`)
- **Lucide React** (icons)
- **Node 20** (Docker build)
- **Nginx Alpine** (production server)
- **Docker Compose** (deployment)
- **Python 3.12** (if any backend/scripting is ever needed)

## Project Structure
```
src/
  App.jsx          — Entire app: all sections, components, data
  index.css        — Global CSS: animations, theme, utilities
  main.jsx         — React entry point
  App.css          — (unused, can ignore)
public/
  videos/          — Hero + cinematic video files (mercedes-hero.mp4, range-rover.mp4)
nginx.conf         — Nginx config (HTTP-only currently, SSL commented out)
nginx-init.conf    — Initial config for certbot bootstrap
Dockerfile         — Multi-stage: node build → nginx serve
docker-compose.yml — web + certbot services
deploy.sh          — Deployment script
certbot/           — SSL cert volumes (conf/ and www/)
```

## Architecture
- **Single file app**: Everything is in `src/App.jsx` — utility components (FadeIn, Parallax, TextReveal, Counter, MagneticButton, ProgressiveImage) and all page sections
- **No routing**: Single page, anchor links for navigation (#models, #philosophy, #services, #features, #contact)
- **No state management**: Local useState only
- **Tailwind 4**: Uses `@theme` block in index.css for custom animations/fonts, NOT tailwind.config.js

## Page Sections (in order)
1. Intro splash screen (animated, 2.5s)
2. Navigation (fixed, blur on scroll)
3. Hero (centered title, two CTAs, video background)
4. Brand marquee (16 brands, infinite scroll)
5. Stats (4 counters)
6. Philosophy (light bg)
7. Featured Models (4 car cards)
8. Services (3 numbered items + image)
9. Features & Amenities (9 feature cards grid)
10. Cinematic video break
11. Testimonials (3 cards)
12. CTA section
13. Map (Google Maps embed)
14. Footer
15. Floating UI (back-to-top, Telegram button, mobile CTA bar)

## Business Information
- **Name**: D-ONE MOTORS
- **Location**: Muqimiy Street, 7, Tashkent, Uzbekistan
- **Phone**: +998 90 818 60 30
- **Email**: info@d-one-motors.uz
- **Telegram**: @donemotors
- **Hours**: Open daily until 9:00 PM
- **Est.**: 2020

### Brands (16)
Mercedes-Benz, Porsche, BMW, Rolls-Royce, Lamborghini, Bentley, Bugatti, Aston Martin, Land Rover, Lexus, Genesis, Kia, Hyundai, Honda

### Features & Amenities
Parking, Credit card payment, Bank transfer, Cash, Cafe, Free Wi-Fi, Preliminary registration, E-passport for vehicles, Accessible parking, Gift certificate, Restroom

### Policies
- **Pets**: Animals are prohibited
- **Wheelchair accessibility**: Unavailable
- **Payment methods**: Card, bank transfer, cash

## Deployment

### IMPORTANT: Docker requires `sudo` on the server
```bash
# Local (macOS — no sudo needed):
docker compose up -d --build web

# Production server — MUST use sudo:
sudo docker compose up -d --build web
```

### Branch: master (HEAD)
- Deployed via Docker + GitHub
- Push to master triggers deployment

### SSL Status
- Currently HTTP-only (nginx.conf serves on port 80)
- SSL certs not yet generated in certbot/conf/
- To enable SSL: run certbot, then restore SSL server blocks in nginx.conf

## Key Mobile Considerations
- Hero height is JS-locked on mobile to prevent iOS address bar resize zoom
- Scroll indicator hidden on mobile (CTA bar covers that area)
- Map iframe has touch-blocking to prevent scroll hijack — tap to interact
- Grain overlay disabled on mobile for GPU performance
- Video elements use `playsInline` + `webkit-playsinline` for iOS
- Mobile CTA bar is fixed at bottom — floating buttons positioned above it
- Footer has extra bottom padding to account for mobile CTA bar
- Marquee animation slowed to 45s for 16 brands

## Design Principles
- **Soft minimalism**: Clean, airy, restrained luxury
- **Dark theme**: Black/zinc backgrounds, white text, subtle borders
- **Typography**: Playfair Display (serif, headings) + Inter (sans, body)
- **Animations**: Fade-in on scroll, word-by-word text reveal, parallax (desktop only), magnetic buttons (desktop only)
- **Mobile-first responsive**: All sections have mobile-specific sizing

## Common Tasks

### Adding a new car to inventory
Edit the `inventory` array in App.jsx (~line 235). Each entry: `{ brand, model, image, tag }`.

### Changing brands in marquee
Edit the brand array in the marquee section (~line 430). Remember to duplicate the array for seamless loop.

### Updating features
Edit the features array in the Features & Amenities section (~line 600).

### Rebuilding after changes
```bash
docker compose -f /Users/macm2/Projects/d-one-motors/docker-compose.yml up -d --build web
```
