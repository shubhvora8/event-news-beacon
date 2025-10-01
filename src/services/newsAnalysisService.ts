import { NewsAnalysis } from "@/types/news";

// Helper function to generate mock matching articles based on content
const generateMockArticles = (text: string, source: 'BBC' | 'CNN', sourceUrl?: string) => {
  // Extract key topics from the text
  const firstSentence = text.split('.')[0] || text.substring(0, 100);
  const words = firstSentence.split(' ').filter(w => w.length > 4);
  const title = words.slice(0, 8).join(' ') + (words.length > 8 ? '...' : '');
  
  const baseUrl = source === 'BBC' ? 'https://www.bbc.com/news/' : 'https://www.cnn.com/';
  const urlSlug = words.slice(0, 3).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  return [{
    title: title || `${source} Report on Recent Events`,
    url: sourceUrl || `${baseUrl}${urlSlug}`,
    publishDate: new Date().toISOString().split('T')[0],
    similarity: sourceUrl?.includes(source.toLowerCase() + '.com') ? 95 : 85,
    excerpt: text.substring(0, 150) + (text.length > 150 ? '...' : '')
  }];
};

// Simulate news verification API calls
export class NewsAnalysisService {
  static async analyzeNews(newsContent: string, sourceUrl?: string): Promise<NewsAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract key information from the news content
    const words = newsContent.toLowerCase().split(' ');
    const locations = this.extractLocations(newsContent);
    const dates = this.extractDates(newsContent);
    const hasControversialKeywords = this.checkControversialKeywords(newsContent);
    
    // Simulate relatability analysis
    const relatability = {
      location: {
        score: locations.length > 0 ? 75 : 30,
        details: locations.length > 0 
          ? `Located ${locations.length} geographical references that appear consistent with known locations.`
          : "Limited geographical context found. Location verification challenging.",
        extractedLocations: locations
      },
      timestamp: {
        score: dates.length > 0 ? 80 : 40,
        details: dates.length > 0
          ? "Temporal references are consistent and plausible with current timeframe."
          : "Limited or inconsistent temporal context found.",
        extractedDates: dates,
        consistency: dates.length > 0
      },
      event: {
        score: hasControversialKeywords ? 45 : 70,
        details: hasControversialKeywords
          ? "Event contains sensational claims that require additional verification."
          : "Event context appears plausible and consistent with known patterns.",
        eventContext: this.generateEventContext(newsContent),
        plausibility: hasControversialKeywords ? 45 : 75
      },
      overallScore: 0
    };
    relatability.overallScore = Math.round((relatability.location.score + relatability.timestamp.score + relatability.event.score) / 3);

    // Simulate BBC/CNN verification
    const bbcMatch = this.simulateBBCVerification(newsContent, sourceUrl);
    const cnnMatch = this.simulateCNNVerification(newsContent, sourceUrl);
    
    // Check if source is from a trusted domain
    const isTrustedSource = sourceUrl && (
      sourceUrl.toLowerCase().includes('bbc.com') ||
      sourceUrl.toLowerCase().includes('cnn.com')
    );
    
    const legitimacy = {
      bbcVerification: bbcMatch,
      cnnVerification: cnnMatch,
      crossReference: {
        score: (bbcMatch.found && cnnMatch.found) ? 95 : 
               (isTrustedSource && (bbcMatch.found || cnnMatch.found)) ? 90 :
               (bbcMatch.found || cnnMatch.found) ? 85 : 20,
        details: (bbcMatch.found && cnnMatch.found) 
          ? "Content corroborated by multiple authoritative news sources."
          : (isTrustedSource && (bbcMatch.found || cnnMatch.found))
          ? "Content verified by a trusted authoritative news source."
          : (bbcMatch.found || cnnMatch.found)
          ? "Content matches patterns found in major news outlets."
          : "No verification found in major news databases."
      },
      overallScore: 0
    };
    
    // Calculate legitimacy score - give higher scores to keyword matches even without URL
    if (isTrustedSource && (bbcMatch.found || cnnMatch.found)) {
      // Trusted source with URL gets highest score
      legitimacy.overallScore = Math.round((
        (bbcMatch.found ? bbcMatch.similarity : 0) + 
        (cnnMatch.found ? cnnMatch.similarity : 0) + 
        legitimacy.crossReference.score
      ) / 2);
    } else if (bbcMatch.found && cnnMatch.found) {
      // Both sources match keywords (no URL) - still high score
      legitimacy.overallScore = Math.round((
        bbcMatch.similarity + 
        cnnMatch.similarity + 
        legitimacy.crossReference.score
      ) / 3);
    } else if (bbcMatch.found || cnnMatch.found) {
      // One source matches keywords (no URL) - good score
      legitimacy.overallScore = Math.round((
        (bbcMatch.found ? bbcMatch.similarity : cnnMatch.similarity) + 
        legitimacy.crossReference.score
      ) / 2);
    } else {
      // No matches at all
      legitimacy.overallScore = 20;
    }

    // Simulate trustworthiness analysis
    const biasScore = this.analyzeBias(newsContent);
    const credibilityScore = 100 - biasScore;
    const inconsistencies = this.findInconsistencies(newsContent);
    
    const trustworthiness = {
      languageAnalysis: {
        bias: biasScore,
        emotionalTone: this.detectEmotionalTone(newsContent),
        credibilityScore: credibilityScore
      },
      factualConsistency: {
        score: inconsistencies.length === 0 ? 85 : Math.max(20, 85 - (inconsistencies.length * 15)),
        inconsistencies: inconsistencies
      },
      sourceCredibility: {
        score: sourceUrl ? this.evaluateSourceCredibility(sourceUrl) : 50,
        reputation: sourceUrl 
          ? this.getSourceReputation(sourceUrl)
          : "Source URL not provided. Credibility assessment limited."
      },
      overallScore: 0
    };
    trustworthiness.overallScore = Math.round((
      (100 - trustworthiness.languageAnalysis.bias) + 
      trustworthiness.factualConsistency.score + 
      trustworthiness.sourceCredibility.score
    ) / 3);

    // Calculate overall score and verdict
    const overallScore = Math.round((relatability.overallScore + legitimacy.overallScore + trustworthiness.overallScore) / 3);
    
    let overallVerdict: 'VERIFIED' | 'SUSPICIOUS' | 'FAKE' | 'NEEDS_REVIEW';
    if (overallScore >= 75) overallVerdict = 'VERIFIED';
    else if (overallScore >= 50) overallVerdict = 'SUSPICIOUS';
    else if (overallScore >= 25) overallVerdict = 'NEEDS_REVIEW';
    else overallVerdict = 'FAKE';

    return {
      relatability,
      legitimacy,
      trustworthiness,
      overallScore,
      overallVerdict
    };
  }

  private static extractLocations(text: string): string[] {
    const locationKeywords = ['New York', 'London', 'Paris', 'Tokyo', 'Washington', 'Moscow', 'Beijing', 'Delhi', 'Mumbai', 'Sydney'];
    return locationKeywords.filter(location => 
      text.toLowerCase().includes(location.toLowerCase())
    ).slice(0, 3);
  }

  private static extractDates(text: string): string[] {
    const dateRegex = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|\b\d{1,2}\/\d{1,2}\/\d{4}|\b\d{4}-\d{2}-\d{2}/gi;
    const matches = text.match(dateRegex);
    return matches ? matches.slice(0, 3) : [];
  }

  private static checkControversialKeywords(text: string): boolean {
    const controversialWords = ['shocking', 'unbelievable', 'exclusive', 'breaking', 'you won\'t believe', 'doctors hate'];
    return controversialWords.some(word => text.toLowerCase().includes(word));
  }

  private static generateEventContext(text: string): string {
    const wordCount = text.split(' ').length;
    if (wordCount < 50) return "Limited context provided. Event details are sparse.";
    if (wordCount < 150) return "Moderate context provided. Some event details available for verification.";
    return "Comprehensive context provided. Sufficient detail for thorough event verification.";
  }

  private static simulateBBCVerification(text: string, sourceUrl?: string) {
    // Check if source URL is from BBC
    const isBBCSource = sourceUrl && sourceUrl.toLowerCase().includes('bbc.com');
    const isCNNSource = sourceUrl && sourceUrl.toLowerCase().includes('cnn.com');
    
    // If URL is specifically from CNN, don't verify in BBC
    if (isCNNSource) {
      return {
        found: false,
        similarity: 0,
        matchingArticles: []
      };
    }
    
    // Keyword matching for BBC content (works with or without URL)
    const bbcKeywords = ['climate', 'government', 'economy', 'health', 'news', 'world', 'uk', 'breaking', 'politics', 'business', 'sport', 'technology', 'science', 'entertainment'];
    const hasRelevantKeywords = bbcKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
    
    // If it's from BBC domain or has BBC-style keywords, it's verified
    const found = isBBCSource || hasRelevantKeywords;
    const similarity = found ? (isBBCSource ? 95 : Math.floor(Math.random() * 30) + 70) : 0;
    
    return {
      found,
      similarity,
      matchingArticles: found ? generateMockArticles(text, 'BBC', sourceUrl) : []
    };
  }

  private static simulateCNNVerification(text: string, sourceUrl?: string) {
    // Check if source URL is from CNN
    const isCNNSource = sourceUrl && sourceUrl.toLowerCase().includes('cnn.com');
    const isBBCSource = sourceUrl && sourceUrl.toLowerCase().includes('bbc.com');
    
    // If URL is specifically from BBC, don't verify in CNN
    if (isBBCSource) {
      return {
        found: false,
        similarity: 0,
        matchingArticles: []
      };
    }
    
    // Keyword matching for CNN content (works with or without URL)
    const cnnKeywords = ['politics', 'international', 'business', 'technology', 'news', 'world', 'breaking', 'health', 'entertainment', 'sport', 'us', 'global'];
    const hasRelevantKeywords = cnnKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
    
    // If it's from CNN domain or has CNN-style keywords, it's verified
    const found = isCNNSource || hasRelevantKeywords;
    const similarity = found ? (isCNNSource ? 92 : Math.floor(Math.random() * 25) + 65) : 0;
    
    return {
      found,
      similarity,
      matchingArticles: found ? generateMockArticles(text, 'CNN', sourceUrl) : []
    };
  }

  private static analyzeBias(text: string): number {
    const biasIndicators = ['always', 'never', 'everyone knows', 'obviously', 'clearly', 'definitely'];
    const biasCount = biasIndicators.filter(indicator => 
      text.toLowerCase().includes(indicator)
    ).length;
    
    return Math.min(80, biasCount * 15);
  }

  private static detectEmotionalTone(text: string): 'neutral' | 'positive' | 'negative' | 'sensational' {
    const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'success'];
    const negativeWords = ['terrible', 'awful', 'disaster', 'crisis', 'failure'];
    const sensationalWords = ['shocking', 'unbelievable', 'incredible', 'stunning'];
    
    const positiveCount = positiveWords.filter(word => text.toLowerCase().includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.toLowerCase().includes(word)).length;
    const sensationalCount = sensationalWords.filter(word => text.toLowerCase().includes(word)).length;
    
    if (sensationalCount > 0) return 'sensational';
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private static findInconsistencies(text: string): string[] {
    const inconsistencies = [];
    
    // Check for contradictory statements
    if (text.includes('said') && text.includes('denied')) {
      inconsistencies.push('Contradictory statements detected in the same article.');
    }
    
    // Check for unrealistic numbers
    const numbers = text.match(/\d+/g);
    if (numbers && numbers.some(num => parseInt(num) > 1000000)) {
      inconsistencies.push('Unusually large numbers that may require verification.');
    }
    
    return inconsistencies;
  }

  private static evaluateSourceCredibility(url: string): number {
    const trustedDomains = ['bbc.com', 'cnn.com', 'reuters.com', 'ap.org', 'npr.org'];
    const questionableDomains = ['fake-news.com', 'clickbait.net', 'unverified.info'];
    
    if (trustedDomains.some(domain => url.includes(domain))) return 90;
    if (questionableDomains.some(domain => url.includes(domain))) return 10;
    return 50; // Unknown domain
  }

  private static getSourceReputation(url: string): string {
    const trustedDomains = ['bbc.com', 'cnn.com', 'reuters.com', 'ap.org'];
    
    if (trustedDomains.some(domain => url.includes(domain))) {
      return "Source is from a well-established, reputable news organization with strong editorial standards.";
    }
    
    return "Source credibility requires further investigation. Domain not recognized as major news outlet.";
  }
}