CREATE TABLE `alias_words` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`word` text NOT NULL,
	`category` text DEFAULT 'general',
	`difficulty` text DEFAULT 'medium',
	`language` text DEFAULT 'en',
	`taboo_words` text
);
--> statement-breakpoint
CREATE TABLE `flashcard_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`source_text` text NOT NULL,
	`category` text DEFAULT 'general',
	`language` text DEFAULT 'en',
	`card_count` integer DEFAULT 0,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`flashcard_set_id` integer NOT NULL,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`difficulty` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `game_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_mode` text NOT NULL,
	`set_id` integer,
	`score` integer NOT NULL,
	`total_questions` integer NOT NULL,
	`time_spent` integer,
	`streak` integer DEFAULT 0,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quiz_set_id` integer NOT NULL,
	`question` text NOT NULL,
	`options` text NOT NULL,
	`correct_index` integer NOT NULL,
	`explanation` text
);
--> statement-breakpoint
CREATE TABLE `quiz_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`source_text` text NOT NULL,
	`category` text DEFAULT 'general',
	`language` text DEFAULT 'en',
	`question_count` integer DEFAULT 0,
	`created_at` text NOT NULL
);
