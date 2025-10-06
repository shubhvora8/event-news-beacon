import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Stage1Request {
  newsContent: string;
  sourceUrl?: string;
}

interface Stage1Result {
  decision: 'PASS' | 'BLOCK';
  reason: string;
  domainScore?: number;
  domainStatus?: string;
  domainReason?: string;
  contentScore?: number;
  overallAuthenticityScore?: number;
  wordCount?: number;
  preprocessingDecision?: string;
  preprocessingReason?: string;
  readyForStage2: boolean;
}

// Domain quality database (converted from Python domain_quality module)
const DOMAIN_QUALITY_DB: Record<string, { score: number; status: string; reason: string; reference: string }> = {
  // Trusted domains
  'bbc.com': { score: 1.0, status: 'trusted', reason: 'Major international news broadcaster', reference: 'BBC News' },
  'bbc.co.uk': { score: 1.0, status: 'trusted', reason: 'Major international news broadcaster', reference: 'BBC News' },
  'cnn.com': { score: 0.95, status: 'trusted', reason: 'Major US news network', reference: 'CNN' },
  'reuters.com': { score: 1.0, status: 'trusted', reason: 'International news agency', reference: 'Reuters' },
  'apnews.com': { score: 1.0, status: 'trusted', reason: 'Associated Press news', reference: 'AP News' },
  'nytimes.com': { score: 0.95, status: 'trusted', reason: 'Major US newspaper', reference: 'New York Times' },
  'theguardian.com': { score: 0.95, status: 'trusted', reason: 'Major UK newspaper', reference: 'The Guardian' },
  'washingtonpost.com': { score: 0.95, status: 'trusted', reason: 'Major US newspaper', reference: 'Washington Post' },
  'abcnews.go.com': { score: 0.9, status: 'trusted', reason: 'Major US news network', reference: 'ABC News' },
  'nbcnews.com': { score: 0.9, status: 'trusted', reason: 'Major US news network', reference: 'NBC News' },
  
  // Questionable domains (examples)
  'infowars.com': { score: 0.1, status: 'questionable', reason: 'Known for conspiracy theories', reference: 'Media Bias Fact Check' },
  'breitbart.com': { score: 0.3, status: 'questionable', reason: 'Far-right bias and mixed factual reporting', reference: 'Media Bias Fact Check' },
  'naturalnews.com': { score: 0.1, status: 'questionable', reason: 'Pseudoscience and conspiracy theories', reference: 'Media Bias Fact Check' },
};

const MIN_ARTICLE_LENGTH = 50;
const MAX_ARTICLE_LENGTH = 10000;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsContent, sourceUrl }: Stage1Request = await req.json();

    if (!newsContent || !newsContent.trim()) {
      return new Response(
        JSON.stringify({ error: 'News content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Stage 1 Filter - Processing article');
    console.log('Source URL:', sourceUrl);
    console.log('Content length:', newsContent.length);

    // Extract domain from URL if provided
    let domain = 'user_input';
    if (sourceUrl) {
      try {
        const url = new URL(sourceUrl);
        domain = url.hostname.toLowerCase().replace(/^www\./, '');
      } catch (e) {
        console.log('Invalid URL, treating as user input');
      }
    }

    // STEP 1: Authenticity Filter - Check Source
    const domainInfo = DOMAIN_QUALITY_DB[domain] || {
      score: 0.5,
      status: 'unknown',
      reason: 'Domain not in database',
      reference: 'Not verified'
    };

    console.log('Domain check:', domain, domainInfo);

    // STEP 2: Authenticity Filter - Check Content
    let contentScore = 0.5; // Base neutral score

    // Check title caps ratio (if we can extract a title from first line or beginning)
    const firstLine = newsContent.split('\n')[0] || newsContent.substring(0, 100);
    const capsRatio = firstLine.split('').filter(c => c === c.toUpperCase() && c !== c.toLowerCase()).length / firstLine.length;
    if (capsRatio > 0.5) {
      contentScore = Math.max(0, contentScore - 0.2);
      console.log('High caps ratio detected:', capsRatio);
    }

    // Word count check
    const wordCount = newsContent.trim().split(/\s+/).length;
    console.log('Word count:', wordCount);
    
    if (wordCount < 50) {
      contentScore = Math.max(0, contentScore - 0.3);
    }

    // Calculate overall authenticity score (60% source + 40% content)
    const overallAuthenticityScore = (domainInfo.score * 0.6) + (contentScore * 0.4);
    console.log('Overall authenticity score:', overallAuthenticityScore);

    // Check authenticity thresholds
    if (overallAuthenticityScore < 0.3) {
      return new Response(
        JSON.stringify({
          decision: 'BLOCK',
          reason: 'Low authenticity score. Article likely unreliable.',
          domainScore: domainInfo.score,
          domainStatus: domainInfo.status,
          domainReason: domainInfo.reason,
          contentScore,
          overallAuthenticityScore,
          wordCount,
          readyForStage2: false
        } as Stage1Result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (wordCount < 20) {
      return new Response(
        JSON.stringify({
          decision: 'BLOCK',
          reason: 'Content too short for reliable analysis.',
          domainScore: domainInfo.score,
          domainStatus: domainInfo.status,
          domainReason: domainInfo.reason,
          contentScore,
          overallAuthenticityScore,
          wordCount,
          readyForStage2: false
        } as Stage1Result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STEP 3: Preprocessor - Apply Processing Rules
    let preprocessingDecision = 'PASS';
    let preprocessingReason = 'Passed preprocessing';

    if (wordCount < MIN_ARTICLE_LENGTH) {
      preprocessingDecision = 'BLOCK';
      preprocessingReason = 'Content too short';
    } else if (wordCount > MAX_ARTICLE_LENGTH) {
      preprocessingDecision = 'BLOCK';
      preprocessingReason = 'Content too long';
    } else if (!firstLine.trim()) {
      preprocessingDecision = 'BLOCK';
      preprocessingReason = 'Missing title or headline';
    }

    console.log('Preprocessing decision:', preprocessingDecision);

    if (preprocessingDecision === 'BLOCK') {
      return new Response(
        JSON.stringify({
          decision: 'BLOCK',
          reason: preprocessingReason,
          domainScore: domainInfo.score,
          domainStatus: domainInfo.status,
          domainReason: domainInfo.reason,
          contentScore,
          overallAuthenticityScore,
          wordCount,
          preprocessingDecision,
          preprocessingReason,
          readyForStage2: false
        } as Stage1Result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PASS - Ready for Stage 2
    console.log('Stage 1 PASSED - Article ready for Stage 2');
    
    return new Response(
      JSON.stringify({
        decision: 'PASS',
        reason: 'Passed all Stage 1 filters',
        domainScore: domainInfo.score,
        domainStatus: domainInfo.status,
        domainReason: domainInfo.reason,
        contentScore,
        overallAuthenticityScore,
        wordCount,
        preprocessingDecision,
        preprocessingReason,
        readyForStage2: true
      } as Stage1Result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in stage1-filter:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
