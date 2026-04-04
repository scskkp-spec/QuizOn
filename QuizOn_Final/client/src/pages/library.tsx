import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Brain,
  Layers,
  Play,
  BookOpen,
  Trash2,
  PlusCircle,
  Calendar,
  Hash,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { QuizSet, FlashcardSet } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function LibraryPage() {
  const [tab, setTab] = useState<"quizzes" | "flashcards">("quizzes");
  const { toast } = useToast();

  const { data: quizSets = [], isLoading: loadingQuizzes } = useQuery<QuizSet[]>({
    queryKey: ["/api/quiz-sets"],
  });
  const { data: flashcardSets = [], isLoading: loadingFlash } = useQuery<FlashcardSet[]>({
    queryKey: ["/api/flashcard-sets"],
  });

  const deleteQuizMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/quiz-sets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-sets"] });
      toast({ title: "Quiz deleted" });
    },
    onError: () => toast({ title: t("common.error"), variant: "destructive" }),
  });

  const deleteFlashMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/flashcard-sets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcard-sets"] });
      toast({ title: "Flashcard set deleted" });
    },
    onError: () => toast({ title: t("common.error"), variant: "destructive" }),
  });

  const isLoading = tab === "quizzes" ? loadingQuizzes : loadingFlash;
  const items = tab === "quizzes" ? quizSets : flashcardSets;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 pt-12 pb-6 max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#dbe3ed]">{t("library.title")}</h1>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-[#141c23] border border-white/5 rounded-xl p-1 mb-6">
        {(["quizzes", "flashcards"] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              tab === tabKey
                ? "bg-[#1a242d] text-[#dbe3ed] shadow-sm"
                : "text-[#dbe3ed]/40 hover:text-[#dbe3ed]/60"
            }`}
          >
            {tabKey === "quizzes" ? (
              <Brain size={15} strokeWidth={2} />
            ) : (
              <Layers size={15} strokeWidth={2} />
            )}
            {t(`library.${tabKey}`)}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
                tab === tabKey
                  ? "bg-[#ffb694]/10 text-[#ffb694]"
                  : "bg-white/5 text-[#dbe3ed]/30"
              }`}
            >
              {tabKey === "quizzes" ? quizSets.length : flashcardSets.length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#141c23] border border-white/5 rounded-xl p-4 animate-pulse"
              >
                <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-[#141c23] border border-white/5 rounded-2xl p-10 text-center"
          >
            <BookOpen size={40} className="text-[#dbe3ed]/15 mx-auto mb-3" />
            <h3 className="text-[#dbe3ed]/60 font-semibold mb-1">
              {t("library.empty")}
            </h3>
            <p className="text-[#dbe3ed]/30 text-sm mb-6">
              {t("library.emptyHint")}
            </p>
            <Link href="/create">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="px-6 py-3 rounded-xl metallic-gradient text-[#0c141b] font-bold text-sm shadow-[0_8px_20px_-6px_rgba(240,123,63,0.3)] flex items-center gap-2 mx-auto"
              >
                <PlusCircle size={16} strokeWidth={2.5} />
                {t("create.title")}
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key={`list-${tab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#141c23] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      tab === "quizzes"
                        ? "bg-[#ffb694]/10"
                        : "bg-[#0162cf]/10"
                    }`}
                  >
                    {tab === "quizzes" ? (
                      <Brain size={18} className="text-[#ffb694]" strokeWidth={2} />
                    ) : (
                      <Layers size={18} className="text-[#0162cf]" strokeWidth={2} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#dbe3ed] text-sm truncate mb-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] text-[#dbe3ed]/30 font-medium">
                      <span className="flex items-center gap-1">
                        <Hash size={10} />
                        {tab === "quizzes"
                          ? `${(item as QuizSet).questionCount} ${t("library.questions")}`
                          : `${(item as FlashcardSet).cardCount} ${t("library.cards")}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(item.createdAt)}
                      </span>
                      {item.category && (
                        <span className="px-1.5 py-0.5 rounded-md bg-white/5 capitalize">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Link
                    href={
                      tab === "quizzes"
                        ? `/quiz/${item.id}`
                        : `/flashcards/${item.id}`
                    }
                    className="flex-1"
                  >
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      className="w-full py-2.5 rounded-xl metallic-gradient text-[#0c141b] font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_12px_-4px_rgba(240,123,63,0.3)]"
                    >
                      <Play size={13} strokeWidth={2.5} />
                      {tab === "quizzes" ? t("library.play") : t("library.study")}
                    </motion.button>
                  </Link>
                  {tab === "quizzes" && (
                    <Link href={`/speed/${item.id}`}>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        className="py-2.5 px-3 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] font-bold text-xs flex items-center gap-1"
                      >
                        ⚡
                      </motion.button>
                    </Link>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      if (tab === "quizzes") deleteQuizMutation.mutate(item.id);
                      else deleteFlashMutation.mutate(item.id);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs flex items-center gap-1 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
