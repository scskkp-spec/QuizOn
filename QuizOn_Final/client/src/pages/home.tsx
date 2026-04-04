import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Brain,
  Layers,
  Users,
  Zap,
  ChevronRight,
  Trophy,
  BookOpen,
  BarChart2,
  Flame,
} from "lucide-react";
import { t } from "@/lib/i18n";
import type { QuizSet, FlashcardSet, GameScore } from "@shared/schema";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

const GAME_MODES = [
  {
    key: "quiz",
    icon: Brain,
    color: "#ffb694",
    bgColor: "rgba(255,182,148,0.08)",
    borderColor: "rgba(255,182,148,0.15)",
    href: "/library",
    gradient: "from-[#ffb694]/20 to-[#f07b3f]/10",
  },
  {
    key: "flashcards",
    icon: Layers,
    color: "#0162cf",
    bgColor: "rgba(1,98,207,0.08)",
    borderColor: "rgba(1,98,207,0.15)",
    href: "/library",
    gradient: "from-[#0162cf]/20 to-[#0162cf]/05",
  },
  {
    key: "alias",
    icon: Users,
    color: "#a78bfa",
    bgColor: "rgba(167,139,250,0.08)",
    borderColor: "rgba(167,139,250,0.15)",
    href: "/alias",
    gradient: "from-[#a78bfa]/20 to-[#a78bfa]/05",
  },
  {
    key: "speed",
    icon: Zap,
    color: "#fbbf24",
    bgColor: "rgba(251,191,36,0.08)",
    borderColor: "rgba(251,191,36,0.15)",
    href: "/library",
    gradient: "from-[#fbbf24]/20 to-[#fbbf24]/05",
  },
];

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

export default function HomePage() {
  const { data: quizSets = [] } = useQuery<QuizSet[]>({
    queryKey: ["/api/quiz-sets"],
  });
  const { data: flashcardSets = [] } = useQuery<FlashcardSet[]>({
    queryKey: ["/api/flashcard-sets"],
  });
  const { data: topScores = [] } = useQuery<GameScore[]>({
    queryKey: ["/api/scores/top"],
  });

  const bestStreak = topScores.reduce(
    (max, s) => Math.max(max, s.streak ?? 0),
    0
  );
  const gamesPlayed = topScores.length;

  // Combine and sort recent items
  const recentItems = [
    ...quizSets.map((q) => ({ ...q, type: "quiz" as const })),
    ...flashcardSets.map((f) => ({ ...f, type: "flash" as const })),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 pt-12 pb-6 max-w-lg mx-auto"
    >
      {/* Hero */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(240,123,63,0.3)]">
            <img src="/logo.png" alt="QuizOn Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[#dbe3ed]/50 text-sm font-medium">
              {t("home.welcome")} 👋
            </p>
            <h1 className="text-2xl font-bold text-[#dbe3ed] leading-tight neon-glow-orange">
              {t("app.name")}
            </h1>
          </div>
        </div>
        <p className="text-[#dbe3ed]/40 text-sm mt-1">{t("app.tagline")}</p>
      </motion.div>

      {/* Daily Challenge */}
      {quizSets.length > 0 && (
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <Link href={`/quiz/${quizSets[0].id}`}>
            <div className="relative overflow-hidden bg-[#141c23] border border-[#ffb694]/30 rounded-2xl p-5 cursor-pointer group">
              <div className="absolute top-0 right-0 p-3">
                <div className="bg-[#ffb694]/10 text-[#ffb694] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-[#ffb694]/20">
                  {t("home.dailyChallenge")}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ffb694]/10 flex items-center justify-center text-[#ffb694] group-hover:scale-110 transition-transform">
                  <Trophy size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#dbe3ed] font-bold text-base mb-0.5">
                    {quizSets[0].title}
                  </h3>
                  <p className="text-[#dbe3ed]/40 text-xs">
                    {t("home.dailyChallengeDesc")}
                  </p>
                </div>
                <div className="bg-[#ffb694] text-[#0c141b] px-3 py-1.5 rounded-lg text-xs font-bold shadow-[0_4px_12px_rgba(240,123,63,0.3)] group-active:scale-95 transition-all">
                  {t("home.playNow")}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Stats Row */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-4 gap-2 mb-8"
      >
        {[
          {
            label: t("home.totalQuizzes"),
            value: quizSets.length,
            icon: Brain,
            color: "#ffb694",
          },
          {
            label: t("home.totalCards"),
            value: flashcardSets.length,
            icon: Layers,
            color: "#0162cf",
          },
          {
            label: t("home.gamesPlayed"),
            value: gamesPlayed,
            icon: BarChart2,
            color: "#a78bfa",
          },
          {
            label: t("home.bestStreak"),
            value: bestStreak,
            icon: Flame,
            color: "#fbbf24",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-[#141c23] border border-white/5 rounded-xl p-3 flex flex-col items-center gap-1"
          >
            <Icon size={14} style={{ color }} />
            <span className="text-lg font-bold text-[#dbe3ed] leading-none">
              {value}
            </span>
            <span
              className="text-[9px] font-medium text-center leading-tight"
              style={{ color: `${color}99` }}
            >
              {label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Game Modes */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#dbe3ed]/40 mb-3">
          {t("home.quickplay")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {GAME_MODES.map(
            ({ key, icon: Icon, color, bgColor, borderColor, href, gradient }) => (
              <Link key={key} href={href}>
                <motion.div
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative overflow-hidden bg-gradient-to-br ${gradient} border rounded-2xl p-4 cursor-pointer`}
                  style={{ borderColor }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: bgColor }}
                  >
                    <Icon size={20} style={{ color }} strokeWidth={2} />
                  </div>
                  <h3
                    className="font-bold text-[#dbe3ed] text-sm mb-0.5"
                  >
                    {t(`modes.${key}`)}
                  </h3>
                  <p className="text-[#dbe3ed]/40 text-[11px] leading-tight">
                    {t(`modes.${key}Desc`)}
                  </p>
                  <ChevronRight
                    size={14}
                    className="absolute top-4 right-4 text-[#dbe3ed]/20"
                  />
                </motion.div>
              </Link>
            )
          )}
        </div>
      </motion.div>

      {/* Recent */}
      <motion.div
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#dbe3ed]/40">
            {t("home.recent")}
          </h2>
          <Link href="/library">
            <span className="text-xs text-[#ffb694] font-semibold">
              {t("nav.library")} →
            </span>
          </Link>
        </div>

        {recentItems.length === 0 ? (
          <div className="bg-[#141c23] border border-white/5 rounded-2xl p-8 text-center">
            <BookOpen
              size={32}
              className="text-[#dbe3ed]/20 mx-auto mb-3"
            />
            <p className="text-[#dbe3ed]/40 text-sm">
              {t("library.emptyHint")}
            </p>
            <Link href="/create">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold metallic-gradient text-[#0c141b] shadow-[0_8px_20px_-6px_rgba(240,123,63,0.3)]"
              >
                {t("create.title")}
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentItems.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={
                  item.type === "quiz"
                    ? `/quiz/${item.id}`
                    : `/flashcards/${item.id}`
                }
              >
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#141c23] border border-white/5 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-white/10 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.type === "quiz"
                        ? "bg-[#ffb694]/10"
                        : "bg-[#0162cf]/10"
                    }`}
                  >
                    {item.type === "quiz" ? (
                      <Brain
                        size={16}
                        className="text-[#ffb694]"
                        strokeWidth={2}
                      />
                    ) : (
                      <Layers
                        size={16}
                        className="text-[#0162cf]"
                        strokeWidth={2}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#dbe3ed] text-sm truncate">
                      {item.title}
                    </p>
                    <p className="text-[#dbe3ed]/40 text-xs">
                      {item.type === "quiz"
                        ? `${(item as QuizSet).questionCount} ${t("library.questions")}`
                        : `${(item as FlashcardSet).cardCount} ${t("library.cards")}`}{" "}
                      · {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-[#dbe3ed]/20 flex-shrink-0" />
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
