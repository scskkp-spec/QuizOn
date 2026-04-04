import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Users, ArrowLeft, CheckCircle, SkipForward, Trophy, RotateCcw } from "lucide-react";
import { t } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import type { AliasWord } from "@shared/schema";

type GamePhase = "setup" | "countdown" | "playing" | "results";

const ROUND_TIME = 60;
const CATEGORIES = [
  { value: "all", label: t("alias.allCategories") },
  { value: "general", label: "General" },
  { value: "science", label: "Science" },
  { value: "food", label: "Food" },
  { value: "sports", label: "Sports" },
];

export default function AliasGamePage() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [wordIdx, setWordIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [skips, setSkips] = useState(0);
  const [guessedWords, setGuessedWords] = useState<string[]>([]);
  const [skippedWords, setSkippedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "skip" | null>(null);

  const { data: words = [] } = useQuery<AliasWord[]>({
    queryKey: ["/api/alias-words", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === "all"
        ? "/api/alias-words"
        : `/api/alias-words?category=${selectedCategory}`;
      const res = await fetch(`.${url}`);
      if (!res.ok) throw new Error("Failed to load words");
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: object) => apiRequest("POST", "/api/scores", data),
  });

  // Countdown timer
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("playing");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, phase]);

  // Game timer
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      endRound();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, phase]);

  function startGame() {
    setPhase("countdown");
    setCountdown(3);
    setTimeLeft(ROUND_TIME);
    setWordIdx(0);
    setScore(0);
    setSkips(0);
    setGuessedWords([]);
    setSkippedWords([]);
    setFeedback(null);
  }

  function endRound() {
    setPhase("results");
    saveMutation.mutate({
      gameMode: "alias",
      score,
      totalQuestions: guessedWords.length + skippedWords.length,
      timeSpent: ROUND_TIME - timeLeft,
      streak: score,
    });
  }

  function handleCorrect() {
    const word = currentWord?.word ?? "";
    setGuessedWords((prev) => [...prev, word]);
    setScore((s) => s + 1);
    setFeedback("correct");
    setTimeout(() => {
      setFeedback(null);
      setWordIdx((i) => i + 1);
    }, 500);
  }

  function handleSkip() {
    const word = currentWord?.word ?? "";
    setSkippedWords((prev) => [...prev, word]);
    setSkips((s) => s + 1);
    setFeedback("skip");
    setTimeout(() => {
      setFeedback(null);
      setWordIdx((i) => i + 1);
    }, 300);
  }

  const shuffledWords = [...words].sort(() => Math.random() - 0.5);
  const currentWord = shuffledWords[wordIdx % Math.max(shuffledWords.length, 1)];
  const tabooWords = (() => {
    try {
      return JSON.parse(currentWord?.tabooWords ?? "[]") as string[];
    } catch {
      return [];
    }
  })();

  const timerPct = (timeLeft / ROUND_TIME) * 100;
  const timerColor = timeLeft <= 10 ? "#ef4444" : timeLeft <= 20 ? "#fbbf24" : "#ffb694";

  // SETUP SCREEN
  if (phase === "setup") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-12 pb-6 max-w-lg mx-auto"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#a78bfa]/10 border border-[#a78bfa]/20 flex items-center justify-center">
            <Users size={24} className="text-[#a78bfa]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#dbe3ed]">{t("alias.title")}</h1>
            <p className="text-[#dbe3ed]/40 text-sm">{t("alias.subtitle")}</p>
          </div>
        </div>

        {/* Category Picker */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#dbe3ed]/40 mb-3">
            {t("alias.category")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  selectedCategory === cat.value
                    ? "bg-[#a78bfa]/15 border-[#a78bfa]/40 text-[#a78bfa]"
                    : "bg-[#141c23] border-white/5 text-[#dbe3ed]/50 hover:border-white/10"
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="bg-[#141c23] border border-white/5 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-[#dbe3ed] mb-3 text-sm">How to play</h3>
          <ul className="space-y-2">
            {[
              "One player describes the word without saying it",
              "Cannot use the taboo words listed below",
              "Team guesses the word — tap 'Got it!' when correct",
              "60 seconds per round — get as many as possible!",
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-xs text-[#dbe3ed]/40">
                <span className="text-[#a78bfa] mt-0.5">•</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={startGame}
          disabled={words.length === 0}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#7c3aed] text-white font-bold text-base shadow-[0_8px_20px_-6px_rgba(167,139,250,0.4)] disabled:opacity-40"
        >
          {t("alias.start")}
        </motion.button>
      </motion.div>
    );
  }

  // COUNTDOWN SCREEN
  if (phase === "countdown") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center"
          >
            {countdown > 0 ? (
              <>
                <p className="text-sm text-[#dbe3ed]/40 font-bold uppercase tracking-widest mb-2">
                  {t("alias.ready")}
                </p>
                <span className="text-9xl font-bold text-[#a78bfa] neon-glow-blue">
                  {countdown}
                </span>
              </>
            ) : (
              <span className="text-7xl font-bold text-[#ffb694] neon-glow-orange">
                {t("alias.go")}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // RESULTS SCREEN
  if (phase === "results") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pt-12 pb-6 max-w-lg mx-auto"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 180 }}
            className="w-20 h-20 rounded-full bg-[#a78bfa]/10 border border-[#a78bfa]/20 flex items-center justify-center mx-auto mb-4"
          >
            <Trophy size={36} className="text-[#a78bfa]" />
          </motion.div>
          <h1 className="text-2xl font-bold text-[#dbe3ed] mb-1">{t("alias.title")}</h1>
        </div>

        <div className="bg-[#141c23] border border-white/5 rounded-2xl p-6 mb-4">
          <div className="text-center mb-4">
            <span className="text-5xl font-bold text-[#a78bfa]">{score}</span>
            <p className="text-[#dbe3ed]/40 text-sm mt-1">{t("alias.wordsGuessed")}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0c141b]/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{guessedWords.length}</p>
              <p className="text-[9px] text-[#dbe3ed]/30 uppercase tracking-wider mt-0.5">Correct</p>
            </div>
            <div className="bg-[#0c141b]/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{skippedWords.length}</p>
              <p className="text-[9px] text-[#dbe3ed]/30 uppercase tracking-wider mt-0.5">Skipped</p>
            </div>
          </div>
        </div>

        {guessedWords.length > 0 && (
          <div className="bg-[#141c23] border border-white/5 rounded-xl p-4 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#dbe3ed]/30 mb-2">
              Words Guessed
            </p>
            <div className="flex flex-wrap gap-2">
              {guessedWords.map((w) => (
                <span key={w} className="text-xs px-2.5 py-1 rounded-lg bg-green-500/10 text-green-300 border border-green-500/20">
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/")}
            className="flex-1 py-3.5 rounded-xl border border-white/10 text-[#dbe3ed]/60 font-bold text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Home
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={startGame}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#7c3aed] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_6px_16px_-4px_rgba(167,139,250,0.4)]"
          >
            <RotateCcw size={16} />
            Play Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // PLAYING SCREEN
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 pt-10 pb-6 max-w-lg mx-auto flex flex-col"
    >
      {/* Timer Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-[#dbe3ed]/40 font-medium mb-1.5">
          <span>{t("alias.round")} 1</span>
          <span style={{ color: timerColor }} className="font-bold tabular-nums">
            {timeLeft}s
          </span>
        </div>
        <div className="bg-[#141c23] rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
          />
        </div>
      </div>

      {/* Score */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 bg-[#141c23] border border-white/5 rounded-xl px-3 py-1.5">
          <CheckCircle size={13} className="text-green-400" />
          <span className="font-bold text-[#dbe3ed] text-sm">{score}</span>
        </div>
        <div className="flex items-center gap-2 bg-[#141c23] border border-white/5 rounded-xl px-3 py-1.5">
          <SkipForward size={13} className="text-[#dbe3ed]/30" />
          <span className="font-bold text-[#dbe3ed]/40 text-sm">{skips}</span>
        </div>
      </div>

      {/* Word Card */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={wordIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`relative bg-[#141c23] border rounded-2xl p-8 text-center mb-4 transition-colors ${
              feedback === "correct"
                ? "border-green-500/40 bg-green-500/10"
                : feedback === "skip"
                ? "border-red-500/20 bg-red-500/5"
                : "border-white/5"
            }`}
          >
            <p className="text-4xl font-bold text-[#dbe3ed] mb-6 neon-glow-orange">
              {currentWord?.word ?? "..."}
            </p>

            {tabooWords.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#dbe3ed]/25 mb-2">
                  {t("alias.tabooWords")}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {tabooWords.map((w) => (
                    <span
                      key={w}
                      className="text-sm px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 line-through"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleSkip}
            className="flex-1 py-4 rounded-xl bg-[#1a242d] border border-white/5 text-[#dbe3ed]/50 font-bold text-base flex items-center justify-center gap-2 hover:border-white/10"
          >
            <SkipForward size={18} />
            {t("alias.skip")}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleCorrect}
            className="flex-1 py-4 rounded-xl bg-green-500/15 border border-green-500/30 text-green-300 font-bold text-base flex items-center justify-center gap-2 hover:bg-green-500/20"
          >
            <CheckCircle size={18} />
            {t("alias.correct")}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
