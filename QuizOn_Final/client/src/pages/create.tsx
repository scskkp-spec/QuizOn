import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Upload,
  FileText,
  Sparkles,
  Layers,
  Brain,
  CheckCircle2,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "science", label: "Science" },
  { value: "medical", label: "Medical" },
  { value: "history", label: "History" },
  { value: "languages", label: "Languages" },
];

type GeneratingState = "idle" | "extracting" | "generating" | "done";
type GeneratedResult = { type: "quiz" | "flash"; id: number; title: string } | null;

export default function CreatePage() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [fileName, setFileName] = useState("");
  const [genState, setGenState] = useState<GeneratingState>("idle");
  const [result, setResult] = useState<GeneratedResult>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const isLoading = genState === "extracting" || genState === "generating";
  const canGenerate = text.trim().length >= 50 && !isLoading;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setGenState("extracting");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("./api/upload/extract-text", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { text: extracted } = await res.json();
      setText(extracted);
      setGenState("idle");
    } catch (err) {
      toast({ title: t("common.error"), variant: "destructive" });
      setGenState("idle");
    }
  }

  async function handleGenerate(type: "quiz" | "flash") {
    if (!canGenerate) return;

    setGenState("generating");
    setResult(null);

    const endpoint =
      type === "quiz"
        ? "/api/quiz-sets/generate"
        : "/api/flashcard-sets/generate";

    try {
      const res = await apiRequest("POST", endpoint, {
        text: text.trim(),
        title: title.trim() || undefined,
        category,
      });
      const data = await res.json();
      setResult({ type, id: data.id, title: data.title });
      setGenState("done");

      // Invalidate library queries
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-sets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/flashcard-sets"] });
    } catch (err) {
      toast({ title: t("common.error"), variant: "destructive" });
      setGenState("idle");
    }
  }

  function handlePlayResult() {
    if (!result) return;
    if (result.type === "quiz") navigate(`/quiz/${result.id}`);
    else navigate(`/flashcards/${result.id}`);
  }

  function handleReset() {
    setText("");
    setTitle("");
    setFileName("");
    setResult(null);
    setGenState("idle");
  }

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
        <h1 className="text-2xl font-bold text-[#dbe3ed]">{t("create.title")}</h1>
        <p className="text-[#dbe3ed]/40 text-sm mt-1">{t("create.subtitle")}</p>
      </div>

      <AnimatePresence mode="wait">
        {genState === "done" && result ? (
          /* Success State */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-[#141c23] border border-white/5 rounded-2xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 size={32} className="text-green-400" />
            </motion.div>
            <h2 className="text-xl font-bold text-[#dbe3ed] mb-1">
              {t("create.success")}
            </h2>
            <p className="text-[#dbe3ed]/50 text-sm mb-6">
              "{result.title}" —{" "}
              {result.type === "quiz"
                ? t("modes.quiz")
                : t("modes.flashcards")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl border border-white/10 text-[#dbe3ed]/60 font-semibold text-sm hover:border-white/20 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handlePlayResult}
                className="flex-1 py-3 rounded-xl metallic-gradient text-[#0c141b] font-bold text-sm shadow-[0_8px_20px_-6px_rgba(240,123,63,0.3)]"
              >
                {result.type === "quiz" ? t("library.play") : t("library.study")} →
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Create Form */
          <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Text Area */}
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-[#dbe3ed]/40 mb-2 block">
                {t("create.pasteText")}
              </label>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t("create.placeholder")}
                  rows={7}
                  className="w-full bg-[#141c23] border border-white/5 rounded-xl px-4 py-3 text-[#dbe3ed] text-sm resize-none focus:outline-none focus:border-[#ffb694]/30 placeholder-[#dbe3ed]/20 transition-colors"
                />
                {text.length > 0 && (
                  <button
                    onClick={() => setText("")}
                    className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#dbe3ed]/10 flex items-center justify-center hover:bg-[#dbe3ed]/20 transition-colors"
                  >
                    <X size={12} className="text-[#dbe3ed]/60" />
                  </button>
                )}
              </div>
              {text.length > 0 && text.length < 50 && (
                <p className="text-xs text-amber-400 mt-1.5">
                  {t("create.minChars")}
                </p>
              )}
              <p className="text-[10px] text-[#dbe3ed]/20 mt-1 text-right">
                {text.length} chars
              </p>
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.docx,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full py-3 rounded-xl border border-dashed border-[#ffb694]/20 bg-[#ffb694]/5 flex items-center justify-center gap-2 text-sm font-medium text-[#ffb694]/70 hover:border-[#ffb694]/30 hover:bg-[#ffb694]/8 transition-all disabled:opacity-50"
              >
                {genState === "extracting" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t("common.loading")}</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>
                      {fileName
                        ? fileName
                        : t("create.uploadFile")}
                    </span>
                  </>
                )}
              </motion.button>
              <p className="text-[10px] text-[#dbe3ed]/25 mt-1.5 text-center">
                {t("create.uploadHint")}
              </p>
            </div>

            {/* Title Input */}
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-widest text-[#dbe3ed]/40 mb-2 block">
                {t("create.setTitle")}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Study Set"
                className="w-full bg-[#141c23] border border-white/5 rounded-xl px-4 py-3 text-[#dbe3ed] text-sm focus:outline-none focus:border-[#ffb694]/30 placeholder-[#dbe3ed]/20 transition-colors"
              />
            </div>

            {/* Category */}
            <div className="mb-6 relative">
              <label className="text-xs font-bold uppercase tracking-widest text-[#dbe3ed]/40 mb-2 block">
                {t("create.category")}
              </label>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full bg-[#141c23] border border-white/5 rounded-xl px-4 py-3 text-[#dbe3ed] text-sm flex items-center justify-between focus:outline-none focus:border-[#ffb694]/30 transition-colors"
              >
                <span>
                  {CATEGORIES.find((c) => c.value === category)?.label}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-[#dbe3ed]/40 transition-transform ${
                    showCategoryDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {showCategoryDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-[#1a242d] border border-white/10 rounded-xl overflow-hidden z-20 shadow-xl"
                  >
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => {
                          setCategory(cat.value);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-sm text-left transition-colors ${
                          category === cat.value
                            ? "bg-[#ffb694]/10 text-[#ffb694]"
                            : "text-[#dbe3ed] hover:bg-white/5"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Generate Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handleGenerate("quiz")}
                disabled={!canGenerate}
                className="flex-1 py-3.5 rounded-xl metallic-gradient text-[#0c141b] font-bold text-sm shadow-[0_8px_20px_-6px_rgba(240,123,63,0.3)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
              >
                {genState === "generating" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Brain size={16} strokeWidth={2.5} />
                )}
                {genState === "generating"
                  ? t("create.generating")
                  : t("create.generateQuiz")}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handleGenerate("flash")}
                disabled={!canGenerate}
                className="flex-1 py-3.5 rounded-xl bg-[#0162cf]/20 border border-[#0162cf]/30 text-[#0162cf] font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity hover:bg-[#0162cf]/30"
              >
                {genState === "generating" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Layers size={16} strokeWidth={2} />
                )}
                {genState === "generating"
                  ? t("create.generating")
                  : t("create.generateFlashcards")}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips section */}
      {genState === "idle" && text.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-[#141c23]/60 border border-white/5 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[#ffb694]" />
            <span className="text-xs font-bold text-[#dbe3ed]/60 uppercase tracking-widest">
              Tips
            </span>
          </div>
          <ul className="space-y-1.5">
            {[
              "Paste lecture notes, textbook excerpts, or articles",
              "More text = better questions",
              "Works best with factual, structured content",
            ].map((tip) => (
              <li key={tip} className="text-xs text-[#dbe3ed]/30 flex items-start gap-1.5">
                <span className="text-[#ffb694]/50 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}
