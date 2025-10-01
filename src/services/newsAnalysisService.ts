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
    
    // Simulate RSS verification
    const rssVerification = this.simulateRSSVerification(newsContent, sourceUrl);
    
    // Simulate relatability analysis
    const relatability = {
      rssVerification,
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
    relatability.overallScore = Math.round((relatability.rssVerification.score + relatability.location.score + relatability.timestamp.score + relatability.event.score) / 4);

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
    
    // Calculate legitimacy score - prioritize keyword matches
    if (isTrustedSource && (bbcMatch.found || cnnMatch.found)) {
      // Trusted source with URL gets highest score
      legitimacy.overallScore = Math.round((
        (bbcMatch.found ? bbcMatch.similarity : 0) + 
        (cnnMatch.found ? cnnMatch.similarity : 0) + 
        legitimacy.crossReference.score
      ) / 2);
    } else if (bbcMatch.found && cnnMatch.found) {
      // Both sources match keywords - high score (weighted toward matches)
      legitimacy.overallScore = Math.round((
        bbcMatch.similarity * 0.4 + 
        cnnMatch.similarity * 0.4 + 
        legitimacy.crossReference.score * 0.2
      ));
    } else if (bbcMatch.found || cnnMatch.found) {
      // One source matches keywords - good score
      const matchSimilarity = bbcMatch.found ? bbcMatch.similarity : cnnMatch.similarity;
      legitimacy.overallScore = Math.round((
        matchSimilarity * 0.6 + 
        legitimacy.crossReference.score * 0.4
      ));
    } else {
      // No matches at all
      legitimacy.overallScore = 20;
    }
    
    console.log('Legitimacy Score:', {
      overallScore: legitimacy.overallScore,
      bbcFound: bbcMatch.found,
      cnnFound: cnnMatch.found,
      bbcSim: bbcMatch.similarity,
      cnnSim: cnnMatch.similarity,
      crossRef: legitimacy.crossReference.score
    });

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

  private static simulateRSSVerification(text: string, sourceUrl?: string) {
    const lowerText = text.toLowerCase();
    
    // RSS feed keywords that indicate legitimate news content
    const rssKeywords = [
      'news', 'report', 'announced', 'according', 'sources', 'officials',
      'government', 'president', 'minister', 'statement', 'says', 'said',
      'world', 'country', 'national', 'international', 'breaking', 'update'
    ];
    
    const matchCount = rssKeywords.filter(keyword => lowerText.includes(keyword)).length;
    const wordCount = text.split(/\s+/).length;
    const hasNewsStructure = wordCount >= 30;
    const hasRelevantKeywords = matchCount >= 2;
    
    const found = hasRelevantKeywords && hasNewsStructure;
    const score = found ? Math.min(90, 50 + (matchCount * 5)) : 30;
    
    const matchingFeeds = found ? [
      {
        source: 'Reuters RSS',
        title: text.split('.')[0]?.substring(0, 80) || 'News Article',
        url: sourceUrl || 'https://www.reuters.com/news/rss',
        publishDate: new Date().toISOString().split('T')[0],
        similarity: score
      },
      {
        source: 'Associated Press RSS',
        title: text.split('.')[0]?.substring(0, 80) || 'Breaking News',
        url: sourceUrl || 'https://apnews.com/rss',
        publishDate: new Date().toISOString().split('T')[0],
        similarity: Math.max(70, score - 10)
      }
    ] : [];
    
    console.log('RSS Verification:', { found, score, matchCount, wordCount });
    
    return { found, matchingFeeds, score };
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
    const lowerText = text.toLowerCase();
    const isBBCSource = sourceUrl && sourceUrl.toLowerCase().includes('bbc.com');
    const isCNNSource = sourceUrl && sourceUrl.toLowerCase().includes('cnn.com');
    
    // If URL is specifically from CNN, don't verify in BBC
    if (isCNNSource) {
      return { found: false, similarity: 0, matchingArticles: [] };
    }
    
    // Extensive news-related keywords that appear in legitimate articles
    const bbcKeywords = [
      // BBC-specific
      'bbc', 'british broadcasting', 'uk', 'britain', 'england', 'scotland', 'wales', 'london',
      // News/reporting terms
      'news', 'report', 'reports', 'reported', 'reporting', 'journalist', 'reporter', 'correspondent',
      'announced', 'statement', 'says', 'said', 'told', 'according', 'sources', 'officials',
      // Politics & Government
      'government', 'minister', 'ministers', 'parliament', 'prime minister', 'politics', 'political',
      'election', 'vote', 'voting', 'policy', 'legislation', 'law', 'president', 'congress', 'senate',
      // World & International
      'world', 'international', 'global', 'country', 'countries', 'nation', 'national', 'foreign',
      'europe', 'european', 'asia', 'africa', 'america', 'american', 'china', 'russia', 'india',
      // Business & Economy
      'economy', 'economic', 'business', 'market', 'markets', 'financial', 'bank', 'company', 'companies',
      'trade', 'industry', 'investment', 'stock', 'shares', 'profit', 'growth', 'inflation',
      // Health & Science
      'health', 'hospital', 'medical', 'doctor', 'doctors', 'patient', 'patients', 'disease', 'treatment',
      'study', 'research', 'scientist', 'scientists', 'university', 'professor', 'science', 'scientific',
      'covid', 'pandemic', 'virus', 'vaccine', 'vaccination',
      // Technology
      'technology', 'tech', 'digital', 'internet', 'online', 'cyber', 'computer', 'software', 'app',
      // Climate & Environment
      'climate', 'environment', 'environmental', 'weather', 'temperature', 'carbon', 'emissions', 'energy',
      // Society & Culture
      'society', 'social', 'community', 'public', 'people', 'population', 'family', 'children',
      'education', 'school', 'university', 'student', 'students', 'teacher', 'teachers',
      'culture', 'cultural', 'art', 'music', 'film', 'entertainment', 'sport', 'sports',
      // Events & Issues
      'crisis', 'issue', 'issues', 'problem', 'challenge', 'situation', 'incident', 'event',
      'attack', 'conflict', 'war', 'peace', 'security', 'police', 'court', 'trial', 'investigation',
      // Time references
      'today', 'yesterday', 'week', 'month', 'year', 'recently', 'latest', 'breaking', 'update'
    ];
    
    const matchCount = bbcKeywords.filter(keyword => lowerText.includes(keyword)).length;
    const wordCount = text.split(/\s+/).length;
    
    // Consider it news-like if: has keywords AND reasonable length (>20 words)
    const hasRelevantKeywords = matchCount >= 3;
    const hasNewsStructure = wordCount >= 20;
    const looksLikeNews = hasRelevantKeywords && hasNewsStructure;
    
    // If it's from BBC domain or looks like legitimate news, it's verified
    const found = isBBCSource || looksLikeNews;
    // Higher similarity based on keyword density
    const keywordDensity = wordCount > 0 ? (matchCount / wordCount) * 100 : 0;
    const similarity = found ? (isBBCSource ? 95 : Math.min(92, 60 + Math.min(30, keywordDensity * 3))) : 0;
    
    console.log('BBC Verification:', { 
      found, 
      similarity, 
      matchCount, 
      wordCount,
      keywordDensity: keywordDensity.toFixed(2),
      hasUrl: !!sourceUrl 
    });
    
    return {
      found,
      similarity,
      matchingArticles: found ? generateMockArticles(text, 'BBC', sourceUrl) : []
    };
  }

  private static simulateCNNVerification(text: string, sourceUrl?: string) {
    const lowerText = text.toLowerCase();
    const isCNNSource = sourceUrl && sourceUrl.toLowerCase().includes('cnn.com');
    const isBBCSource = sourceUrl && sourceUrl.toLowerCase().includes('bbc.com');
    
    // If URL is specifically from BBC, don't verify in CNN
    if (isBBCSource) {
      return { found: false, similarity: 0, matchingArticles: [] };
    }
    
    // Extensive news-related keywords that appear in legitimate articles
    const cnnKeywords = [
      // CNN-specific
      'cnn', 'cable news', 'us', 'usa', 'america', 'american', 'washington', 'white house',
      // News/reporting terms
      'news', 'report', 'reports', 'reported', 'reporting', 'journalist', 'reporter', 'correspondent',
      'announced', 'statement', 'says', 'said', 'told', 'according', 'sources', 'officials',
      // Politics & Government
      'politics', 'political', 'president', 'congress', 'senate', 'house', 'representative', 'senator',
      'government', 'administration', 'federal', 'state', 'election', 'vote', 'voting', 'campaign',
      'policy', 'legislation', 'law', 'bill', 'democrat', 'republican',
      // International
      'world', 'international', 'global', 'foreign', 'country', 'countries', 'nation', 'national',
      'europe', 'european', 'asia', 'africa', 'middle east', 'china', 'russia', 'ukraine', 'israel',
      // Business & Economy
      'business', 'economy', 'economic', 'market', 'markets', 'financial', 'wall street', 'stock',
      'company', 'companies', 'corporate', 'trade', 'industry', 'investment', 'bank', 'banking',
      // Health & Science
      'health', 'healthcare', 'medical', 'hospital', 'doctor', 'doctors', 'patient', 'patients',
      'cdc', 'fda', 'study', 'research', 'scientist', 'science', 'scientific', 'university',
      'covid', 'pandemic', 'coronavirus', 'virus', 'vaccine', 'vaccination', 'outbreak',
      // Technology
      'technology', 'tech', 'digital', 'internet', 'online', 'cyber', 'computer', 'ai', 'artificial intelligence',
      'social media', 'facebook', 'twitter', 'google', 'apple', 'microsoft', 'amazon',
      // Climate & Environment
      'climate', 'weather', 'storm', 'hurricane', 'environment', 'environmental', 'temperature', 'warming',
      // Crime & Justice
      'crime', 'criminal', 'police', 'arrest', 'arrested', 'court', 'trial', 'judge', 'jury', 'justice',
      'investigation', 'fbi', 'department', 'charges', 'lawsuit', 'legal',
      // Breaking news terms
      'breaking', 'developing', 'update', 'latest', 'live', 'happening', 'now', 'alert',
      // Time references
      'today', 'yesterday', 'tonight', 'this week', 'this month', 'recently', 'year', 'years'
    ];
    
    const matchCount = cnnKeywords.filter(keyword => lowerText.includes(keyword)).length;
    const wordCount = text.split(/\s+/).length;
    
    // Consider it news-like if: has keywords AND reasonable length (>20 words)
    const hasRelevantKeywords = matchCount >= 3;
    const hasNewsStructure = wordCount >= 20;
    const looksLikeNews = hasRelevantKeywords && hasNewsStructure;
    
    // If it's from CNN domain or looks like legitimate news, it's verified
    const found = isCNNSource || looksLikeNews;
    // Higher similarity based on keyword density
    const keywordDensity = wordCount > 0 ? (matchCount / wordCount) * 100 : 0;
    const similarity = found ? (isCNNSource ? 92 : Math.min(90, 55 + Math.min(30, keywordDensity * 3))) : 0;
    
    console.log('CNN Verification:', { 
      found, 
      similarity, 
      matchCount, 
      wordCount,
      keywordDensity: keywordDensity.toFixed(2),
      hasUrl: !!sourceUrl 
    });
    
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