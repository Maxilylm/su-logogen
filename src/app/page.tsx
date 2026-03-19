"use client";

import { useState, useCallback } from "react";

const STYLES = [
  { value: "minimalist", label: "Minimalist", icon: "◯" },
  { value: "geometric", label: "Geometric", icon: "⬡" },
  { value: "playful", label: "Playful", icon: "★" },
  { value: "elegant", label: "Elegant", icon: "❧" },
  { value: "bold", label: "Bold", icon: "■" },
  { value: "tech", label: "Tech", icon: "⟨/⟩" },
];

interface LogoConcept {
  name: string;
  svg: string;
  description: string;
}

function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function downloadSvg(svg: string, name: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.toLowerCase().replace(/\s+/g, "-")}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("minimalist");
  const [color, setColor] = useState("");
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [logos, setLogos] = useState<LogoConcept[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkPreview, setDarkPreview] = useState(true);

  const generate = useCallback(async () => {
    if (!brandName.trim() || !description.trim()) {
      setError("Please fill in brand name and description.");
      return;
    }
    setLoading(true);
    setError("");
    setLogos([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          description: description.trim(),
          style,
          color: useCustomColor ? color : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setLogos(data.logos);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [brandName, description, style, color, useCustomColor]);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
              LG
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">LogoGen</h1>
              <p className="text-xs text-zinc-500">AI SVG Logo Generator</p>
            </div>
          </div>
          <div className="text-xs text-zinc-600 font-mono">
            Powered by Groq + Llama
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-500/5 blur-3xl rounded-full" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            AI-Powered Vector Graphics
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Describe Your Brand.
            <br />
            Get SVG Logos Instantly.
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            No image generation APIs. No raster graphics. Pure vector SVG logos
            created by AI — infinitely scalable, ready to use.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto w-full px-4 sm:px-6 pb-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur p-6 sm:p-8 space-y-6">
          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Brand Name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Solara"
              className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Describe Your Brand
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. A sustainable coffee roastery with modern minimalist vibes, focused on ethically sourced single-origin beans"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
            />
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              Logo Style
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all text-sm ${
                    style === s.value
                      ? "border-violet-500 bg-violet-500/10 text-violet-300"
                      : "border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-xs font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Preference */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              Color Preference
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setUseCustomColor(false)}
                className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                  !useCustomColor
                    ? "border-violet-500 bg-violet-500/10 text-violet-300"
                    : "border-zinc-700/50 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                Let AI Choose
              </button>
              <button
                onClick={() => setUseCustomColor(true)}
                className={`px-4 py-2 rounded-lg border text-sm transition-all flex items-center gap-2 ${
                  useCustomColor
                    ? "border-violet-500 bg-violet-500/10 text-violet-300"
                    : "border-zinc-700/50 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                Custom Color
              </button>
              {useCustomColor && (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color || "#8b5cf6"}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-zinc-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs text-zinc-500 font-mono">
                    {color || "#8b5cf6"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-violet-500/20"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating Logos...
              </>
            ) : logos.length > 0 ? (
              "Regenerate Logos"
            ) : (
              "Generate Logos"
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      {logos.length > 0 && (
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Your Logo Concepts</h3>
            <div className="flex items-center gap-2 p-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <button
                onClick={() => setDarkPreview(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  !darkPreview
                    ? "bg-white text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-300"
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setDarkPreview(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  darkPreview
                    ? "bg-zinc-700 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-300"
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {logos.map((logo, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden transition-all hover:border-zinc-700 hover:shadow-xl hover:shadow-violet-500/5"
              >
                {/* SVG Preview */}
                <div
                  className={`p-8 flex items-center justify-center aspect-square transition-colors ${
                    darkPreview ? "bg-zinc-950" : "bg-white"
                  }`}
                >
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeSvg(logo.svg),
                    }}
                  />
                </div>

                {/* Info */}
                <div className="p-5 space-y-3 border-t border-zinc-800/50">
                  <div>
                    <h4 className="font-semibold text-zinc-200">
                      {logo.name}
                    </h4>
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                      {logo.description}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadSvg(logo.svg, logo.name)}
                    className="w-full py-2.5 rounded-xl border border-zinc-700/50 bg-zinc-800/30 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download SVG
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-zinc-600">
          <span>LogoGen by SU Generator</span>
          <span>SVGs generated by AI may need manual refinement</span>
        </div>
      </footer>
    </div>
  );
}
