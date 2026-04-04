import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Quiz sets - a collection of questions generated from text
export const quizSets = sqliteTable("quiz_sets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  sourceText: text("source_text").notNull(),
  category: text("category").default("general"),
  language: text("language").default("en"),
  questionCount: integer("question_count").default(0),
  createdAt: text("created_at").notNull(),
});

export const insertQuizSetSchema = createInsertSchema(quizSets).omit({ id: true });
export type InsertQuizSet = z.infer<typeof insertQuizSetSchema>;
export type QuizSet = typeof quizSets.$inferSelect;

// Individual quiz questions
export const quizQuestions = sqliteTable("quiz_questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quizSetId: integer("quiz_set_id").notNull(),
  question: text("question").notNull(),
  options: text("options").notNull(), // JSON array of 4 options
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation"),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({ id: true });
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;

// Flashcard sets
export const flashcardSets = sqliteTable("flashcard_sets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  sourceText: text("source_text").notNull(),
  category: text("category").default("general"),
  language: text("language").default("en"),
  cardCount: integer("card_count").default(0),
  createdAt: text("created_at").notNull(),
});

export const insertFlashcardSetSchema = createInsertSchema(flashcardSets).omit({ id: true });
export type InsertFlashcardSet = z.infer<typeof insertFlashcardSetSchema>;
export type FlashcardSet = typeof flashcardSets.$inferSelect;

// Individual flashcards
export const flashcards = sqliteTable("flashcards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  flashcardSetId: integer("flashcard_set_id").notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  difficulty: integer("difficulty").default(0), // 0=new, 1=easy, 2=medium, 3=hard
});

export const insertFlashcardSchema = createInsertSchema(flashcards).omit({ id: true });
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Flashcard = typeof flashcards.$inferSelect;

// Game scores / history
export const gameScores = sqliteTable("game_scores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gameMode: text("game_mode").notNull(), // quiz, flashcard, alias, speedround
  setId: integer("set_id"),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timeSpent: integer("time_spent"), // seconds
  streak: integer("streak").default(0),
  createdAt: text("created_at").notNull(),
});

export const insertGameScoreSchema = createInsertSchema(gameScores).omit({ id: true });
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type GameScore = typeof gameScores.$inferSelect;

// Alias words (pre-loaded + generated)
export const aliasWords = sqliteTable("alias_words", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  word: text("word").notNull(),
  category: text("category").default("general"),
  difficulty: text("difficulty").default("medium"), // easy, medium, hard
  language: text("language").default("en"),
  tabooWords: text("taboo_words"), // JSON array of words you can't say
});

export const insertAliasWordSchema = createInsertSchema(aliasWords).omit({ id: true });
export type InsertAliasWord = z.infer<typeof insertAliasWordSchema>;
export type AliasWord = typeof aliasWords.$inferSelect;
