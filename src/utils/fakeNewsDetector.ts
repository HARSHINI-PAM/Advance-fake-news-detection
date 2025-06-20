
import { pipeline } from '@huggingface/transformers';
import { AnalysisResult } from '@/types/analysis';

// Initialize the text classification pipeline
let classifier: any = null;

const initializeClassifier = async () => {
  if (!classifier) {
    try {
      // Using a pre-trained model for text classification
      classifier = await pipeline(
        'text-classification',
        'martin-ha/toxic-comment-model',
        { device: 'webgpu' }
      );
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU');
      classifier = await pipeline(
        'text-classification',
        'martin-ha/toxic-comment-model'
      );
    }
  }
  return classifier;
};

const analyzeSentiment = async (text: string) => {
  try {
    const sentimentPipeline = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
    const result = await sentimentPipeline(text);
    // Handle the array result properly
    const sentimentResult = Array.isArray(result) ? result[0] : result;
    return sentimentResult;
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    return { label: 'NEUTRAL', score: 0.5 };
  }
};

const detectSuspiciousPatterns = (text: string): string[] => {
  const indicators: string[] = [];
  const lowerText = text.toLowerCase();

  // Emotional manipulation patterns
  const emotionalWords = ['shocking', 'unbelievable', 'miraculous', 'secret', 'hidden truth', 'they dont want you to know'];
  if (emotionalWords.some(word => lowerText.includes(word))) {
    indicators.push('Contains sensational or emotional language');
  }

  // Urgency patterns
  const urgencyWords = ['breaking', 'urgent', 'act now', 'limited time', 'before its too late'];
  if (urgencyWords.some(word => lowerText.includes(word))) {
    indicators.push('Uses urgency tactics');
  }

  // Conspiracy patterns
  const conspiracyWords = ['government cover', 'big pharma', 'mainstream media', 'deep state', 'wake up'];
  if (conspiracyWords.some(word => lowerText.includes(word))) {
    indicators.push('Contains conspiracy theory language');
  }

  // Medical misinformation patterns
  const medicalClaims = ['miracle cure', 'doctors hate', 'big pharma doesnt want', 'natural remedy'];
  if (medicalClaims.some(word => lowerText.includes(word))) {
    indicators.push('Makes unverified medical claims');
  }

  // Excessive punctuation
  if (text.match(/[!]{3,}/) || text.match(/[?]{3,}/)) {
    indicators.push('Excessive use of punctuation');
  }

  // All caps words (sensationalism)
  const capsWords = text.match(/\b[A-Z]{3,}\b/g);
  if (capsWords && capsWords.length > 5) {
    indicators.push('Overuse of capitalized words');
  }

  // Lack of sources
  const sourceIndicators = ['according to', 'study shows', 'research indicates', 'published in', 'source:'];
  if (!sourceIndicators.some(indicator => lowerText.includes(indicator))) {
    indicators.push('Lacks credible source citations');
  }

  return indicators;
};

const calculateReliabilityScore = (
  confidence: number,
  suspiciousCount: number,
  sentiment: any,
  textLength: number
): number => {
  let score = confidence * 10;

  // Penalize for suspicious indicators
  score -= suspiciousCount * 1.5;

  // Consider sentiment extremes as potentially unreliable
  if (sentiment.label === 'NEGATIVE' && sentiment.score > 0.8) {
    score -= 1;
  }

  // Very short or very long articles might be less reliable
  if (textLength < 100 || textLength > 10000) {
    score -= 0.5;
  }

  // Ensure score is between 0 and 10
  return Math.max(0, Math.min(10, score));
};

export const analyzeFakeNews = async (text: string): Promise<AnalysisResult> => {
  const startTime = Date.now();
  
  try {
    // Clean and prepare text
    const cleanText = text.trim().substring(0, 1000); // Limit length for processing
    
    // Initialize classifier
    await initializeClassifier();
    
    // Analyze suspicious patterns
    const suspiciousIndicators = detectSuspiciousPatterns(text);
    
    // Get sentiment analysis
    const sentiment = await analyzeSentiment(cleanText);
    
    // Simple rule-based fake news detection
    // In a real application, you would use a specialized fake news detection model
    let prediction: 'REAL' | 'FAKE' = 'REAL';
    let confidence = 0.7;
    let reasoning: string[] = [];

    // Analyze suspicious indicators
    if (suspiciousIndicators.length >= 3) {
      prediction = 'FAKE';
      confidence = Math.min(0.9, 0.6 + (suspiciousIndicators.length * 0.1));
      reasoning.push(`Multiple suspicious patterns detected (${suspiciousIndicators.length} indicators)`);
    } else if (suspiciousIndicators.length >= 1) {
      confidence = Math.max(0.4, 0.8 - (suspiciousIndicators.length * 0.15));
      reasoning.push(`Some suspicious patterns found (${suspiciousIndicators.length} indicators)`);
    } else {
      reasoning.push('No major suspicious patterns detected');
    }

    // Consider sentiment - handle the sentiment result properly
    if (sentiment && typeof sentiment === 'object' && 'label' in sentiment && 'score' in sentiment) {
      if (sentiment.label === 'NEGATIVE' && sentiment.score > 0.9) {
        confidence -= 0.1;
        reasoning.push('Extremely negative sentiment detected');
      }
    }

    // Text length analysis
    if (text.length < 100) {
      confidence -= 0.2;
      reasoning.push('Article is very short, may lack sufficient information');
    } else if (text.length > 500) {
      reasoning.push('Article has substantial content for analysis');
    }

    // Check for proper journalistic structure
    const hasProperStructure = text.includes('.') && text.includes(',') && !/^[A-Z\s!]+$/.test(text);
    if (hasProperStructure) {
      reasoning.push('Article follows proper journalistic structure');
    } else {
      confidence -= 0.1;
      reasoning.push('Article may lack proper journalistic structure');
    }

    // Final prediction adjustment
    if (confidence < 0.5) {
      prediction = 'FAKE';
    }

    // Ensure confidence is within bounds
    confidence = Math.max(0.1, Math.min(0.95, confidence));

    const processingTime = Date.now() - startTime;
    const reliabilityScore = calculateReliabilityScore(
      confidence,
      suspiciousIndicators.length,
      sentiment,
      text.length
    );

    return {
      prediction,
      confidence,
      reasoning,
      processingTime,
      articleLength: text.length,
      suspiciousIndicators,
      reliabilityScore: Math.round(reliabilityScore * 10) / 10
    };

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Fallback analysis
    const suspiciousIndicators = detectSuspiciousPatterns(text);
    const isSuspicious = suspiciousIndicators.length >= 2;
    
    return {
      prediction: isSuspicious ? 'FAKE' : 'REAL',
      confidence: isSuspicious ? 0.75 : 0.6,
      reasoning: ['Fallback analysis used due to technical limitations'],
      processingTime: Date.now() - startTime,
      articleLength: text.length,
      suspiciousIndicators,
      reliabilityScore: isSuspicious ? 3.5 : 6.5
    };
  }
};
