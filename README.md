# LogoGen

> Describe your brand and get three SVG logo concepts, rendered live and downloadable as real vector files.

**[Live demo](https://logogen-mlx.vercel.app)**

Most AI logo tools return a raster image you cannot edit. LogoGen asks Llama 3.3 70B to write the SVG markup directly — shapes, paths, gradients, transforms, and the brand name as actual `<text>` — so what you download is a real vector file you can open in a design tool and change. Give it a brand name, a description, a style, and optionally a primary color, and it returns three distinct concepts rendered in the browser as live SVG.

## Features

- Three logo concepts per run, each with a concept name and a short rationale
- Six style presets: minimalist, geometric, playful, elegant, bold, and tech
- Optional primary color picker that steers the palette, or let the model choose
- Live preview of the generated SVG with a light/dark background toggle
- Download each concept as a real `.svg` file, named from the concept
- SVG output sanitized on both server and client — script tags, event handlers, and `javascript:` URLs stripped

## Stack

- Next.js 16 (App Router) with React 19 and TypeScript
- Tailwind CSS v4
- Groq Chat Completions API — `llama-3.3-70b-versatile` at temperature 0.9

## Running locally

```bash
npm install
npm run dev
```

Requires `GROQ_API_KEY` in `.env.local`.

---

Part of a series of 91 small web apps. [Browse them all](https://lorenzoylosada.vercel.app).
