import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc } from "drizzle-orm";
import {
  quizSets, quizQuestions, flashcardSets, flashcards,
  gameScores, aliasWords,
  type InsertQuizSet, type QuizSet,
  type InsertQuizQuestion, type QuizQuestion,
  type InsertFlashcardSet, type FlashcardSet,
  type InsertFlashcard, type Flashcard,
  type InsertGameScore, type GameScore,
  type InsertAliasWord, type AliasWord,
} from "@shared/schema";

const sqlite = new Database("quizon.db");
sqlite.pragma("journal_mode = WAL");
export const db = drizzle(sqlite);

export interface IStorage {
  // Quiz Sets
  createQuizSet(data: InsertQuizSet): QuizSet;
  getQuizSets(): QuizSet[];
  getQuizSet(id: number): QuizSet | undefined;
  deleteQuizSet(id: number): void;

  // Quiz Questions
  createQuizQuestion(data: InsertQuizQuestion): QuizQuestion;
  getQuizQuestions(quizSetId: number): QuizQuestion[];

  // Flashcard Sets
  createFlashcardSet(data: InsertFlashcardSet): FlashcardSet;
  getFlashcardSets(): FlashcardSet[];
  getFlashcardSet(id: number): FlashcardSet | undefined;
  deleteFlashcardSet(id: number): void;

  // Flashcards
  createFlashcard(data: InsertFlashcard): Flashcard;
  getFlashcards(flashcardSetId: number): Flashcard[];
  updateFlashcardDifficulty(id: number, difficulty: number): void;

  // Game Scores
  createGameScore(data: InsertGameScore): GameScore;
  getGameScores(gameMode?: string): GameScore[];
  getTopScores(limit?: number): GameScore[];

  // Alias Words
  createAliasWord(data: InsertAliasWord): AliasWord;
  getAliasWords(category?: string, language?: string): AliasWord[];
  seedAliasWords(): void;
}

export class DatabaseStorage implements IStorage {
  createQuizSet(data: InsertQuizSet): QuizSet {
    return db.insert(quizSets).values(data).returning().get();
  }

  getQuizSets(): QuizSet[] {
    return db.select().from(quizSets).orderBy(desc(quizSets.createdAt)).all();
  }

  getQuizSet(id: number): QuizSet | undefined {
    return db.select().from(quizSets).where(eq(quizSets.id, id)).get();
  }

  deleteQuizSet(id: number): void {
    db.delete(quizQuestions).where(eq(quizQuestions.quizSetId, id)).run();
    db.delete(quizSets).where(eq(quizSets.id, id)).run();
  }

  createQuizQuestion(data: InsertQuizQuestion): QuizQuestion {
    return db.insert(quizQuestions).values(data).returning().get();
  }

  getQuizQuestions(quizSetId: number): QuizQuestion[] {
    return db.select().from(quizQuestions).where(eq(quizQuestions.quizSetId, quizSetId)).all();
  }

  createFlashcardSet(data: InsertFlashcardSet): FlashcardSet {
    return db.insert(flashcardSets).values(data).returning().get();
  }

  getFlashcardSets(): FlashcardSet[] {
    return db.select().from(flashcardSets).orderBy(desc(flashcardSets.createdAt)).all();
  }

  getFlashcardSet(id: number): FlashcardSet | undefined {
    return db.select().from(flashcardSets).where(eq(flashcardSets.id, id)).get();
  }

  deleteFlashcardSet(id: number): void {
    db.delete(flashcards).where(eq(flashcards.flashcardSetId, id)).run();
    db.delete(flashcardSets).where(eq(flashcardSets.id, id)).run();
  }

  createFlashcard(data: InsertFlashcard): Flashcard {
    return db.insert(flashcards).values(data).returning().get();
  }

  getFlashcards(flashcardSetId: number): Flashcard[] {
    return db.select().from(flashcards).where(eq(flashcards.flashcardSetId, flashcardSetId)).all();
  }

  updateFlashcardDifficulty(id: number, difficulty: number): void {
    db.update(flashcards).set({ difficulty }).where(eq(flashcards.id, id)).run();
  }

  createGameScore(data: InsertGameScore): GameScore {
    return db.insert(gameScores).values(data).returning().get();
  }

  getGameScores(gameMode?: string): GameScore[] {
    if (gameMode) {
      return db.select().from(gameScores).where(eq(gameScores.gameMode, gameMode)).orderBy(desc(gameScores.createdAt)).all();
    }
    return db.select().from(gameScores).orderBy(desc(gameScores.createdAt)).all();
  }

  getTopScores(limit = 10): GameScore[] {
    return db.select().from(gameScores).orderBy(desc(gameScores.score)).limit(limit).all();
  }

  createAliasWord(data: InsertAliasWord): AliasWord {
    return db.insert(aliasWords).values(data).returning().get();
  }

  getAliasWords(category?: string, language?: string): AliasWord[] {
    let query = db.select().from(aliasWords);
    if (category && language) {
      return query.where(eq(aliasWords.category, category)).all()
        .filter(w => w.language === language);
    }
    if (language) {
      return query.where(eq(aliasWords.language, language)).all();
    }
    return query.all();
  }

  seedAliasWords(): void {
    const existing = db.select().from(aliasWords).limit(1).all();
    if (existing.length > 0) return;

    const words: InsertAliasWord[] = [
      // English - Science
      { word: "Photosynthesis", category: "science", difficulty: "medium", language: "en", tabooWords: JSON.stringify(["sun", "plant", "light", "green", "leaf"]) },
      { word: "Gravity", category: "science", difficulty: "easy", language: "en", tabooWords: JSON.stringify(["fall", "Newton", "apple", "force", "weight"]) },
      { word: "DNA", category: "science", difficulty: "medium", language: "en", tabooWords: JSON.stringify(["gene", "helix", "cell", "code", "genetic"]) },
      { word: "Volcano", category: "science", difficulty: "easy", language: "en", tabooWords: JSON.stringify(["lava", "eruption", "mountain", "hot", "magma"]) },
      { word: "Mitochondria", category: "science", difficulty: "hard", language: "en", tabooWords: JSON.stringify(["cell", "energy", "powerhouse", "ATP", "organelle"]) },
      { word: "Evolution", category: "science", difficulty: "medium", language: "en", tabooWords: JSON.stringify(["Darwin", "species", "adapt", "natural", "selection"]) },
      { word: "Antibiotics", category: "science", difficulty: "medium", language: "en", tabooWords: JSON.stringify(["bacteria", "medicine", "infection", "penicillin", "drug"]) },
      { word: "Ecosystem", category: "science", difficulty: "medium", language: "en", tabooWords: JSON.stringify(["nature", "animals", "plants", "environment", "food chain"]) },
      // English - General
      { word: "Democracy", category: "general", difficulty: "medium", language: "en", tabooWords: JSON.stringify(["vote", "election", "people", "government", "freedom"]) },
      { word: "Internet", category: "general", difficulty: "easy", language: "en", tabooWords: JSON.stringify(["web", "online", "computer", "network", "wifi"]) },
      { word: "Smartphone", category: "general", difficulty: "easy", language: "en", tabooWords: JSON.stringify(["phone", "Apple", "Samsung", "app", "screen"]) },
      { word: "Hospital", category: "general", difficulty: "easy", language: "en", tabooWords: JSON.stringify(["doctor", "nurse", "sick", "patient", "medicine"]) },
      { word: "University", category: "general", difficulty: "easy", language: "en", tabooWords: JSON.stringify(["college", "student", "degree", "professor", "campus"]) },
      { word: "Photography", category: "general", difficulty: "medium", language: "en", tabooWords: JSON.stringify(["camera", "picture", "photo", "lens", "snap"]) },
      { word: "Cryptocurrency", category: "general", difficulty: "hard", language: "en", tabooWords: JSON.stringify(["Bitcoin", "blockchain", "digital", "money", "mining"]) },
      { word: "Olympics", category: "general", difficulty: "easy", language: "en", tabooWords: JSON.stringify(["sport", "gold", "medal", "games", "athlete"]) },
      // English - Medical/Nursing
      { word: "Blood Pressure", category: "medical", difficulty: "easy", language: "en", tabooWords: JSON.stringify(["heart", "systolic", "diastolic", "measure", "high"]) },
      { word: "Stethoscope", category: "medical", difficulty: "medium", language: "en", tabooWords: JSON.stringify(["doctor", "listen", "heart", "chest", "instrument"]) },
      { word: "Vaccination", category: "medical", difficulty: "medium", language: "en", tabooWords: JSON.stringify(["needle", "immune", "disease", "shot", "prevent"]) },
      { word: "Anesthesia", category: "medical", difficulty: "hard", language: "en", tabooWords: JSON.stringify(["sleep", "surgery", "pain", "numb", "unconscious"]) },
      { word: "Diagnosis", category: "medical", difficulty: "medium", language: "en", tabooWords: JSON.stringify(["doctor", "disease", "identify", "patient", "symptoms"]) },
      { word: "Rehabilitation", category: "medical", difficulty: "hard", language: "en", tabooWords: JSON.stringify(["recovery", "therapy", "exercise", "injury", "physical"]) },
      // Norwegian - Science
      { word: "Fotosyntese", category: "science", difficulty: "medium", language: "no", tabooWords: JSON.stringify(["sol", "plante", "lys", "grønn", "blad"]) },
      { word: "Tyngdekraft", category: "science", difficulty: "easy", language: "no", tabooWords: JSON.stringify(["falle", "Newton", "eple", "kraft", "vekt"]) },
      { word: "Mitokondrier", category: "science", difficulty: "hard", language: "no", tabooWords: JSON.stringify(["celle", "energi", "kraftverk", "ATP", "organell"]) },
      { word: "Evolusjon", category: "science", difficulty: "medium", language: "no", tabooWords: JSON.stringify(["Darwin", "art", "tilpasse", "naturlig", "utvalg"]) },
      // Norwegian - General
      { word: "Demokrati", category: "general", difficulty: "medium", language: "no", tabooWords: JSON.stringify(["stemme", "valg", "folk", "regjering", "frihet"]) },
      { word: "Sykehus", category: "general", difficulty: "easy", language: "no", tabooWords: JSON.stringify(["lege", "sykepleier", "syk", "pasient", "medisin"]) },
      { word: "Universitet", category: "general", difficulty: "easy", language: "no", tabooWords: JSON.stringify(["skole", "student", "grad", "professor", "campus"]) },
      // Norwegian - Medical
      { word: "Blodtrykk", category: "medical", difficulty: "easy", language: "no", tabooWords: JSON.stringify(["hjerte", "systolisk", "diastolisk", "måle", "høyt"]) },
      { word: "Stetoskop", category: "medical", difficulty: "medium", language: "no", tabooWords: JSON.stringify(["lege", "lytte", "hjerte", "bryst", "instrument"]) },
      { word: "Vaksinasjon", category: "medical", difficulty: "medium", language: "no", tabooWords: JSON.stringify(["nål", "immunitet", "sykdom", "sprøyte", "forebygge"]) },
      { word: "Diagnose", category: "medical", difficulty: "medium", language: "no", tabooWords: JSON.stringify(["lege", "sykdom", "identifisere", "pasient", "symptomer"]) },
    ];

    for (const word of words) {
      db.insert(aliasWords).values(word).run();
    }
  }
}

export const storage = new DatabaseStorage();
