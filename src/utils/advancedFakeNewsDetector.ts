import { pipeline } from '@huggingface/transformers';
import { AnalysisResult } from '@/types/analysis';

// Advanced ML models for fake news detection
let bertClassifier: any = null;
let sentimentAnalyzer: any = null;
let toxicityDetector: any = null;
let namedEntityRecognizer: any = null;

// Initialize advanced models with improved error handling and fallbacks
const initializeModels = async () => {
  try {
    console.log('Initializing advanced ML models...');
    
    // BERT-based fake news classifier with improved model
    if (!bertClassifier) {
      try {
        bertClassifier = await pipeline(
          'text-classification',
          'facebook/roberta-hate-speech-dynabench-r4-target',
          { device: 'webgpu' }
        );
      } catch (error) {
        console.warn('WebGPU not available for BERT, falling back to CPU');
        bertClassifier = await pipeline(
          'text-classification',
          'facebook/roberta-hate-speech-dynabench-r4-target'
        );
      }
    }

    // Enhanced sentiment analysis model
    if (!sentimentAnalyzer) {
      sentimentAnalyzer = await pipeline(
        'sentiment-analysis',
        'finiteautomata/bertweet-base-sentiment-analysis'
      );
    }

    // Improved Named Entity Recognition for fact verification
    if (!namedEntityRecognizer) {
      namedEntityRecognizer = await pipeline(
        'ner',
        'xlm-roberta-large-finetuned-conll03-english'
      );
    }

    console.log('All models initialized successfully');
    return true;
  } catch (error) {
    console.error('Model initialization failed:', error);
    return false;
  }
};

// Enhanced linguistic analysis with improved metrics
const performLinguisticAnalysis = (text: string) => {
  const analysis = {
    readabilityScore: 0,
    sentenceComplexity: 0,
    vocabularyDiversity: 0,
    emotionalIntensity: 0,
    urgencyScore: 0,
    sensationalismScore: 0,
    biasIndicators: 0
  };

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);

  // Enhanced readability scoring
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = words.reduce((sum, word) => sum + estimateSyllables(word), 0) / words.length;
  analysis.readabilityScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

  // Improved vocabulary diversity (Type-Token Ratio with normalization)
  analysis.vocabularyDiversity = uniqueWords.size / Math.sqrt(words.length);

  // Enhanced sentence complexity
  analysis.sentenceComplexity = avgWordsPerSentence * (1 + (sentences.length / 100));

  // Expanded emotional intensity analysis
  const emotionalWords = [
    'shocking', 'amazing', 'incredible', 'unbelievable', 'devastating', 'outrageous',
    'mind-blowing', 'stunning', 'horrifying', 'terrifying', 'miraculous', 'spectacular'
  ];
  analysis.emotionalIntensity = emotionalWords.reduce((count, word) => 
    count + (text.toLowerCase().includes(word) ? 1 : 0), 0) / words.length * 100;

  // Enhanced urgency scoring
  const urgencyWords = [
    'breaking', 'urgent', 'immediate', 'now', 'quickly', 'alert',
    'exclusive', 'just in', 'developing', 'live', 'emergency', 'critical'
  ];
  analysis.urgencyScore = urgencyWords.reduce((count, word) => 
    count + (text.toLowerCase().includes(word) ? 1 : 0), 0) / words.length * 100;

  // New sensationalism scoring
  const sensationalismWords = [
    'exclusive', 'shocking', 'you won\'t believe', 'mind-blowing',
    'never before seen', 'secret', 'hidden', 'revealed'
  ];
  analysis.sensationalismScore = sensationalismWords.reduce((count, word) => 
    count + (text.toLowerCase().includes(word) ? 1 : 0), 0) / words.length * 100;

  // New bias indicators
  const biasWords = [
    'obviously', 'clearly', 'undoubtedly', 'certainly',
    'everyone knows', 'no one can deny', 'it\'s clear that'
  ];
  analysis.biasIndicators = biasWords.reduce((count, word) => 
    count + (text.toLowerCase().includes(word) ? 1 : 0), 0) / words.length * 100;

  return analysis;
};

// Estimate syllables in a word (simple heuristic)
const estimateSyllables = (word: string): number => {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
};

// Enhanced credibility scoring with improved weights and factors
const calculateCredibilityScore = (
  modelConfidence: number,
  linguisticAnalysis: any,
  entityConsistency: number,
  sourceTrustworthiness: number
): number => {
  const weights = {
    model: 0.35,
    linguistic: 0.25,
    entity: 0.25,
    source: 0.15
  };

  // Enhanced linguistic factors with improved normalization
  const readabilityFactor = Math.max(0, Math.min(1, linguisticAnalysis.readabilityScore / 100));
  const diversityFactor = Math.min(1, linguisticAnalysis.vocabularyDiversity * 2);
  const emotionalPenalty = Math.max(0, 1 - (linguisticAnalysis.emotionalIntensity / 10));
  const urgencyPenalty = Math.max(0, 1 - (linguisticAnalysis.urgencyScore / 5));
  const sensationalismPenalty = Math.max(0, 1 - (linguisticAnalysis.sensationalismScore / 5));
  const biasPenalty = Math.max(0, 1 - (linguisticAnalysis.biasIndicators / 5));

  const linguisticScore = (
    readabilityFactor * 0.3 +
    diversityFactor * 0.2 +
    emotionalPenalty * 0.2 +
    urgencyPenalty * 0.15 +
    sensationalismPenalty * 0.1 +
    biasPenalty * 0.05
  );

  const finalScore = (
    weights.model * modelConfidence +
    weights.linguistic * linguisticScore +
    weights.entity * entityConsistency +
    weights.source * sourceTrustworthiness
  ) * 10;

  return Math.max(0, Math.min(10, finalScore));
};

// Advanced pattern detection with ML-based scoring
const detectAdvancedPatterns = async (text: string) => {
  const patterns = {
    clickbait: 0,
    conspiracy: 0,
    misinformation: 0,
    propaganda: 0,
    satire: 0
  };

  const lowerText = text.toLowerCase();

  // Clickbait detection
  const clickbaitPatterns = [
    /you won't believe/i, /this will shock you/i, /doctors hate/i,
    /one weird trick/i, /what happens next/i, /number \d+ will/i
  ];
  patterns.clickbait = clickbaitPatterns.reduce((score, pattern) => 
    score + (pattern.test(text) ? 0.2 : 0), 0);

  // Conspiracy theory detection
  const conspiracyKeywords = [
    'deep state', 'cover-up', 'hidden agenda', 'wake up', 'they don\'t want you to know',
    'mainstream media lies', 'government conspiracy', 'big pharma'
  ];
  patterns.conspiracy = conspiracyKeywords.reduce((score, keyword) => 
    score + (lowerText.includes(keyword) ? 0.15 : 0), 0);

  // Propaganda indicators
  const propagandaPatterns = [
    /us vs them/i, /enemy of the people/i, /fake news/i,
    /alternative facts/i, /the truth they hide/i
  ];
  patterns.propaganda = propagandaPatterns.reduce((score, pattern) => 
    score + (pattern.test(text) ? 0.2 : 0), 0);

  // Satire detection
  const satireIndicators = [
    'the onion', 'satirical', 'parody', 'humor', 'comedy',
    'jokes', 'funny', 'hilarious'
  ];
  patterns.satire = satireIndicators.reduce((score, indicator) => 
    score + (lowerText.includes(indicator) ? 0.1 : 0), 0);

  return patterns;
};

// Entity consistency check
const checkEntityConsistency = async (text: string): Promise<number> => {
  try {
    if (!namedEntityRecognizer) return 0.5;

    const entities = await namedEntityRecognizer(text);
    
    // Simple consistency check based on entity recognition confidence
    if (Array.isArray(entities) && entities.length > 0) {
      const avgConfidence = entities.reduce((sum: number, entity: any) => 
        sum + (entity.score || 0), 0) / entities.length;
      return avgConfidence;
    }
    
    return 0.5;
  } catch (error) {
    console.error('Entity recognition failed:', error);
    return 0.5;
  }
};

// Source trustworthiness assessment
const assessSourceTrustworthiness = (source: string): number => {
  const trustedSources = [
    'reuters', 'associated press', 'bbc', 'cnn', 'npr', 'pbs',
    'times of india', 'the hindu', 'hindustan times', 'deccan chronicle',
    'new indian express', 'indian express', 'ndtv', 'zee news'
  ];
  
  const somewhatTrusted = [
    'india today', 'news18', 'republic', 'times now', 'aaj tak'
  ];

  const lowerSource = source.toLowerCase();
  
  if (trustedSources.some(trusted => lowerSource.includes(trusted))) {
    return 0.9;
  } else if (somewhatTrusted.some(trusted => lowerSource.includes(trusted))) {
    return 0.7;
  } else if (source.trim().length === 0) {
    return 0.3; // No source provided
  }
  
  return 0.5; // Unknown source
};

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

export const analyzeNewsRealTime = async (
  text: string,
  source: string = '',
  title: string = ''
): Promise<AnalysisResult> => {
  try {
    const response = await fetch(`${API_URL}/analysis/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        source,
        title,
      }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Real-time analysis failed:', error);
    
    // Return a fallback result in case of API failure
    return {
      prediction: 'FAKE',
      confidence: 0.5,
      reasoning: ['API Error: Could not perform analysis'],
      processingTime: 0,
      articleLength: text.length,
      suspiciousIndicators: ['Service temporarily unavailable'],
      reliabilityScore: 0
    };
  }
};
