import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Smart text parser that generates quiz questions from input text
function generateQuizQuestions(text: string, count: number = 10): Array<{ question: string; options: string[]; correctIndex: number; explanation: string }> {
  const sentences = text
    .split(/[.!?\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 300);

  if (sentences.length === 0) return [];

  const questions: Array<{ question: string; options: string[]; correctIndex: number; explanation: string }> = [];
  const usedSentences = new Set<number>();

  // Strategy 1: Fill-in-the-blank from key terms
  for (let i = 0; i < sentences.length && questions.length < count; i++) {
    if (usedSentences.has(i)) continue;
    const sentence = sentences[i];

    // Find important words (capitalized, longer than 4 chars, not at start)
    const words = sentence.split(/\s+/);
    const keyWords = words.filter((w, idx) => 
      idx > 0 && w.length > 4 && !['which', 'where', 'there', 'these', 'those', 'about', 'after', 'their', 'would', 'could', 'should', 'being', 'through'].includes(w.toLowerCase())
    );

    if (keyWords.length > 0) {
      const targetWord = keyWords[Math.floor(Math.random() * keyWords.length)];
      const cleanTarget = targetWord.replace(/[,;:]/g, '');
      
      if (cleanTarget.length < 3) continue;

      const blankSentence = sentence.replace(cleanTarget, '_____');
      
      // Generate wrong options from other sentences or transformations
      const wrongOptions = generateWrongOptions(cleanTarget, sentences, i);
      if (wrongOptions.length < 3) continue;

      const options = [cleanTarget, ...wrongOptions.slice(0, 3)];
      const shuffled = shuffleArray(options);

      questions.push({
        question: `Complete the sentence: "${blankSentence}"`,
        options: shuffled,
        correctIndex: shuffled.indexOf(cleanTarget),
        explanation: sentence,
      });
      usedSentences.add(i);
    }
  }

  // Strategy 2: True/False style with modifications
  for (let i = 0; i < sentences.length && questions.length < count; i++) {
    if (usedSentences.has(i)) continue;
    const sentence = sentences[i];

    // Create "Which statement is correct?" questions
    const words = sentence.split(/\s+/);
    if (words.length < 5) continue;

    const modifiedVersions = [
      sentence, // correct
      modifySentence(sentence, 1),
      modifySentence(sentence, 2),
      modifySentence(sentence, 3),
    ].filter(Boolean);

    if (modifiedVersions.length === 4) {
      const shuffled = shuffleArray(modifiedVersions);
      questions.push({
        question: "Which of the following statements is correct?",
        options: shuffled,
        correctIndex: shuffled.indexOf(sentence),
        explanation: `The correct answer is: "${sentence}"`,
      });
      usedSentences.add(i);
    }
  }

  // Strategy 3: Definition-style questions
  for (let i = 0; i < sentences.length && questions.length < count; i++) {
    if (usedSentences.has(i)) continue;
    const sentence = sentences[i];

    // Look for "X is/are Y" patterns
    const isMatch = sentence.match(/^(.+?)\s+(?:is|are|was|were)\s+(.+)/i);
    if (isMatch) {
      const [, subject, definition] = isMatch;
      if (subject.length > 3 && definition.length > 10) {
        const wrongDefs = sentences
          .filter((_, idx) => idx !== i)
          .map(s => {
            const m = s.match(/^.+?\s+(?:is|are|was|were)\s+(.+)/i);
            return m ? m[1] : null;
          })
          .filter(Boolean)
          .slice(0, 3);

        if (wrongDefs.length >= 3) {
          const options = [definition.trim(), ...wrongDefs.map(d => d!.trim())];
          const shuffled = shuffleArray(options);
          questions.push({
            question: `What best describes "${subject.trim()}"?`,
            options: shuffled,
            correctIndex: shuffled.indexOf(definition.trim()),
            explanation: sentence,
          });
          usedSentences.add(i);
        }
      }
    }
  }

  return questions.slice(0, count);
}

function generateFlashcards(text: string, count: number = 15): Array<{ front: string; back: string }> {
  const sentences = text
    .split(/[.!?\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 15 && s.length < 400);

  const cards: Array<{ front: string; back: string }> = [];

  for (const sentence of sentences) {
    if (cards.length >= count) break;

    // Pattern 1: "X is/are Y" → Q: What is X? A: Y
    const isMatch = sentence.match(/^(.+?)\s+(?:is|are|was|were)\s+(.+)/i);
    if (isMatch) {
      const [, subject, definition] = isMatch;
      if (subject.length > 2 && definition.length > 5) {
        const verb = sentence.match(/\s+(is|are|was|were)\s+/i)?.[1] || 'is';
        cards.push({
          front: `What ${verb} ${subject.trim()}?`,
          back: definition.trim(),
        });
        continue;
      }
    }

    // Pattern 2: "X causes/leads to Y" → Q: What does X cause? A: Y
    const causeMatch = sentence.match(/^(.+?)\s+(?:causes?|leads?\s+to|results?\s+in)\s+(.+)/i);
    if (causeMatch) {
      const [, cause, effect] = causeMatch;
      cards.push({
        front: `What does ${cause.trim()} cause?`,
        back: effect.trim(),
      });
      continue;
    }

    // Pattern 3: Sentences with "because" → Why question
    const becauseMatch = sentence.match(/^(.+?)\s+because\s+(.+)/i);
    if (becauseMatch) {
      const [, fact, reason] = becauseMatch;
      cards.push({
        front: `Why does ${fact.trim().toLowerCase()}?`,
        back: `Because ${reason.trim()}`,
      });
      continue;
    }

    // Pattern 4: Key term extraction
    const words = sentence.split(/\s+/);
    const keyTerms = words.filter(w => 
      w.length > 5 && w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase()
    );
    
    if (keyTerms.length > 0) {
      const term = keyTerms[0].replace(/[,;:]/g, '');
      cards.push({
        front: `Explain: ${term}`,
        back: sentence,
      });
      continue;
    }

    // Fallback: just make it a recall card
    if (sentence.length > 20) {
      const halfPoint = Math.floor(words.length / 2);
      const firstHalf = words.slice(0, halfPoint).join(' ');
      cards.push({
        front: `Complete: "${firstHalf}..."`,
        back: sentence,
      });
    }
  }

  return cards.slice(0, count);
}

function generateAliasWordsFromText(text: string): Array<{ word: string; tabooWords: string[] }> {
  // Extract key terms and concepts from the text
  const words = text.split(/\s+/);
  const wordFreq = new Map<string, number>();

  for (const word of words) {
    const clean = word.replace(/[^a-zA-ZæøåÆØÅ]/g, '').toLowerCase();
    if (clean.length > 4) {
      wordFreq.set(clean, (wordFreq.get(clean) || 0) + 1);
    }
  }

  // Get most frequent meaningful words
  const sorted = [...wordFreq.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const results: Array<{ word: string; tabooWords: string[] }> = [];
  
  for (const [word] of sorted) {
    // Find related words that appear near this word
    const taboo: string[] = [];
    const regex = new RegExp(`\\b\\w+\\b(?=.{0,30}${word})|(?<=${word}.{0,30})\\b\\w+\\b`, 'gi');
    const matches = text.match(regex) || [];
    
    const nearbyWords = [...new Set(matches.map(m => m.toLowerCase()))]
      .filter(m => m.length > 3 && m !== word)
      .slice(0, 5);
    
    taboo.push(...nearbyWords);

    // Pad with substring matches if needed
    while (taboo.length < 3) {
      taboo.push(word.substring(0, Math.max(3, word.length - 2)));
      break;
    }

    results.push({
      word: word.charAt(0).toUpperCase() + word.slice(1),
      tabooWords: taboo.slice(0, 5),
    });
  }

  return results;
}

function modifySentence(sentence: string, variant: number): string {
  const words = sentence.split(/\s+/);
  if (words.length < 4) return sentence;
  
  const modWords = [...words];
  const negations = ['not', 'never', 'rarely'];
  const swapIndex = Math.min(variant + 1, modWords.length - 1);

  switch (variant) {
    case 1: // Insert negation
      modWords.splice(Math.min(2, modWords.length - 1), 0, negations[0]);
      return modWords.join(' ');
    case 2: // Swap two words
      if (modWords.length > swapIndex + 1) {
        [modWords[swapIndex], modWords[swapIndex + 1]] = [modWords[swapIndex + 1], modWords[swapIndex]];
      }
      return modWords.join(' ');
    case 3: // Replace a key word
      const replaceIdx = Math.floor(modWords.length / 2);
      modWords[replaceIdx] = 'differently';
      return modWords.join(' ');
    default:
      return sentence;
  }
}

function generateWrongOptions(correct: string, sentences: string[], excludeIdx: number): string[] {
  const wrongs: string[] = [];
  
  // Find similar-length words from other sentences
  for (let i = 0; i < sentences.length && wrongs.length < 5; i++) {
    if (i === excludeIdx) continue;
    const words = sentences[i].split(/\s+/);
    const candidates = words.filter(w => 
      w.length > 3 && 
      Math.abs(w.length - correct.length) < 5 &&
      w.toLowerCase() !== correct.toLowerCase() &&
      !wrongs.includes(w)
    );
    if (candidates.length > 0) {
      wrongs.push(candidates[Math.floor(Math.random() * candidates.length)].replace(/[,;:]/g, ''));
    }
  }

  return wrongs;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function registerRoutes(server: Server, app: Express) {
  // Seed alias words on startup
  storage.seedAliasWords();

  // ─── Quiz Sets ─────────────────────────────
  app.get("/api/quiz-sets", (_req, res) => {
    const sets = storage.getQuizSets();
    res.json(sets);
  });

  app.get("/api/quiz-sets/:id", (req, res) => {
    const set = storage.getQuizSet(Number(req.params.id));
    if (!set) return res.status(404).json({ error: "Not found" });
    const questions = storage.getQuizQuestions(set.id);
    res.json({ ...set, questions });
  });

  app.post("/api/quiz-sets/generate", (req, res) => {
    const { text, title, category, language } = req.body;
    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: "Text must be at least 50 characters" });
    }

    const questions = generateQuizQuestions(text);
    if (questions.length === 0) {
      return res.status(400).json({ error: "Could not generate questions from this text. Try providing more detailed content." });
    }

    const set = storage.createQuizSet({
      title: title || "Generated Quiz",
      description: `${questions.length} questions generated from your text`,
      sourceText: text,
      category: category || "general",
      language: language || "en",
      questionCount: questions.length,
      createdAt: new Date().toISOString(),
    });

    for (const q of questions) {
      storage.createQuizQuestion({
        quizSetId: set.id,
        question: q.question,
        options: JSON.stringify(q.options),
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      });
    }

    const savedQuestions = storage.getQuizQuestions(set.id);
    res.json({ ...set, questions: savedQuestions });
  });

  app.delete("/api/quiz-sets/:id", (req, res) => {
    storage.deleteQuizSet(Number(req.params.id));
    res.json({ success: true });
  });

  // ─── Flashcard Sets ────────────────────────
  app.get("/api/flashcard-sets", (_req, res) => {
    const sets = storage.getFlashcardSets();
    res.json(sets);
  });

  app.get("/api/flashcard-sets/:id", (req, res) => {
    const set = storage.getFlashcardSet(Number(req.params.id));
    if (!set) return res.status(404).json({ error: "Not found" });
    const cards = storage.getFlashcards(set.id);
    res.json({ ...set, cards });
  });

  app.post("/api/flashcard-sets/generate", (req, res) => {
    const { text, title, category, language } = req.body;
    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: "Text must be at least 50 characters" });
    }

    const cards = generateFlashcards(text);
    if (cards.length === 0) {
      return res.status(400).json({ error: "Could not generate flashcards. Try different content." });
    }

    const set = storage.createFlashcardSet({
      title: title || "Generated Flashcards",
      description: `${cards.length} cards generated from your text`,
      sourceText: text,
      category: category || "general",
      language: language || "en",
      cardCount: cards.length,
      createdAt: new Date().toISOString(),
    });

    for (const c of cards) {
      storage.createFlashcard({
        flashcardSetId: set.id,
        front: c.front,
        back: c.back,
      });
    }

    const savedCards = storage.getFlashcards(set.id);
    res.json({ ...set, cards: savedCards });
  });

  app.delete("/api/flashcard-sets/:id", (req, res) => {
    storage.deleteFlashcardSet(Number(req.params.id));
    res.json({ success: true });
  });

  app.patch("/api/flashcards/:id/difficulty", (req, res) => {
    const { difficulty } = req.body;
    storage.updateFlashcardDifficulty(Number(req.params.id), difficulty);
    res.json({ success: true });
  });

  // ─── Game Scores ───────────────────────────
  app.post("/api/scores", (req, res) => {
    const score = storage.createGameScore({
      ...req.body,
      createdAt: new Date().toISOString(),
    });
    res.json(score);
  });

  app.get("/api/scores", (req, res) => {
    const gameMode = req.query.mode as string | undefined;
    const scores = storage.getGameScores(gameMode);
    res.json(scores);
  });

  app.get("/api/scores/top", (_req, res) => {
    const scores = storage.getTopScores();
    res.json(scores);
  });

  // ─── Alias Words ───────────────────────────
  app.get("/api/alias-words", (req, res) => {
    const category = req.query.category as string | undefined;
    const language = (req.query.language as string) || "en";
    const words = storage.getAliasWords(category, language);
    res.json(words);
  });

  app.post("/api/alias-words/generate", (req, res) => {
    const { text, language } = req.body;
    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: "Text too short" });
    }

    const words = generateAliasWordsFromText(text);
    const saved: any[] = [];
    for (const w of words) {
      const aliasWord = storage.createAliasWord({
        word: w.word,
        category: "custom",
        difficulty: "medium",
        language: language || "en",
        tabooWords: JSON.stringify(w.tabooWords),
      });
      saved.push(aliasWord);
    }
    res.json(saved);
  });

  // ─── File Upload (Text extraction) ─────────
  app.post("/api/upload/extract-text", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const mimeType = req.file.mimetype;
      let extractedText = "";

      if (mimeType === "text/plain") {
        extractedText = req.file.buffer.toString("utf-8");
      } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // DOCX files
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        extractedText = result.value;
      } else if (mimeType.startsWith("image/")) {
        // For images, we'll use Tesseract.js for OCR
        const Tesseract = await import("tesseract.js");
        const worker = await Tesseract.createWorker("eng+nor");
        const { data: { text } } = await worker.recognize(req.file.buffer);
        await worker.terminate();
        extractedText = text;
      } else {
        return res.status(400).json({ error: "Unsupported file type. Use .txt, .docx, or images (.jpg, .png)" });
      }

      if (!extractedText || extractedText.trim().length < 20) {
        return res.status(400).json({ error: "Could not extract enough text from the file" });
      }

      res.json({ text: extractedText.trim() });
    } catch (error) {
      console.error("Text extraction error:", error);
      res.status(500).json({ error: "Failed to extract text from file" });
    }
  });
}
