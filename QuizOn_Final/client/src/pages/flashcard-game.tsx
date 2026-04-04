import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Home,
  Flame,
} from "lucide-react";
import { t } from "@/lib/i18n";
import type { FlashcardSet, Flashcard } from "@shared/schema";

interface FlashcardData extends FlashcardSet {
  cards: Flashcard[];
}

const DIFFICULTY_COLORS = {
  easy: { bg: "bg-green-500/15 border-green-500/30", text: "text-green-300", active: "bg-green-500" },
  medium: { bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-300", active: "bg-amber-500" },
  hard: { bg: "bg-red-500/15 border-red-500/30", text: "text-red-300", active: "bg-red-500" },
};

export default function FlashcardGamePage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [streak, setStreak] = useState(0);
  const [viewed, setViewed] = useState<Set<number>>(new Set());
  const [ratings, setRatings] = useState<Record<number, "easy" | "medium" | "hard">>({});
  const [direction, setDirection] = useState<"left" | "right">("right");

  const { data: flashData } = useQuery<FlashcardData>({
    queryKey: [`/api/flashcard-sets/${id}`],
    enabled: !!id,
  });

  const cards = flashData?.cards ?? [];
  const currentCard = cards[currentIdx];
  const progress = viewed.size / (cards.length || 1);

  useEffect(() => {
    if (currentCard) {
      setViewed((prev) => new Set([...prev, currentCard.id]));
    }
  }, [currentCard]);

  function handleFlip() {
    setIsFlipped((f) => !f);
  }

  function goNext() {
    if (currentIdx < cards.length - 1) {
      setDirection("right");
      setCurrentIdx((i) => i + 1);
      setIsFlipped(false);
    }
  }

  function goPrev() {
    if (currentIdx > 0) {
      setDirection("left");
      setCurrentIdx((i) => i - 1);
      setIsFlipped(false);
    }
  }

  function handleDifficulty(diff: "easy" | "medium" | "hard") {
    if (!currentCard) return;
    setRatings((r) => ({ ...r, [currentCard.id]: diff }));
    if (diff === "easy") setStreak((s) => s + 1);
    else setStreak(0);
    goNext();
  }

  function handleRestart() {
    setCurrentIdx(0);
    setIsFlipped(false);
    setStreak(0);
    setViewed(new Set());
    setRatings({});
  }

  if (!flashData || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#0162cf]/30 border-t-[#0162cf] animate-spin mb-4" />
        <p className="text-[#dbe3ed]/40 text-sm">{t("common.loading")}</p>
      </div>
    );
  }

  const isDone = currentIdx === cards.length - 1 && isFlipped;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 pt-10 pb-6 max-w-lg mx-auto flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate("/library")}
          className="w-9 h-9 rounded-xl bg-[#141c23] border border-white/5 flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-[#dbe3ed]/60" />
        </button>

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#dbe3ed]/30">
            {t("flash.title")}
          </p>
          <p className="text-sm font-semibold text-[#dbe3ed] truncate max-w-[160px]">
            {flashData.title}
          </p>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5 bg-[#141c23] border border-white/5 rounded-xl px-3 py-1.5">
          <Flame size={14} className={streak > 0 ? "text-[#fbbf24]" : "text-[#dbe3ed]/20"} />
          <span className={`font-bold text-sm tabular-nums ${streak > 0 ? "text-[#fbbf24]" : "text-[#dbe3ed]/30"}`}>
            {streak}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#141c23] rounded-full h-1.5 mb-1 overflow-hidden">
        <motion.div
          className="h-full bg-[#0162cf] rounded-full"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[#dbe3ed]/25 font-medium mb-6">
        <span>{t("flash.progress")}</span>
        <span>{currentIdx + 1} / {cards.length}</span>
      </div>

      {/* Flip Card */}
      <div className="flex-1 flex flex-col items-center justify-center mb-6">
        <div
          className="perspective-1000 w-full cursor-pointer"
          style={{ height: "280px" }}
          onClick={handleFlip}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`card-${currentIdx}`}
              initial={{ opacity: 0, x: direction === "right" ? 60 : -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === "right" ? -60 : 60 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              <div className="relative w-full h-full preserve-3d" style={{ transition: "transform 0.5s", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
                {/* Front */}
                <div className="absolute inset-0 backface-hidden">
                  <div className="w-full h-full bg-[#141c23] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_-8px_rgba(1,98,207,0.2)]">
                    <div className="w-10 h-10 rounded-xl bg-[#0162cf]/10 flex items-center justify-center mb-4">
                      <span className="text-[#0162cf] text-lg">Q</span>
                    </div>
                    <p className="text-[#dbe3ed] font-semibold text-base leading-relaxed">
                      {currentCard?.front}
                    </p>
                    <p className="text-[#dbe3ed]/30 text-xs mt-4 flex items-center gap-1">
                      <RotateCcw size={11} />
                      {t("flash.tapToFlip")}
                    </p>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180">
                  <div className="w-full h-full bg-gradient-to-br from-[#0162cf]/15 to-[#141c23] border border-[#0162cf]/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_-8px_rgba(1,98,207,0.3)]">
                    <div className="w-10 h-10 rounded-xl bg-[#0162cf]/20 flex items-center justify-center mb-4">
                      <span className="text-[#0162cf] text-lg font-bold">A</span>
                    </div>
                    <p className="text-[#dbe3ed] font-semibold text-base leading-relaxed">
                      {currentCard?.back}
                    </p>
                    {currentCard?.difficulty != null && currentCard.difficulty > 0 && (
                      <span className="mt-3 text-[10px] px-2 py-1 rounded-full bg-white/5 text-[#dbe3ed]/40">
                        {currentCard.difficulty === 1 ? "Easy" : currentCard.difficulty === 2 ? "Medium" : "Hard"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Difficulty Rating (shown after flip) */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="w-full mt-4"
            >
              <p className="text-center text-xs text-[#dbe3ed]/30 font-medium mb-3">
                How well did you know this?
              </p>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as const).map((diff) => (
                  <motion.button
                    key={diff}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDifficulty(diff)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${DIFFICULTY_COLORS[diff].bg} ${DIFFICULTY_COLORS[diff].text}`}
                  >
                    {t(`flash.${diff}`)}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="w-12 h-12 rounded-xl bg-[#141c23] border border-white/5 flex items-center justify-center disabled:opacity-30 hover:border-white/10"
        >
          <ChevronLeft size={20} className="text-[#dbe3ed]/60" />
        </motion.button>

        {/* Dot indicators */}
        <div className="flex gap-1.5 overflow-hidden max-w-[180px]">
          {cards.slice(Math.max(0, currentIdx - 3), Math.min(cards.length, currentIdx + 4)).map((_, relIdx) => {
            const absIdx = Math.max(0, currentIdx - 3) + relIdx;
            return (
              <div
                key={absIdx}
                className={`rounded-full transition-all duration-200 ${
                  absIdx === currentIdx
                    ? "w-4 h-2 bg-[#0162cf]"
                    : viewed.has(cards[absIdx]?.id)
                    ? "w-2 h-2 bg-[#0162cf]/40"
                    : "w-2 h-2 bg-white/10"
                }`}
              />
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={goNext}
          disabled={currentIdx === cards.length - 1}
          className="w-12 h-12 rounded-xl bg-[#141c23] border border-white/5 flex items-center justify-center disabled:opacity-30 hover:border-white/10"
        >
          <ChevronRight size={20} className="text-[#dbe3ed]/60" />
        </motion.button>
      </div>

      {/* Finish / Restart */}
      {currentIdx === cards.length - 1 && isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex gap-3"
        >
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/")}
            className="flex-1 py-3 rounded-xl border border-white/10 text-[#dbe3ed]/60 font-bold text-sm flex items-center justify-center gap-2"
          >
            <Home size={15} />
            Home
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleRestart}
            className="flex-1 py-3 rounded-xl metallic-gradient text-[#0c141b] font-bold text-sm flex items-center justify-center gap-2 shadow-[0_6px_16px_-4px_rgba(240,123,63,0.3)]"
          >
            <RotateCcw size={15} />
            Restart
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
