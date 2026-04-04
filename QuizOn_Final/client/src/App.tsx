import { Switch, Route, Router, Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Home, PlusCircle, BookOpen, Settings } from "lucide-react";
import { t } from "@/lib/i18n";

import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import CreatePage from "@/pages/create";
import LibraryPage from "@/pages/library";
import QuizGamePage from "@/pages/quiz-game";
import FlashcardGamePage from "@/pages/flashcard-game";
import AliasGamePage from "@/pages/alias-game";
import SpeedRoundPage from "@/pages/speed-round";
import SettingsPage from "@/pages/settings";

const NAV_ITEMS = [
  { path: "/", label: "nav.home", icon: Home },
  { path: "/create", label: "nav.create", icon: PlusCircle },
  { path: "/library", label: "nav.library", icon: BookOpen },
  { path: "/settings", label: "nav.settings", icon: Settings },
];

function BottomNav() {
  const [location] = useHashLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/5 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = location === path;
          return (
            <Link
              key={path}
              href={path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-[#ffb694]"
                  : "text-[#dbe3ed]/50 hover:text-[#dbe3ed]/80"
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? "bg-[#ffb694]/10" : ""
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? "text-[#ffb694]" : ""}
                />
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-[#ffb694]/10 blur-sm" />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold tracking-wide uppercase ${
                  isActive ? "text-[#ffb694]" : "text-[#dbe3ed]/40"
                }`}
              >
                {t(label)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function AppRouter() {
  return (
    <>
      <div className="pb-20 min-h-screen quizon-gradient-bg">
        <AnimatePresence mode="wait">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/create" component={CreatePage} />
            <Route path="/library" component={LibraryPage} />
            <Route path="/quiz/:id" component={QuizGamePage} />
            <Route path="/flashcards/:id" component={FlashcardGamePage} />
            <Route path="/alias" component={AliasGamePage} />
            <Route path="/speed/:id" component={SpeedRoundPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={NotFound} />
          </Switch>
        </AnimatePresence>
      </div>
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
