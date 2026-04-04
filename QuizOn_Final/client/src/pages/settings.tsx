import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Info,
  Brain,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { t, setLanguage, getLanguage, getAvailableLanguages } from "@/lib/i18n";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" },
  }),
};

export default function SettingsPage() {
  const [currentLang, setCurrentLang] = useState(getLanguage());
  const [, forceRender] = useState(0);

  const languages = getAvailableLanguages();

  function handleSetLanguage(code: string) {
    setLanguage(code);
    setCurrentLang(code);
    forceRender((n) => n + 1);
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
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl metallic-gradient flex items-center justify-center shadow-[0_4px_12px_rgba(240,123,63,0.35)]">
            <Brain size={20} className="text-[#0c141b]" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#dbe3ed]">{t("settings.title")}</h1>
            <p className="text-[#dbe3ed]/40 text-xs">{t("app.name")} · {t("settings.version")}</p>
          </div>
        </div>
      </motion.div>

      {/* Language Section */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={14} className="text-[#ffb694]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#dbe3ed]/40">
            {t("settings.language")}
          </h2>
        </div>
        <div className="bg-[#141c23] border border-white/5 rounded-2xl overflow-hidden">
          {languages.map((lang, i) => (
            <motion.button
              key={lang.code}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSetLanguage(lang.code)}
              className={`w-full flex items-center gap-4 px-4 py-4 transition-colors ${
                i < languages.length - 1 ? "border-b border-white/5" : ""
              } ${
                currentLang === lang.code
                  ? "bg-[#ffb694]/5"
                  : "hover:bg-white/3"
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1 text-left">
                <p className={`font-semibold text-sm ${currentLang === lang.code ? "text-[#ffb694]" : "text-[#dbe3ed]"}`}>
                  {lang.name}
                </p>
                <p className="text-[10px] text-[#dbe3ed]/30 uppercase tracking-wider">{lang.code.toUpperCase()}</p>
              </div>
              {currentLang === lang.code && (
                <CheckCircle2 size={18} className="text-[#ffb694]" />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* About Section */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Info size={14} className="text-[#0162cf]" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#dbe3ed]/40">
            {t("settings.about")}
          </h2>
        </div>
        <div className="bg-[#141c23] border border-white/5 rounded-2xl overflow-hidden">
          {[
            { label: "Version", value: "1.0.0" },
            { label: "Build", value: "2025.1" },
            { label: "License", value: "MIT" },
          ].map((item, i) => (
            <div
              key={item.label}
              className={`flex items-center justify-between px-4 py-3.5 ${
                i < 2 ? "border-b border-white/5" : ""
              }`}
            >
              <span className="text-sm text-[#dbe3ed]/60">{item.label}</span>
              <span className="text-sm font-semibold text-[#dbe3ed]/40">{item.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Branding */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-[#ffb694]/8 to-[#f07b3f]/4 border border-[#ffb694]/10 rounded-2xl p-6 text-center"
      >
        <div className="w-14 h-14 rounded-2xl metallic-gradient flex items-center justify-center mx-auto mb-4 shadow-[0_8px_24px_rgba(240,123,63,0.4)]">
          <Brain size={28} className="text-[#0c141b]" strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-bold text-[#dbe3ed] mb-1 neon-glow-orange">{t("app.name")}</h2>
        <p className="text-[#dbe3ed]/30 text-xs leading-relaxed">
          {t("app.tagline")}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-4">
          <Sparkles size={12} className="text-[#ffb694]/50" />
          <span className="text-[10px] text-[#ffb694]/40 font-medium uppercase tracking-widest">
            Powered by AI
          </span>
          <Sparkles size={12} className="text-[#ffb694]/50" />
        </div>
      </motion.div>
    </motion.div>
  );
}
