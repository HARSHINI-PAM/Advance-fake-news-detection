
export interface AnalysisResult {
  prediction: 'REAL' | 'FAKE';
  confidence: number;
  reasoning: string[];
  processingTime: number;
  articleLength: number;
  suspiciousIndicators: string[];
  reliabilityScore: number;
}

export interface SampleArticle {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  expectedResult: 'REAL' | 'FAKE';
}
