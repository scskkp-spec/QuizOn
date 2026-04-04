import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Clock, Trophy, CheckCircle, XCircle, RotateCcw, Home } from "lucide-react";
import { t } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import type { QuizSet, QuizQuestion } from "@shared/schema";

type GameState = "loading" | "playing" | "feedback" | "results";

interface QuizData extends QuizSet {
  questions: QuizQuestion[];
}

const QUESTION_TIME = 30;

function CircleTimer({ timeLeft, total }: { timeLeft: number; total: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / total;
  const strokeDashoffset = circumference * (1 - progress);
  const color = timeLeft <= 5 ? "#ef4444" : timeLeft <= 10 ? "#fbbf24" : "#ffb694";

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg width="56" height="56" className="-rotate-90">
        <circle cx="28" cy="28" r={radius} stroke="#1a242d" strokeWidth="3" fill="none" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s ease" }}
        />
      </svg>
      <div className="absolute flex items-center justify-center">
        <span
          className="text-base font-bold tabular-nums"
          style={{ color }}
        >
          {timeLeft}
        </span>
      </div>
    </div>
  );
}

export default function QuizGamePage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const [gameState, setGameState] = useState<GameState>("loading");
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [results, setResults] = useState<{ correct: boolean; timeUsed: number }[]>([]);
  const [feedbackTimer, setFeedbackTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const { data: quizData } = useQuery<QuizData>({
    queryKey: [`/api/quiz-sets/${id}`],
    enabled: !!id,
  });

  const saveMutation = useMutation({
    mutationFn: (scoreData: object) => apiRequest("POST", "/api/scores", scoreData),
  });

  const questions = quizData?.questions ?? [];

  // Start game once loaded
  useEffect(() => {
    if (quizData && gameState === "loading") {
      setGameState("playing");
    }
  }, [quizData, gameState]);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  const handleTimeout = useCallback(() => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(-1);
    setIsCorrect(false);
    setGameState("feedback");
    setResults((prev) => [...prev, { correct: false, timeUsed: QUESTION_TIME }]);

    const t = setTimeout(() => moveToNext(), 1500);
    setFeedbackTimer(t);
  }, [selectedAnswer]);

  function handleAnswer(optionIdx: number) {
    if (gameState !== "playing" || selectedAnswer !== null) return;

    const question = questions[currentQ];
    const correct = optionIdx === question.correctIndex;
    const timeUsed = QUESTION_TIME - timeLeft;
    const points = correct ? Math.max(10, 10 + Math.floor((QUESTION_TIME - timeUsed) / 3)) : 0;

    setSelectedAnswer(optionIdx);
    setIsCorrect(correct);
    setGameState("feedback");
    setScore((s) => s + points);
    setResults((prev) => [...prev, { correct, timeUsed }]);

    const t = setTimeout(() => moveToNext(), 1400);
    setFeedbackTimer(t);
  }

  function moveToNext() {
    if (feedbackTimer) clearTimeout(feedbackTimer);
    const nextQ = currentQ + 1;
    if (nextQ >= questions.length) {
      finishGame();
    } else {
      setCurrentQ(nextQ);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setTimeLeft(QUESTION_TIME);
      setGameState("playing");
    }
  }

  function finishGame() {
    setGameState("results");
    const correctCount = results.filter((r) => r.correct).length + (isCorrect ? 1 : 0);
    saveMutation.mutate({
      gameMode: "quiz",
      setId: Number(id),
      score,
      totalQuestions: questions.length,
      timeSpent: results.reduce((sum, r) => sum + r.timeUsed, 0),
      streak: correctCount,
    });
  }

  function restartGame() {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setTimeLeft(QUESTION_TIME);
    setResults([]);
    setGameState("playing");
  }

  if (!quizData || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#ffb694]/30 border-t-[#ffb694] animate-spin mb-4" />
        <p className="text-[#dbe3ed]/40 text-sm">{t("common.loading")}</p>
      </div>
    );
  }

  const question = questions[currentQ];
  const correctCount = results.filter((r) => r.correct).length;
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  // Results Screen
  if (gameState === "results") {
    const finalCorrect = results.filter((r) => r.correct).length;
    const finalAccuracy = Math.round((finalCorrect / questions.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen px-4 pt-12 pb-6 max-w-lg mx-auto flex flex-col"
      >
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-full metallic-gradient flex items-center justify-center mx-auto mb-4 shadow-[0_8px_30px_rgba(240,123,63,0.4)]">
            <Trophy size={36} className="text-[#0c141b]" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-[#dbe3ed] mb-1">{t("quiz.results")}</h1>
          <p className="text-[#dbe3ed]/40 text-sm">{quizData.title}</p>
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#141c23] border border-white/5 rounded-2xl p-6 mb-4"
        >
          <div className="text-center mb-4">
            <span className="text-5xl font-bold text-[#ffb694]">{score}</span>
            <span className="text-[#dbe3ed]/40 text-lg ml-2">pts</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Correct", value: `${finalCorrect}/${questions.length}`, color: "#22c55e" },
              { label: "Accuracy", value: `${finalAccuracy}%`, color: "#ffb694" },
              { label: "Avg Time", value: `${Math.round(results.reduce((s, r) => s + r.timeUsed, 0) / results.length)}s`, color: "#0162cf" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center bg-[#0c141b]/50 rounded-xl p-3">
                <p className="text-lg font-bold" style={{ color }}>{value}</p>
                <p className="text-[9px] text-[#dbe3ed]/30 font-medium uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 mt-auto"
        >
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/")}
            className="flex-1 py-3.5 rounded-xl border border-white/10 text-[#dbe3ed]/60 font-bold text-sm flex items-center justify-center gap-2 hover:border-white/20"
          >
            <Home size={16} />
            {t("quiz.backToHome")}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={restartGame}
            className="flex-1 py-3.5 rounded-xl metallic-gradient text-[#0c141b] font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(240,123,63,0.3)]"
          >
            <RotateCcw size={16} />
            {t("quiz.playAgain")}
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Options
  const options = (() => {
    try {
      return JSON.parse(question.options) as string[];
    } catch {
      return [];
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 pt-10 pb-6 max-w-lg mx-auto flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/library")}
          className="w-9 h-9 rounded-xl bg-[#141c23] border border-white/5 flex items-center justify-center hover:border-white/10"
        >
          <ArrowLeft size={18} className="text-[#dbe3ed]/60" />
        </button>

        <div className="flex items-center gap-2 bg-[#141c23] border border-white/5 rounded-xl px-3 py-1.5">
          <Trophy size={13} className="text-[#ffb694]" />
          <span className="font-bold text-[#dbe3ed] text-sm tabular-nums">{score}</span>
        </div>

        <CircleTimer timeLeft={timeLeft} total={QUESTION_TIME} />
      </div>

      {/* Progress Bar */}
      <div className="bg-[#141c23] rounded-full h-1.5 mb-6 overflow-hidden">
        <motion.div
          className="h-full metallic-gradient rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQ) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Counter */}
      <p className="text-xs font-bold uppercase tracking-widest text-[#dbe3ed]/30 mb-3">
        {t("quiz.question")} {currentQ + 1} {t("quiz.of")} {questions.length}
      </p>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`q-${currentQ}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="flex-1"
        >
          <div className="bg-[#141c23] border border-white/5 rounded-2xl p-5 mb-5">
            <p className="text-[#dbe3ed] font-semibold text-base leading-relaxed">
              {question.question}
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2.5">
            {options.map((option, idx) => {
              let style = "bg-[#141c23] border-white/5 text-[#dbe3ed]";
              if (gameState === "feedback") {
                if (idx === question.correctIndex) {
                  style = "bg-green-500/15 border-green-500/40 text-green-300";
                } else if (idx === selectedAnswer && !isCorrect) {
                  style = "bg-red-500/15 border-red-500/40 text-red-300";
                } else {
                  style = "bg-[#141c23] border-white/5 text-[#dbe3ed]/30";
                }
              }

              return (
                <motion.button
                  key={idx}
                  whileTap={gameState === "playing" ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(idx)}
                  disabled={gameState !== "playing"}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 font-medium text-sm flex items-center gap-3 ${style}`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      gameState === "feedback" && idx === question.correctIndex
                        ? "bg-green-500/30 text-green-300"
                        : gameState === "feedback" && idx === selectedAnswer && !isCorrect
                        ? "bg-red-500/30 text-red-300"
                        : "bg-white/5 text-[#dbe3ed]/40"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                  {gameState === "feedback" && idx === question.correctIndex && (
                    <CheckCircle size={16} className="ml-auto text-green-400 flex-shrink-0" />
                  )}
                  {gameState === "feedback" && idx === selectedAnswer && !isCorrect && (
                    <XCircle size={16} className="ml-auto text-red-400 flex-shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback Banner */}
          <AnimatePresence>
            {gameState === "feedback" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 rounded-xl px-4 py-3 text-center font-bold text-sm ${
                  isCorrect
                    ? "bg-green-500/15 text-green-300"
                    : "bg-red-500/15 text-red-300"
                }`}
              >
                {isCorrect ? t("quiz.correct") : t("quiz.wrong")}
                {isCorrect && <span className="ml-2 text-[#dbe3ed]/60 font-normal text-xs">{t("quiz.explanation") || ""}</span>}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
