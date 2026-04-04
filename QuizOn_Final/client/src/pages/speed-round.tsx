import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Zap, ArrowLeft, Home, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { t } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import type { QuizSet, QuizQuestion } from "@shared/schema";

type GameState = "loading" | "ready" | "playing" | "results";

interface QuizData extends QuizSet {
  questions: QuizQuestion[];
}

const TOTAL_TIME = 60;

export default function SpeedRoundPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const [gameState, setGameState] = useState<GameState>("loading");
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [questionTimes, setQuestionTimes] = useState<number[]>([]);
  const [questionStart, setQuestionStart] = useState(Date.now());

  const { data: quizData } = useQuery<QuizData>({
    queryKey: [`/api/quiz-sets/${id}`],
    enabled: !!id,
  });

  const saveMutation = useMutation({
    mutationFn: (data: object) => apiRequest("POST", "/api/scores", data),
  });

  const questions = quizData?.questions ?? [];

  useEffect(() => {
    if (quizData && gameState === "loading") {
      setGameState("ready");
    }
  }, [quizData, gameState]);

  // Countdown timer during play
  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  function startGame() {
    setGameState("playing");
    setCurrentQ(0);
    setScore(0);
    setTimeLeft(TOTAL_TIME);
    setCorrectCount(0);
    setWrongCount(0);
    setFeedback(null);
    setQuestionTimes([]);
    setQuestionStart(Date.now());
  }

  function endGame() {
    setGameState("results");
    saveMutation.mutate({
      gameMode: "speedround",
      setId: Number(id),
      score,
      totalQuestions: correctCount + wrongCount,
      timeSpent: TOTAL_TIME - timeLeft,
      streak: correctCount,
    });
  }

  function handleAnswer(optionIdx: number) {
    if (gameState !== "playing" || feedback !== null) return;

    const question = questions[currentQ];
    const correct = optionIdx === question.correctIndex;
    const timeUsed = (Date.now() - questionStart) / 1000;

    setFeedback(correct ? "correct" : "wrong");
    setQuestionTimes((prev) => [...prev, timeUsed]);

    if (correct) {
      setScore((s) => s + 1);
      setCorrectCount((c) => c + 1);
    } else {
      setWrongCount((w) => w + 1);
    }

    // Quick flash then next
    setTimeout(() => {
      setFeedback(null);
      const next = currentQ + 1;
      if (next >= questions.length) {
        // Loop questions for speed round
        setCurrentQ(0);
      } else {
        setCurrentQ(next);
      }
      setQuestionStart(Date.now());
    }, 400);
  }

  if (!quizData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#fbbf24]/30 border-t-[#fbbf24] animate-spin mb-4" />
        <p className="text-[#dbe3ed]/40 text-sm">{t("common.loading")}</p>
      </div>
    );
  }

  // Ready Screen
  if (gameState === "ready") {
    if (questions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <Zap size={40} className="text-[#fbbf24]/30 mb-4" />
          <p className="text-[#dbe3ed]/40">{t("speed.noContent")}</p>
          <button onClick={() => navigate("/library")} className="mt-4 text-[#ffb694] text-sm">
            ← {t("common.back")}
          </button>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-12 pb-6 max-w-lg mx-auto"
      >
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/library")}
            className="w-9 h-9 rounded-xl bg-[#141c23] border border-white/5 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-[#dbe3ed]/60" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#dbe3ed]">{t("speed.title")}</h1>
            <p className="text-[#dbe3ed]/40 text-sm">{quizData.title}</p>
          </div>
        </div>

        <div className="bg-[#141c23] border border-white/5 rounded-2xl p-6 mb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#fbbf24]/10 flex items-center justify-center mx-auto mb-4">
            <Zap size={32} className="text-[#fbbf24]" />
          </div>
          <h2 className="text-lg font-bold text-[#dbe3ed] mb-1">{t("speed.subtitle")}</h2>
          <p className="text-[#dbe3ed]/40 text-sm">{questions.length} questions available</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Time Limit", value: "60s", color: "#fbbf24" },
            { label: "Questions", value: `${questions.length}`, color: "#ffb694" },
            { label: "Scoring", value: "+1 each", color: "#22c55e" },
            { label: "No Waiting", value: "Instant", color: "#a78bfa" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#141c23] border border-white/5 rounded-xl p-3 text-center">
              <p className="font-bold" style={{ color }}>{value}</p>
              <p className="text-[10px] text-[#dbe3ed]/30 uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={startGame}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#0c141b] font-bold text-base flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(251,191,36,0.4)]"
        >
          <Zap size={20} strokeWidth={2.5} />
          {t("speed.start")}
        </motion.button>
      </motion.div>
    );
  }

  // Results Screen
  if (gameState === "results") {
    const avgTime = questionTimes.length > 0
      ? (questionTimes.reduce((s, t) => s + t, 0) / questionTimes.length).toFixed(1)
      : "0";
    const total = correctCount + wrongCount;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pt-12 pb-6 max-w-lg mx-auto"
      >
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-[#fbbf24]/10 flex items-center justify-center mx-auto mb-4 shadow-[0_8px_30px_rgba(251,191,36,0.3)]">
            <Zap size={36} className="text-[#fbbf24]" />
          </div>
          <h1 className="text-2xl font-bold text-[#dbe3ed] mb-1">{t("speed.results")}</h1>
          <p className="text-[#dbe3ed]/40 text-sm">{quizData.title}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#141c23] border border-white/5 rounded-2xl p-6 mb-4"
        >
          <div className="text-center mb-4">
            <span className="text-5xl font-bold text-[#fbbf24]">{score}</span>
            <p className="text-[#dbe3ed]/40 text-sm mt-1">points</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t("speed.answeredCorrect"), value: correctCount, color: "#22c55e" },
              { label: t("speed.answeredWrong"), value: wrongCount, color: "#ef4444" },
              { label: t("speed.avgTime"), value: `${avgTime}s`, color: "#fbbf24" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#0c141b]/50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold" style={{ color }}>{value}</p>
                <p className="text-[9px] text-[#dbe3ed]/30 font-medium uppercase tracking-wider mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/")}
            className="flex-1 py-3.5 rounded-xl border border-white/10 text-[#dbe3ed]/60 font-bold text-sm flex items-center justify-center gap-2"
          >
            <Home size={16} />
            {t("quiz.backToHome")}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={startGame}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#0c141b] font-bold text-sm flex items-center justify-center gap-2 shadow-[0_6px_16px_-4px_rgba(251,191,36,0.3)]"
          >
            <RotateCcw size={16} />
            {t("quiz.playAgain")}
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Playing Screen
  const question = questions[currentQ];
  if (!question) return null;

  const options = (() => {
    try {
      return JSON.parse(question.options) as string[];
    } catch {
      return [];
    }
  })();

  const timerPct = (timeLeft / TOTAL_TIME) * 100;
  const timerColor = timeLeft <= 10 ? "#ef4444" : timeLeft <= 20 ? "#fbbf24" : "#22c55e";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 pt-8 pb-6 max-w-lg mx-auto flex flex-col"
    >
      {/* Timer Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs font-bold mb-1.5">
          <div className="flex items-center gap-1.5">
            <Zap size={12} className="text-[#fbbf24]" />
            <span className="text-[#dbe3ed]">{score}</span>
          </div>
          <span style={{ color: timerColor }} className="tabular-nums text-sm">
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

      {/* Stats Row */}
      <div className="flex gap-2 mb-4">
        <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-2.5 py-1">
          <CheckCircle size={11} className="text-green-400" />
          <span className="text-green-300 text-xs font-bold">{correctCount}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1">
          <XCircle size={11} className="text-red-400" />
          <span className="text-red-300 text-xs font-bold">{wrongCount}</span>
        </div>
        <div className="ml-auto text-xs text-[#dbe3ed]/30 font-medium self-center">
          Q{currentQ + 1}/{questions.length}
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`sq-${currentQ}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="flex-1 flex flex-col"
        >
          <div
            className={`bg-[#141c23] border rounded-2xl p-4 mb-4 transition-colors duration-300 ${
              feedback === "correct"
                ? "border-green-500/40 bg-green-500/10"
                : feedback === "wrong"
                ? "border-red-500/30 bg-red-500/8"
                : "border-white/5"
            }`}
          >
            <p className="text-[#dbe3ed] font-semibold text-sm leading-relaxed">
              {question.question}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {options.map((option, idx) => {
              let style = "bg-[#141c23] border-white/5 text-[#dbe3ed]";
              if (feedback !== null) {
                if (idx === question.correctIndex) {
                  style = "bg-green-500/15 border-green-500/40 text-green-300";
                } else {
                  style = "bg-[#141c23] border-white/5 text-[#dbe3ed]/25";
                }
              }
              return (
                <motion.button
                  key={idx}
                  whileTap={feedback === null ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(idx)}
                  disabled={feedback !== null}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-3 transition-colors ${style}`}
                >
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      feedback !== null && idx === question.correctIndex
                        ? "bg-green-500/30 text-green-300"
                        : "bg-white/5 text-[#dbe3ed]/40"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
