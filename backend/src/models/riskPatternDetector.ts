import { setupLogger } from '../utils/logger';

const logger = setupLogger();

export interface RiskPatternResult {
  patterns: {
    excessivePunctuation: boolean;
    allCaps: boolean;
    conspiracyTerms: string[];
    emotiveLanguage: boolean;
    urgencyIndicators: boolean;
  };
  riskScore: number;
  flaggedTerms: string[];
  analysis: string[];
}

export class RiskPatternDetector {
  private readonly conspiracyTerms: Set<string>;
  private readonly emotiveWords: Set<string>;
  private readonly urgencyPhrases: Set<string>;

  constructor() {
    // Initialize dictionaries
    this.conspiracyTerms = new Set([
      'deep state', 'illuminati', 'new world order', 'chemtrails', 
      'microchip', 'mind control', 'cover up', 'shadow government',
      'conspiracy', 'controlled opposition', 'false flag'
    ]);

    this.emotiveWords = new Set([
      'shocking', 'bombshell', 'explosive', 'terrifying',
      'outrageous', 'devastating', 'catastrophic', 'horrifying'
    ]);

    this.urgencyPhrases = new Set([
      'must see', 'share before deleted', 'urgent', 'breaking',
      'they don\'t want you to know', 'wake up', 'time is running out'
    ]);
  }

  analyze(text: string): RiskPatternResult {
    const normalizedText = text.toLowerCase();
    const words = normalizedText.split(/\s+/);
    const analysis: string[] = [];
    const flaggedTerms: string[] = [];

    // Check for excessive punctuation
    const punctuationRatio = this.calculatePunctuationRatio(text);
    const hasExcessivePunctuation = punctuationRatio > 0.1;
    if (hasExcessivePunctuation) {
      analysis.push(`High punctuation ratio detected: ${(punctuationRatio * 100).toFixed(1)}%`);
    }

    // Check for ALL CAPS
    const capsRatio = this.calculateCapsRatio(text);
    const hasAllCaps = capsRatio > 0.3;
    if (hasAllCaps) {
      analysis.push(`High uppercase ratio detected: ${(capsRatio * 100).toFixed(1)}%`);
    }

    // Detect conspiracy terms
    const detectedConspiracyTerms = this.detectTerms(normalizedText, this.conspiracyTerms);
    if (detectedConspiracyTerms.length > 0) {
      analysis.push(`Conspiracy-related terms detected: ${detectedConspiracyTerms.join(', ')}`);
      flaggedTerms.push(...detectedConspiracyTerms);
    }

    // Check for emotive language
    const hasEmotiveLanguage = this.detectTerms(normalizedText, this.emotiveWords).length > 0;
    if (hasEmotiveLanguage) {
      analysis.push('Excessive emotional language detected');
    }

    // Check for urgency indicators
    const hasUrgencyIndicators = this.detectTerms(normalizedText, this.urgencyPhrases).length > 0;
    if (hasUrgencyIndicators) {
      analysis.push('Urgency-inducing language detected');
    }

    // Calculate overall risk score
    const riskScore = this.calculateRiskScore({
      punctuationRatio,
      capsRatio,
      conspiracyTermCount: detectedConspiracyTerms.length,
      hasEmotiveLanguage,
      hasUrgencyIndicators
    });

    return {
      patterns: {
        excessivePunctuation: hasExcessivePunctuation,
        allCaps: hasAllCaps,
        conspiracyTerms: detectedConspiracyTerms,
        emotiveLanguage: hasEmotiveLanguage,
        urgencyIndicators: hasUrgencyIndicators
      },
      riskScore,
      flaggedTerms,
      analysis
    };
  }

  private calculatePunctuationRatio(text: string): number {
    const punctuationCount = (text.match(/[!?.,;:]/g) || []).length;
    return punctuationCount / text.length;
  }

  private calculateCapsRatio(text: string): number {
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
    return letterCount > 0 ? capsCount / letterCount : 0;
  }

  private detectTerms(text: string, termSet: Set<string>): string[] {
    return Array.from(termSet).filter(term => text.includes(term));
  }

  private calculateRiskScore(metrics: {
    punctuationRatio: number;
    capsRatio: number;
    conspiracyTermCount: number;
    hasEmotiveLanguage: boolean;
    hasUrgencyIndicators: boolean;
  }): number {
    const weights = {
      punctuation: 0.15,
      caps: 0.15,
      conspiracyTerms: 0.3,
      emotiveLanguage: 0.2,
      urgencyIndicators: 0.2
    };

    let score = 0;
    score += (metrics.punctuationRatio > 0.1 ? metrics.punctuationRatio : 0) * weights.punctuation;
    score += (metrics.capsRatio > 0.3 ? metrics.capsRatio : 0) * weights.caps;
    score += (metrics.conspiracyTermCount * 0.2) * weights.conspiracyTerms;
    score += (metrics.hasEmotiveLanguage ? 1 : 0) * weights.emotiveLanguage;
    score += (metrics.hasUrgencyIndicators ? 1 : 0) * weights.urgencyIndicators;

    return Math.min(1, score);
  }
} 