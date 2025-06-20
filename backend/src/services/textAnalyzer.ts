import { setupLogger } from '../utils/logger';
import * as tf from '@tensorflow/tfjs';
import natural from 'natural';
import { TfIdf } from 'natural';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { factCheckService, FactCheckResult } from './factCheckService';

const logger = setupLogger();

export interface TextAnalysisResult {
  prediction: 'REAL' | 'FAKE';
  confidence: number;
  metrics: {
    processingTime: number;
    reliability: number;
    characterCount: number;
    mlMetrics: {
      modelConfidence: number;
      credibilityScore: number;
      readabilityScore: number;
      sourceTrustworthiness: number;
    };
    analysisMethod: 'USE + Logistic Regression + Fact-Check';
  };
  reasoning: string[];
  suspiciousIndicators: string[];
  factCheck: FactCheckResult | null;
}

class TextAnalyzer {
  private tfidf: any;
  private tokenizer: any;
  private sentimentAnalyzer: any;
  // @ts-ignore
  private useModel: any = null;
  private classifier: any = null;
  private initialized = false;

  constructor() {
    this.tfidf = new TfIdf();
    this.tokenizer = new natural.WordTokenizer();
    this.sentimentAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    
    // Initialize with known fake news patterns
    this.tfidf.addDocument('fake news clickbait shocking unbelievable conspiracy secret scandal');
    this.tfidf.addDocument('verified fact checked confirmed source evidence research study');
  }

  private sensationalistWords = new Set([
    'shocking', 'bombshell', 'you won\'t believe',
    'mind-blowing', 'unbelievable', 'breaking news',
    'explosive', 'secret', 'conspiracy'
  ]);

  private clickbaitPhrases = new Set([
    'doctors hate', 'one weird trick',
    'what happens next will', 'this simple trick',
    'you won\'t believe', 'shocking truth',
    'miracle cure', 'secret they don\'t want you to know'
  ]);

  private credibilityIndicators = new Set([
    'according to research', 'studies show',
    'experts say', 'sources confirm',
    'data indicates', 'evidence suggests',
    'analysis reveals', 'research demonstrates'
  ]);

  private emotiveWords = new Set([
    'outrageous', 'terrifying', 'horrific',
    'devastating', 'miraculous', 'incredible',
    'amazing', 'shocking', 'scandalous'
  ]);

  private calculateTfIdfScore(text: string): number {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    let score = 0;
    
    tokens?.forEach((token: any) => {
      const tfidfScore = this.tfidf.tfidf(token, 0) - this.tfidf.tfidf(token, 1);
      score += tfidfScore;
    });

    return score / (tokens?.length || 1);
  }

  private calculateSentimentScore(text: string): number {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    if (!tokens) return 0;
    const score = this.sentimentAnalyzer.getSentiment(tokens);
    return (score + 5) / 10; // Normalize to 0-1 range
  }

  private calculateCredibilityScore(text: string): number {
    const lowerText = text.toLowerCase();
    let score = 0.5; // Start at neutral

    // Check credibility indicators
    this.credibilityIndicators.forEach(indicator => {
      if (lowerText.includes(indicator)) score += 0.1;
    });

    // Check suspicious patterns
    this.sensationalistWords.forEach(word => {
      if (lowerText.includes(word)) score -= 0.1;
    });

    return Math.max(0, Math.min(1, score));
  }

  private calculateReadabilityScore(text: string): number {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const characters = text.length;
    
    // Simple Flesch-Kincaid readability calculation
    const avgSentenceLength = words / sentences;
    const avgWordLength = characters / words;
    
    // Normalize to 0-100 scale
    return Math.min(100, Math.max(0, 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgWordLength)));
  }

  private calculateSourceTrustworthiness(text: string): number {
    let score = 50; // Base score
    
    // Check for credible source indicators
    this.credibilityIndicators.forEach(indicator => {
      if (text.toLowerCase().includes(indicator)) {
        score += 10;
      }
    });

    return Math.min(100, Math.max(0, score)) / 100;
  }

  private calculateBlendedScore(mlConfidence: number, factCheckResult: FactCheckResult | null): number {
    if (!factCheckResult || !factCheckResult.isVerifiable || factCheckResult.rating === 'No results' || factCheckResult.rating === 'Unrated') {
      return mlConfidence;
    }

    let factCheckModifier = 0;
    const rating = factCheckResult.rating?.toLowerCase();

    if (rating?.includes('false') || rating?.includes('untrue')) {
      factCheckModifier = -0.4; // Strong penalty for false ratings
    } else if (rating?.includes('misleading') || rating?.includes('mixture')) {
      factCheckModifier = -0.2;
    } else if (rating?.includes('true') || rating?.includes('accurate')) {
      factCheckModifier = 0.2;
    }

    // Blend the scores, ensuring it stays within the 0-1 range
    const blendedScore = mlConfidence + factCheckModifier;
    return Math.max(0, Math.min(1, blendedScore));
  }

  async initialize() {
    if (!this.initialized) {
      this.useModel = await use.load();
      this.classifier = tf.sequential();
      this.classifier.add(tf.layers.dense({ inputShape: [512], units: 1, activation: 'sigmoid' }));
      this.classifier.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });
      this.initialized = true;
    }
  }

  async analyzeText(text: string): Promise<TextAnalysisResult> {
    await this.initialize();
    const startTime = Date.now();
    let prediction = 'REAL';
    let mlConfidence = 0.5;
    let reasoning: string[] = [];
    let suspiciousIndicators: string[] = [];
    let factCheckResult: FactCheckResult | null = null;

    let readabilityScore = this.calculateReadabilityScore(text);
    let sourceTrustworthiness = this.calculateSourceTrustworthiness(text);

    try {
      if (this.useModel && this.classifier) {
        const embeddings = await this.useModel.embed([text]);
        const predTensor = this.classifier.predict(embeddings) as any;
        const predValue = (await predTensor.data())[0];
        mlConfidence = predValue;
        reasoning.push(`Internal ML model confidence: ${(mlConfidence * 100).toFixed(1)}%`);
        predTensor.dispose();
        embeddings.dispose();
      } else {
        // Rule-based fallback if ML model is not available
        reasoning.push('ML model not available, using rule-based analysis.');
        mlConfidence = 0.5;
        // Simple rule: if text contains many sensationalist words, lower confidence
        const lowerText = text.toLowerCase();
        let penalty = 0;
        this.sensationalistWords.forEach(word => {
          if (lowerText.includes(word)) penalty += 0.1;
        });
        mlConfidence = Math.max(0, 1 - penalty);
        if (penalty > 0) {
          reasoning.push(`Sensationalist language detected, confidence reduced by ${penalty * 100}%`);
          suspiciousIndicators.push('Sensationalist language present');
        }
      }
    } catch (error: any) {
        logger.error('Error during ML model analysis:', error);
        reasoning.push('Internal ML model analysis failed.');
        suspiciousIndicators.push('The internal ML model could not process the text.');
        mlConfidence = 0; // Set to lowest confidence on failure
    }

    try {
        // Perform external fact-checking
        factCheckResult = await factCheckService.verifyClaim(text);
        if (factCheckResult.isVerifiable && factCheckResult.rating && factCheckResult.claims[0]?.claimReview[0]?.publisher.name) {
            reasoning.push(`External Fact-Check: '${factCheckResult.rating}' from ${factCheckResult.claims[0].claimReview[0].publisher.name}`);
        } else {
            reasoning.push('External fact-check could not be completed or found no results.');
        }
    } catch (error: any) {
        logger.error('Error during fact-checking:', error);
        reasoning.push('External fact-checking service failed.');
        suspiciousIndicators.push('Could not connect to external fact-checking service.');
    }

    // Blend the scores
    const finalConfidence = this.calculateBlendedScore(mlConfidence, factCheckResult);
    prediction = finalConfidence > 0.5 ? 'FAKE' : 'REAL';

    const processingTime = Date.now() - startTime;
    return {
      prediction: prediction as 'REAL' | 'FAKE',
      confidence: finalConfidence,
      metrics: {
        processingTime,
        reliability: finalConfidence * 10,
        characterCount: text.length,
        mlMetrics: {
          modelConfidence: mlConfidence * 100,
          credibilityScore: finalConfidence * 10,
          readabilityScore: readabilityScore, // Always provide calculated value
          sourceTrustworthiness: sourceTrustworthiness * 100 // Always provide calculated value
        },
        analysisMethod: 'USE + Logistic Regression + Fact-Check'
      },
      reasoning,
      suspiciousIndicators,
      factCheck: factCheckResult,
    };
  }
}

export const textAnalyzer = new TextAnalyzer(); 