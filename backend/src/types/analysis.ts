export interface AnalysisResult {
  prediction: 'REAL' | 'FAKE';
  confidence: number;
  reasoning: string[];
  processingTime: number;
  articleLength: number;
  reliabilityScore: number;
  suspiciousIndicators: string[];
  credibilityScore: number;
  sentimentScore: number;
  languageMetrics: {
    readability: number;
    complexity: number;
  };
}

export interface MediaAnalysisResult {
  type: 'image' | 'video';
  isManipulated: boolean;
  manipulationScore: number;
  confidence: number;
  metadata: {
    dimensions?: {
      width: number;
      height: number;
    };
    format?: string;
    size?: number;
    created?: string;
    modified?: string;
    analyzedAt: string;
    totalFrames?: number;
    analyzedFrames?: number;
  };
  detectedObjects?: string[];
  errorLevel?: number;
  faceAnalysis?: {
    detected: boolean;
    anomalies: string[];
  };
  isDeepfake?: boolean;
  inconsistentFrames?: number[];
  warnings: string[];
  verificationStatus: 'verified' | 'manipulated' | 'suspicious';
}

export interface SampleArticle {
  title: string;
  content: string;
  source: string;
  category: 'real' | 'fake';
}

interface LinguisticIndicators {
  emotionalLanguage: number;
  sensationalism: number;
  grammarQuality: number;
  clickbaitScore: number;
  biasScore: number;
}

interface SemanticIndicators {
  coherence: number;
  factualConsistency: number;
  contextRelevance: number;
  topicDrift: number;
}

interface SourceIndicators {
  credibility: number;
  recentAccuracy: number;
  verifiedClaims: number;
  domainAge: number;
}

export interface AnalysisRequest {
  text: string;
  url?: string;
  title?: string;
  metadata?: {
    source?: string;
    publishDate?: string;
    author?: string;
  };
}

export interface MLResult {
  classification?: {
    labels: string[];
    scores: number[];
  };
  sentiment?: Array<{
    label: string;
    score: number;
  }>;
  toxicity?: Array<{
    label: string;
    score: number;
  }>;
}

export interface AnalysisStats {
  totalAnalyses: number;
  averageProcessingTime: number;
  accuracyScore: number;
} 