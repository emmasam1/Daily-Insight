import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button, ConfigProvider, theme, message, Modal } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Sparkles,
  SlidersHorizontal,
  Lock,
  Type,
} from "lucide-react";
import { toPng } from "html-to-image";

const CARD_THEMES = {
  stark: {
    name: "Stark Black",
    bg: "bg-[#000000]",
    border: "border-[#1c1c1c]",
    text: "text-white",
    accentBg: "bg-[#090909]",
    ring: "ring-0",
    isLocked: false,
  },
  gold: {
    name: "Luxury Gold",
    bg: "bg-[#0d0c07]",
    border: "border-[#c5a880]",
    text: "text-[#f4efe6]",
    accentBg: "bg-[#17140e]",
    ring: "ring-0",
    isLocked: true,
  },
  cyber: {
    name: "Onyx Matrix",
    bg: "bg-[#030804]",
    border: "border-[#00ff66]",
    text: "text-[#e0ffe0]",
    accentBg: "bg-[#051408]",
    ring: "ring-2 ring-[#00ff66]/30 shadow-[0_0_15px_rgba(0,255,102,0.2)]",
    isLocked: true,
  },
};

// 🏛️ The Premium 9-Font Vault organized by Design Style Profile
const FONT_VAULT = {
  serif: {
    label: "Classic Serif",
    options: {
      playfair: {
        name: "Modern Vogue",
        fontFamily: "'Playfair Display', serif",
        class:
          "italic font-bold text-xl md:text-2xl tracking-normal leading-relaxed",
      },
      garamond: {
        name: "Classic Poem",
        fontFamily: "'Cormorant Garamond', serif",
        class:
          "italic font-semibold text-2xl md:text-3xl tracking-normal leading-relaxed",
      },
      fraunces: {
        name: "Bold Editorial",
        fontFamily: "'Fraunces', serif",
        class:
          "italic font-bold text-xl md:text-2xl tracking-tight leading-normal",
      },
    },
  },
  display: {
    label: "Street Display",
    options: {
      anton: {
        name: "Heavy Impact",
        fontFamily: "'Anton', sans-serif",
        class:
          "uppercase font-normal text-2xl md:text-3xl tracking-wide leading-none",
      },
      syne: {
        name: "Loud Avant",
        fontFamily: "'Syne', sans-serif",
        class:
          "uppercase font-extrabold text-xl md:text-2xl tracking-tighter leading-tight",
      },
      cinzel: {
        name: "Royal Brass",
        fontFamily: "'Cinzel', serif",
        class:
          "uppercase font-bold text-lg md:text-xl tracking-widest leading-snug",
      },
    },
  },
  mono: {
    label: "Raw Mono",
    options: {
      space: {
        name: "Tech Matrix",
        fontFamily: "'Space Mono', monospace",
        class:
          "font-bold text-base md:text-lg tracking-tight leading-relaxed normal-case",
      },
      dm: {
        name: "Clean Terminal",
        fontFamily: "'DM Mono', monospace",
        class:
          "font-medium text-base md:text-lg tracking-normal leading-relaxed normal-case",
      },
      major: {
        name: "Glitch Abstract",
        fontFamily: "'Major Mono Display', monospace",
        class:
          "font-normal text-sm md:text-base tracking-normal leading-loose uppercase",
      },
    },
  },
};

const App = () => {
  const [activeThemeKey, setActiveThemeKey] = useState("stark");

  // Font Selector Engine Multi-tier State
  const [activeCategory, setActiveCategory] = useState("serif");
  const [activeFontKey, setActiveFontKey] = useState("playfair");

  const cardRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [verseData, setVerseData] = useState(null);
  const [nextVerse, setNextVerse] = useState(null);

  const selectedTheme = CARD_THEMES[activeThemeKey];
  // Safe lookup across the flat nested font registry
  const selectedFont =
    FONT_VAULT[activeCategory]?.options[activeFontKey] ||
    FONT_VAULT.serif.options.playfair;

const handleNextVerse = async () => {
  if (loading) return;

  setLoading(true);

  try {
    if (nextVerse) {
      setVerseData(nextVerse);

      // clear cache immediately
      setNextVerse(null);

      // fetch another verse in background
      preloadNextVerse();
    } else {
      const response = await axios.get(
        "https://daily-insight-server.onrender.com/api/verses/random"
      );

      setVerseData(response.data);

      // preload next one
      preloadNextVerse();
    }
  } catch (error) {
    console.error(error);
    message.error("Failed to stream next verse from vault.");
  } finally {
    setLoading(false);
  }
};

  const preloadNextVerse = async () => {
  try {
    const response = await axios.get(
      "https://daily-insight-server.onrender.com/api/verses/random"
    );

    setNextVerse(response.data);
  } catch (error) {
    console.log("Preload failed");
  }
};

// console.log(setVerseData)

  useEffect(() => {
    handleNextVerse();
  }, []);

  const handleThemeChange = (themeKey) => {
    const targetTheme = CARD_THEMES[themeKey];
    if (targetTheme.isLocked) {
      Modal.confirm({
        title: `🔑 Unlock ${targetTheme.name} Style`,
        content:
          "Watch a quick 15-second sponsored vibe check or pay ₦100 to instantly unlock this premium status card theme.",
        okText: "Watch Video Ad",
        cancelText: "Cancel",
        onOk: () => {
          message.success(`${targetTheme.name} Theme unlocked! 🎉`);
          targetTheme.isLocked = false;
          setActiveThemeKey(themeKey);
        },
      });
    } else {
      setActiveThemeKey(themeKey);
    }
  };

  const handleCategoryChange = (catKey) => {
    setActiveCategory(catKey);
    // Auto-select the first available font variant inside that collection
    const firstFontKey = Object.keys(FONT_VAULT[catKey].options)[0];
    setActiveFontKey(firstFontKey);
  };

  const handleSaveCard = () => {
    if (cardRef.current === null || !verseData) return;
    message.loading({ content: "Generating image...", key: "dl", duration: 1 });

    toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `DailyInsight-${verseData.fullBookName || verseData.book}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch(() =>
        message.error({
          content: "Image capture engine initialization failed.",
          key: "dl",
        }),
      );
  };

  return (
    <ConfigProvider
      theme={{ algorithm: theme.darkAlgorithm, token: { borderRadius: 0 } }}
    >
      <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-between antialiased selection:bg-white selection:text-black">
        {/* HEADER */}
        <header className="border-b border-[#161616] bg-black px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white text-black px-2 py-0.5 font-mono text-xs font-black">
              DI
            </div>
            <span className="font-mono tracking-[0.25em] capitalize text-xs font-bold text-neutral-300">
              Daily Insight
            </span>
          </div>
          <Button
            type="text"
            icon={<SlidersHorizontal className="w-4 h-4 text-neutral-400" />}
          />
        </header>

        {/* MAIN CONTROLLER WORKSPACE */}
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-6 max-w-md mx-auto w-full">
          {/* THE CARD DESIGN CANVAS */}
          <div className="w-full relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              {loading && !verseData ? (
                <div
                  key="loader"
                  className="font-mono text-xs tracking-widest text-neutral-500 animate-pulse"
                >
                  STREAMING VIBE VAULT...
                </div>
              ) : verseData ? (
                <motion.div
                  key={`${verseData._id}-${activeThemeKey}-${activeFontKey}`}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="w-full"
                >
                  <div
                    ref={cardRef}
                    className={`w-full border-2 p-6 flex flex-col justify-between relative select-none overflow-hidden transition-all duration-500 ${selectedTheme.bg} ${selectedTheme.border} ${selectedTheme.text} ${selectedTheme.ring}`}
                  >
                    {/* The Grid Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                    {/* Header & Content */}
                    <div className="z-10 relative">
                      <div className="flex justify-between items-center mb-6">
                        <span className="font-mono text-[13px] tracking-[0.2em] opacity-60 font-bold uppercase">
                          {verseData.fullBookName} {verseData.chapter}:
                          {verseData.verse}
                        </span>
                      </div>

                      <h2 className="text-sm leading-relaxed mb-6 font-sans opacity-90">
                        "{verseData.officialPidgin}"
                      </h2>

                      <div
                        className={`border-l-5 p-3 ${selectedTheme.accentBg} ${selectedTheme.border}`}
                      >
                        <p
                          className={`mb-8 z-10 relative ${selectedFont.class}`}
                          style={{ fontFamily: selectedFont.fontFamily }}
                        >
                          {verseData.streetVibe}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-4 z-10 relative">
                      <span className="text-[9px] font-mono opacity-30 tracking-widest uppercase">
                        Digital Scripture
                      </span>
                      <span className="text-[10px] font-mono tracking-widest font-black opacity-60">
                        vibebox.app
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div key="error" className="font-mono text-xs text-red-500">
                  Could not initialize scripture canvas context.
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* CARD SKIN CONTROLLER */}
          <div className="w-full mt-3">
            <span className="block font-mono text-[10px] tracking-wider text-neutral-500 mb-2 uppercase">
              Select Card Skin
            </span>
            <div className="flex gap-2">
              {Object.keys(CARD_THEMES).map((key) => {
                const item = CARD_THEMES[key];
                return (
                  <button
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    className={`flex-1 py-2 font-mono text-xs border transition-all flex items-center justify-center gap-1.5 
                      ${activeThemeKey === key ? "border-white bg-white text-black font-bold" : "border-[#1c1c1c] bg-[#0c0c0c] text-neutral-400"}`}
                  >
                    {item.isLocked && <Lock className="w-3 h-3" />}
                    {item.name.split(" ")[1]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FONT COLLECTION ROUTER */}
          <div className="w-full mt-4">
            <span className="block font-mono text-[10px] tracking-wider text-neutral-500 mb-2 uppercase">
              Select Font Profile
            </span>
            <div className="flex gap-2 border-b border-[#141414] pb-2">
              {Object.keys(FONT_VAULT).map((catKey) => (
                <button
                  key={catKey}
                  onClick={() => handleCategoryChange(catKey)}
                  className={`flex-1 py-1 text-xs font-mono transition-colors border-none bg-transparent text-left
                    ${activeCategory === catKey ? "text-white font-bold underline underline-offset-4 decoration-2" : "text-neutral-500"}`}
                >
                  {FONT_VAULT[catKey].label}
                </button>
              ))}
            </div>

            {/* NESTED DYNAMIC VARIANT TRACK */}
            <div className="flex gap-2 mt-2">
              {Object.keys(FONT_VAULT[activeCategory].options).map(
                (fontKey) => {
                  const variant = FONT_VAULT[activeCategory].options[fontKey];
                  return (
                    <button
                      key={fontKey}
                      onClick={() => setActiveFontKey(fontKey)}
                      className={`flex-1 py-2 font-mono text-[10px] border transition-all flex items-center justify-center gap-1
                      ${activeFontKey === fontKey ? "border-white bg-white text-black font-bold" : "border-[#1c1c1c] bg-[#0c0c0c] text-neutral-400"}`}
                    >
                      <Type className="w-3 h-3" />
                      {variant.name}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* ACTION PIPELINE FOOTER */}
          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            <Button
              type="default"
              size="large"
              className="h-12 border-[#1c1c1c] bg-[#0c0c0c] text-neutral-300"
              onClick={handleSaveCard}
              disabled={loading || !verseData}
              icon={<Download className="w-4 h-4" />}
            >
              Save Card
            </Button>
            <Button
              type="primary"
              size="large"
              className="h-12 bg-white text-black font-semibold border-none hover:bg-neutral-200"
              onClick={handleNextVerse}
              loading={loading}
              icon={
                !loading && (
                  <Sparkles className="w-4 h-4 text-black fill-black" />
                )
              }
            >
              {loading ? "E dey load..." : "Next Vibe"}
            </Button>
          </div>
        </main>

        {/* BOTTOM AD PLACEHOLDER */}
        <footer className="w-full bg-black border-t border-[#121212] p-4 flex justify-center items-center">
          <div className="w-full max-w-sm h-12 bg-[#050505] border border-[#141414] flex items-center justify-center">
            <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
              Sponsored Ad Unit Space
            </span>
          </div>
        </footer>
      </div>
    </ConfigProvider>
  );
};

export default App;
