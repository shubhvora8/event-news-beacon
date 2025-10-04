export interface NewsAnalysis {
  relatability: RelatabilityCheck;
  legitimacy: LegitimacyCheck;
  trustworthiness: Trustworthiness;
  overallScore: number;
  overallVerdict: 'VERIFIED' | 'SUSPICIOUS' | 'FAKE' | 'NEEDS_REVIEW';
}

export interface RelatabilityCheck {
  rssVerification: {
    found: boolean;
    matchingFeeds: RSSFeed[];
    score: number;
  };
  location: {
    score: number;
    details: string;
    extractedLocations: string[];
  };
  timestamp: {
    score: number;
    details: string;
    extractedDates: string[];
    consistency: boolean;
  };
  event: {
    score: number;
    details: string;
    eventContext: string;
    plausibility: number;
  };
  overallScore: number;
}

export interface RSSFeed {
  source: string;
  title: string;
  url: string;
  publishDate: string;
  similarity: number;
}

export interface LegitimacyCheck {
  bbcVerification: {
    found: boolean;
    similarity: number;
    matchingArticles: NewsSource[];
  };
  cnnVerification: {
    found: boolean;
    similarity: number;
    matchingArticles: NewsSource[];
  };
  abcVerification: {
    found: boolean;
    similarity: number;
    matchingArticles: NewsSource[];
  };
  guardianVerification: {
    found: boolean;
    similarity: number;
    matchingArticles: NewsSource[];
  };
  crossReference: {
    score: number;
    details: string;
  };
  overallScore: number;
}

export interface Trustworthiness {
  languageAnalysis: {
    bias: number;
    emotionalTone: 'neutral' | 'positive' | 'negative' | 'sensational';
    credibilityScore: number;
  };
  factualConsistency: {
    score: number;
    inconsistencies: string[];
  };
  sourceCredibility: {
    score: number;
    reputation: string;
  };
  overallScore: number;
}

export interface NewsSource {
  title: string;
  url: string;
  publishDate: string;
  similarity: number;
  excerpt: string;
}