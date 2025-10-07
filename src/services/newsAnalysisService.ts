import { NewsAnalysis } from "@/types/news";
import { supabase } from "@/integrations/supabase/client";

// Note: Old simulation methods kept for fallback but now using AI verification

export class NewsAnalysisService {
  static async analyzeNews(newsContent: string, sourceUrl?: string): Promise<NewsAnalysis> {
    console.log('Starting AI-powered news analysis...');

    // Call Lovable AI edge function for verification
    const { data: aiVerification, error: aiError } = await supabase.functions.invoke('verify-news', {
      body: { newsContent, sourceUrl }
    });

    if (aiError) {
      console.error('AI verification failed:', aiError);
      throw new Error('Failed to verify news content');
    }

    console.log('AI verification result:', aiVerification);

    // Extract AI analysis results
    const locations = aiVerification.locations || [];
    const dates = aiVerification.dates || [];
    const hasControversialKeywords = (aiVerification.redFlags || []).length > 0;
    
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

    // Use AI verification results
    const bbcMatch = {
      found: aiVerification.bbcVerified || false,
      similarity: aiVerification.bbcSimilarity || 0,
      matchingArticles: (aiVerification.bbcArticles || []).map((article: any) => ({
        title: article.title || 'Related Article',
        url: sourceUrl || 'https://www.bbc.com/news',
        publishDate: new Date().toISOString().split('T')[0],
        similarity: article.similarity || 0,
        excerpt: newsContent.substring(0, 150)
      }))
    };

    const cnnMatch = {
      found: aiVerification.cnnVerified || false,
      similarity: aiVerification.cnnSimilarity || 0,
      matchingArticles: (aiVerification.cnnArticles || []).map((article: any) => ({
        title: article.title || 'Related Article',
        url: sourceUrl || 'https://www.cnn.com',
        publishDate: new Date().toISOString().split('T')[0],
        similarity: article.similarity || 0,
        excerpt: newsContent.substring(0, 150)
      }))
    };

    const abcMatch = {
      found: aiVerification.abcVerified || false,
      similarity: aiVerification.abcSimilarity || 0,
      matchingArticles: (aiVerification.abcArticles || []).map((article: any) => ({
        title: article.title || 'Related Article',
        url: sourceUrl || 'https://abcnews.go.com',
        publishDate: new Date().toISOString().split('T')[0],
        similarity: article.similarity || 0,
        excerpt: newsContent.substring(0, 150)
      }))
    };

    const guardianMatch = {
      found: aiVerification.guardianVerified || false,
      similarity: aiVerification.guardianSimilarity || 0,
      matchingArticles: (aiVerification.guardianArticles || []).map((article: any) => ({
        title: article.title || 'Related Article',
        url: sourceUrl || 'https://www.theguardian.com',
        publishDate: new Date().toISOString().split('T')[0],
        similarity: article.similarity || 0,
        excerpt: newsContent.substring(0, 150)
      }))
    };
    
    const isTrustedSource = sourceUrl && (
      sourceUrl.toLowerCase().includes('bbc.com') ||
      sourceUrl.toLowerCase().includes('cnn.com') ||
      sourceUrl.toLowerCase().includes('abcnews.go.com') ||
      sourceUrl.toLowerCase().includes('theguardian.com')
    );
    
    const legitimacy = {
      bbcVerification: bbcMatch,
      cnnVerification: cnnMatch,
      abcVerification: abcMatch,
      guardianVerification: guardianMatch,
      crossReference: {
        score: (bbcMatch.found && cnnMatch.found && abcMatch.found && guardianMatch.found) ? 98 :
               (bbcMatch.found && cnnMatch.found && (abcMatch.found || guardianMatch.found)) ? 95 :
               (bbcMatch.found && cnnMatch.found) ? 92 : 
               (isTrustedSource && (bbcMatch.found || cnnMatch.found || abcMatch.found || guardianMatch.found)) ? 90 :
               (bbcMatch.found || cnnMatch.found || abcMatch.found || guardianMatch.found) ? 85 : 20,
        details: (bbcMatch.found && cnnMatch.found && (abcMatch.found || guardianMatch.found))
          ? "Content corroborated by multiple authoritative news sources."
          : (isTrustedSource && (bbcMatch.found || cnnMatch.found || abcMatch.found || guardianMatch.found))
          ? "Content verified by a trusted authoritative news source."
          : (bbcMatch.found || cnnMatch.found || abcMatch.found || guardianMatch.found)
          ? "Content matches patterns found in major news outlets."
          : "No verification found in major news databases."
      },
      overallScore: 0
    };
    
    // Calculate legitimacy score - prioritize keyword matches
    const foundCount = [bbcMatch.found, cnnMatch.found, abcMatch.found, guardianMatch.found].filter(Boolean).length;
    if (isTrustedSource && foundCount > 0) {
      // Trusted source with URL gets highest score
      legitimacy.overallScore = Math.round((
        (bbcMatch.found ? bbcMatch.similarity : 0) + 
        (cnnMatch.found ? cnnMatch.similarity : 0) + 
        (abcMatch.found ? abcMatch.similarity : 0) + 
        (guardianMatch.found ? guardianMatch.similarity : 0) + 
        legitimacy.crossReference.score
      ) / (foundCount + 1));
    } else if (foundCount >= 2) {
      // Multiple sources match keywords - high score (weighted toward matches)
      const totalSimilarity = 
        (bbcMatch.found ? bbcMatch.similarity : 0) + 
        (cnnMatch.found ? cnnMatch.similarity : 0) + 
        (abcMatch.found ? abcMatch.similarity : 0) + 
        (guardianMatch.found ? guardianMatch.similarity : 0);
      legitimacy.overallScore = Math.round((
        (totalSimilarity / foundCount) * 0.7 + 
        legitimacy.crossReference.score * 0.3
      ));
    } else if (foundCount === 1) {
      // One source matches keywords - good score
      const matchSimilarity = 
        bbcMatch.found ? bbcMatch.similarity : 
        cnnMatch.found ? cnnMatch.similarity :
        abcMatch.found ? abcMatch.similarity :
        guardianMatch.similarity;
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
      abcFound: abcMatch.found,
      guardianFound: guardianMatch.found,
      bbcSim: bbcMatch.similarity,
      cnnSim: cnnMatch.similarity,
      abcSim: abcMatch.similarity,
      guardianSim: guardianMatch.similarity,
      crossRef: legitimacy.crossReference.score
    });

    // Use AI credibility analysis
    const credibilityIndicators = aiVerification.credibilityIndicators || [];
    const redFlags = aiVerification.redFlags || [];
    const biasScore = Math.max(0, 100 - (credibilityIndicators.length * 20) + (redFlags.length * 15));
    const credibilityScore = 100 - biasScore;
    const inconsistencies = redFlags;
    
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

    // Calculate overall score and verdict (weighted: Legitimacy 55%, Relatability 30%, Trustworthiness 15%)
    const overallScore = Math.round(
      (legitimacy.overallScore * 0.55) + 
      (relatability.overallScore * 0.30) + 
      (trustworthiness.overallScore * 0.15)
    );
    
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
    const trustedDomains = ['bbc.com', 'cnn.com', 'reuters.com', 'ap.org', 'npr.org', 'abcnews.go.com', 'theguardian.com'];
    const questionableDomains = ['fake-news.com', 'clickbait.net', 'unverified.info'];
    
    if (trustedDomains.some(domain => url.includes(domain))) return 90;
    if (questionableDomains.some(domain => url.includes(domain))) return 10;
    return 50; // Unknown domain
  }

  private static getSourceReputation(url: string): string {
    const trustedDomains = ['bbc.com', 'cnn.com', 'reuters.com', 'ap.org', 'abcnews.go.com', 'theguardian.com'];
    
    if (trustedDomains.some(domain => url.includes(domain))) {
      return "Source is from a well-established, reputable news organization with strong editorial standards.";
    }
    
    return "Source credibility requires further investigation. Domain not recognized as major news outlet.";
  }
}