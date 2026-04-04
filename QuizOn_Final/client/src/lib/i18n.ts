const translations: Record<string, Record<string, string>> = {
  en: {
    // App
    "app.name": "QuizOn",
    "app.tagline": "Sharpen your mind with high-octane trivia challenges",
    "app.start": "GET STARTED",
    
    // Navigation
    "nav.home": "Home",
    "nav.create": "Create",
    "nav.library": "Library",
    "nav.play": "Play",
    "nav.settings": "Settings",
    
    // Home
    "home.welcome": "Welcome back",
    "home.quickplay": "Quick Play",
    "home.recent": "Recent",
    "home.stats": "Your Stats",
    "home.totalQuizzes": "Total Quizzes",
    "home.totalCards": "Total Flashcards",
    "home.gamesPlayed": "Games Played",
    "home.bestStreak": "Best Streak",
    "home.dailyChallenge": "Daily Challenge",
    "home.dailyChallengeDesc": "Test your knowledge with today's top pick!",
    "home.playNow": "Play Now",
    
    // Create
    "create.title": "Create New Content",
    "create.subtitle": "Paste text or upload a document to generate quizzes and flashcards",
    "create.pasteText": "Paste your text here",
    "create.placeholder": "Paste lecture notes, textbook content, or any study material...",
    "create.uploadFile": "Upload File",
    "create.uploadHint": "Supports .txt, .docx, images (.jpg, .png)",
    "create.takePhoto": "Take Photo",
    "create.generating": "Generating...",
    "create.generateQuiz": "Generate Quiz",
    "create.generateFlashcards": "Generate Flashcards",
    "create.generateBoth": "Generate Both",
    "create.setTitle": "Title (optional)",
    "create.category": "Category",
    "create.minChars": "Minimum 50 characters required",
    "create.success": "Content generated successfully!",

    // Quiz
    "quiz.title": "Quiz Mode",
    "quiz.question": "Question",
    "quiz.of": "of",
    "quiz.score": "Score",
    "quiz.timeLeft": "Time Left",
    "quiz.correct": "Correct!",
    "quiz.wrong": "Wrong!",
    "quiz.next": "Next",
    "quiz.finish": "Finish",
    "quiz.results": "Results",
    "quiz.playAgain": "Play Again",
    "quiz.backToHome": "Back to Home",
    "quiz.noQuizzes": "No quizzes yet. Create one first!",

    // Flashcards
    "flash.title": "Flashcards",
    "flash.card": "Card",
    "flash.tapToFlip": "Tap to reveal answer",
    "flash.easy": "Easy",
    "flash.medium": "Medium",
    "flash.hard": "Hard",
    "flash.streak": "Streak",
    "flash.progress": "Progress",
    "flash.noCards": "No flashcards yet. Create some first!",

    // Alias
    "alias.title": "Alias",
    "alias.subtitle": "Explain the word without using the taboo words!",
    "alias.start": "Start Round",
    "alias.skip": "Skip",
    "alias.correct": "Got it!",
    "alias.timeUp": "Time's up!",
    "alias.round": "Round",
    "alias.wordsGuessed": "Words Guessed",
    "alias.tabooWords": "Don't say",
    "alias.ready": "Ready?",
    "alias.go": "GO!",
    "alias.category": "Category",
    "alias.allCategories": "All Categories",
    
    // Speed Round
    "speed.title": "Speed Round",
    "speed.subtitle": "Answer as many as you can in 60 seconds!",
    "speed.start": "Start",
    "speed.score": "Score",
    "speed.timeLeft": "Time Left",
    "speed.results": "Final Score",
    "speed.answeredCorrect": "Correct Answers",
    "speed.answeredWrong": "Wrong Answers",
    "speed.avgTime": "Avg. Time per Question",
    "speed.noContent": "Create a quiz first to play Speed Round!",

    // Library
    "library.title": "Library",
    "library.quizzes": "Quizzes",
    "library.flashcards": "Flashcards",
    "library.empty": "Nothing here yet",
    "library.emptyHint": "Create quizzes or flashcards from the Create tab",
    "library.questions": "questions",
    "library.cards": "cards",
    "library.delete": "Delete",
    "library.play": "Play",
    "library.study": "Study",

    // Settings
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.about": "About QuizOn",
    "settings.version": "Version 1.0.0",
    "settings.theme": "Theme",

    // Game modes overview
    "modes.quiz": "Quiz",
    "modes.quizDesc": "Multiple choice with timer and scoring",
    "modes.flashcards": "Flashcards",
    "modes.flashcardsDesc": "Flip cards to learn and memorize",
    "modes.alias": "Alias",
    "modes.aliasDesc": "Explain the word — party game style",
    "modes.speed": "Speed Round",
    "modes.speedDesc": "Race the clock — 60 seconds to answer all",

    // Common
    "common.back": "Back",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.ok": "OK",
    "common.loading": "Loading...",
    "common.error": "Something went wrong",
    "common.seconds": "seconds",
  },
  no: {
    // App
    "app.name": "QuizOn",
    "app.tagline": "Skjerp hjernen med høyoktane trivia-utfordringer",
    "app.start": "KOM I GANG",

    // Navigation
    "nav.home": "Hjem",
    "nav.create": "Lag ny",
    "nav.library": "Bibliotek",
    "nav.play": "Spill",
    "nav.settings": "Innstillinger",

    // Home
    "home.welcome": "Velkommen tilbake",
    "home.quickplay": "Hurtigspill",
    "home.recent": "Nylig",
    "home.stats": "Din statistikk",
    "home.totalQuizzes": "Totalt quizer",
    "home.totalCards": "Totalt flashcards",
    "home.gamesPlayed": "Spill spilt",
    "home.bestStreak": "Beste streak",
    "home.dailyChallenge": "Dagens utfordring",
    "home.dailyChallengeDesc": "Test kunnskapen din med dagens utvalgte!",
    "home.playNow": "Spill nå",
    
    // Create
    "create.title": "Lag nytt innhold",
    "create.subtitle": "Lim inn tekst eller last opp et dokument for å generere quizer og flashcards",
    "create.pasteText": "Lim inn teksten din her",
    "create.placeholder": "Lim inn forelesningsnotater, fagstoff, eller annet studiemateriale...",
    "create.uploadFile": "Last opp fil",
    "create.uploadHint": "Støtter .txt, .docx, bilder (.jpg, .png)",
    "create.takePhoto": "Ta bilde",
    "create.generating": "Genererer...",
    "create.generateQuiz": "Lag quiz",
    "create.generateFlashcards": "Lag flashcards",
    "create.generateBoth": "Lag begge",
    "create.setTitle": "Tittel (valgfri)",
    "create.category": "Kategori",
    "create.minChars": "Minimum 50 tegn kreves",
    "create.success": "Innhold generert!",

    // Quiz
    "quiz.title": "Quiz-modus",
    "quiz.question": "Spørsmål",
    "quiz.of": "av",
    "quiz.score": "Poeng",
    "quiz.timeLeft": "Tid igjen",
    "quiz.correct": "Riktig!",
    "quiz.wrong": "Feil!",
    "quiz.next": "Neste",
    "quiz.finish": "Fullfør",
    "quiz.results": "Resultater",
    "quiz.playAgain": "Spill igjen",
    "quiz.backToHome": "Tilbake til hjem",
    "quiz.noQuizzes": "Ingen quizer enda. Lag en først!",

    // Flashcards
    "flash.title": "Flashcards",
    "flash.card": "Kort",
    "flash.tapToFlip": "Trykk for å vise svar",
    "flash.easy": "Lett",
    "flash.medium": "Middels",
    "flash.hard": "Vanskelig",
    "flash.streak": "Streak",
    "flash.progress": "Fremgang",
    "flash.noCards": "Ingen flashcards enda. Lag noen først!",

    // Alias
    "alias.title": "Alias",
    "alias.subtitle": "Forklar ordet uten å bruke forbudte ord!",
    "alias.start": "Start runde",
    "alias.skip": "Hopp over",
    "alias.correct": "Riktig!",
    "alias.timeUp": "Tiden er ute!",
    "alias.round": "Runde",
    "alias.wordsGuessed": "Ord gjettet",
    "alias.tabooWords": "Ikke si",
    "alias.ready": "Klar?",
    "alias.go": "KJØR!",
    "alias.category": "Kategori",
    "alias.allCategories": "Alle kategorier",

    // Speed Round
    "speed.title": "Speed Round",
    "speed.subtitle": "Svar på flest mulig på 60 sekunder!",
    "speed.start": "Start",
    "speed.score": "Poeng",
    "speed.timeLeft": "Tid igjen",
    "speed.results": "Sluttpoeng",
    "speed.answeredCorrect": "Riktige svar",
    "speed.answeredWrong": "Feil svar",
    "speed.avgTime": "Snitt tid per spørsmål",
    "speed.noContent": "Lag en quiz først for å spille Speed Round!",

    // Library
    "library.title": "Bibliotek",
    "library.quizzes": "Quizer",
    "library.flashcards": "Flashcards",
    "library.empty": "Ingenting her enda",
    "library.emptyHint": "Lag quizer eller flashcards fra Lag ny-fanen",
    "library.questions": "spørsmål",
    "library.cards": "kort",
    "library.delete": "Slett",
    "library.play": "Spill",
    "library.study": "Studer",

    // Settings
    "settings.title": "Innstillinger",
    "settings.language": "Språk",
    "settings.about": "Om QuizOn",
    "settings.version": "Versjon 1.0.0",
    "settings.theme": "Tema",

    // Game modes
    "modes.quiz": "Quiz",
    "modes.quizDesc": "Flervalg med timer og poeng",
    "modes.flashcards": "Flashcards",
    "modes.flashcardsDesc": "Snu kort for å lære og huske",
    "modes.alias": "Alias",
    "modes.aliasDesc": "Forklar ordet — festspill-modus",
    "modes.speed": "Speed Round",
    "modes.speedDesc": "Kappløp med klokka — 60 sekunder",

    // Common
    "common.back": "Tilbake",
    "common.cancel": "Avbryt",
    "common.save": "Lagre",
    "common.ok": "OK",
    "common.loading": "Laster...",
    "common.error": "Noe gikk galt",
    "common.seconds": "sekunder",
  }
};

let currentLanguage = "en";

export function setLanguage(lang: string) {
  currentLanguage = lang;
}

export function getLanguage(): string {
  return currentLanguage;
}

export function t(key: string): string {
  return translations[currentLanguage]?.[key] || translations.en[key] || key;
}

export function getAvailableLanguages() {
  return [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "no", name: "Norsk", flag: "🇳🇴" },
  ];
}
