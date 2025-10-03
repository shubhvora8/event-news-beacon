const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyNewsRequest {
  newsContent: string;
  sourceUrl?: string;
}

interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsContent, sourceUrl }: VerifyNewsRequest = await req.json();
    console.log('Verifying news content:', { 
      contentLength: newsContent?.length, 
      hasUrl: !!sourceUrl 
    });

    if (!newsContent) {
      return new Response(
        JSON.stringify({ error: 'News content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const NEWSAPI_KEY = Deno.env.get('NEWSAPI_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    if (!NEWSAPI_KEY) {
      throw new Error('NEWSAPI_KEY not configured');
    }

    // Extract potential headline and keywords
    const extractSearchTerms = (text: string): { headline: string, keywords: string, entities: string } => {
      // Get first sentence which is often the headline
      const firstLine = text.split('\n')[0].replace(/^['"]|['"]$/g, '').trim();
      
      // Extract proper nouns (capitalized words/phrases)
      const properNouns = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
      const uniqueNouns = [...new Set(properNouns)].slice(0, 4).join(' ');
      
      // Extract important keywords
      const words = text.toLowerCase().split(/\s+/);
      const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'that', 'this', 'it', 'their'];
      const keywords = words.filter(word => word.length > 5 && !stopWords.includes(word)).slice(0, 4).join(' ');
      
      return { headline: firstLine, keywords, entities: uniqueNouns };
    };

    const searchTerms = extractSearchTerms(newsContent);
    console.log('Search terms:', searchTerms);

    // Try multiple search strategies for better results
    const tryBBCSearch = async (): Promise<NewsArticle[]> => {
      const queries = [
        searchTerms.headline.substring(0, 100), // Try headline first
        searchTerms.entities, // Try proper nouns
        searchTerms.keywords // Try keywords as fallback
      ].filter(q => q && q.length > 5);

      for (const query of queries) {
        console.log('Trying BBC search with:', query);
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sources=bbc-news&sortBy=relevancy&pageSize=10&language=en&apiKey=${NEWSAPI_KEY}`;
        
        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.articles && data.articles.length > 0) {
              console.log('BBC search successful with query:', query, 'Found:', data.articles.length);
              return data.articles;
            }
          }
        } catch (error) {
          console.error('BBC search error:', error);
        }
      }
      
      return [];
    };

    const tryCNNSearch = async (): Promise<NewsArticle[]> => {
      const queries = [
        searchTerms.headline.substring(0, 100),
        searchTerms.entities,
        searchTerms.keywords
      ].filter(q => q && q.length > 5);

      for (const query of queries) {
        console.log('Trying CNN search with:', query);
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sources=cnn&sortBy=relevancy&pageSize=10&language=en&apiKey=${NEWSAPI_KEY}`;
        
        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.articles && data.articles.length > 0) {
              console.log('CNN search successful with query:', query, 'Found:', data.articles.length);
              return data.articles;
            }
          }
        } catch (error) {
          console.error('CNN search error:', error);
        }
      }
      
      return [];
    };

    console.log('Fetching from BBC and CNN with multiple strategies...');
    const [bbcArticles, cnnArticles] = await Promise.all([
      tryBBCSearch(),
      tryCNNSearch()
    ]);
    
    const articles: NewsArticle[] = [...bbcArticles, ...cnnArticles];
    
    console.log('Total BBC articles found:', bbcArticles.length);
    console.log('Total CNN articles found:', cnnArticles.length);

    // Create AI prompt with real articles
    const articlesContext = articles.map((article, idx) => 
      `Article ${idx + 1} (${article.source.name}):
Title: ${article.title}
Description: ${article.description || 'N/A'}
Content: ${article.content || 'N/A'}
Published: ${article.publishedAt}
URL: ${article.url}
`).join('\n---\n');

    const prompt = `You are a news verification assistant. Compare the user's news content against real articles from BBC and CNN.

User's News Content:
${newsContent}

${sourceUrl ? `User's Source URL: ${sourceUrl}\n` : ''}

Real Articles from BBC and CNN:
${articlesContext}

Analyze and provide:
1. Whether this content matches any BBC articles (true/false and similarity score 0-100)
2. Whether this content matches any CNN articles (true/false and similarity score 0-100)
3. Overall legitimacy assessment (0-100) - higher if content matches real articles
4. Matching article titles/headlines found
5. Key topics and locations mentioned
6. Date references found
7. Credibility indicators (neutral language, factual tone, matches real articles)
8. Red flags (contradicts real articles, sensationalism, misinformation)

Respond in JSON format only:
{
  "bbcVerified": boolean,
  "bbcSimilarity": number (0-100),
  "bbcArticles": [{"title": string, "similarity": number, "url": string}],
  "cnnVerified": boolean,
  "cnnSimilarity": number (0-100),
  "cnnArticles": [{"title": string, "similarity": number, "url": string}],
  "legitimacyScore": number (0-100),
  "topics": string[],
  "locations": string[],
  "dates": string[],
  "credibilityIndicators": string[],
  "redFlags": string[],
  "overallAssessment": string
}`;

    console.log('Calling Lovable AI for verification...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more factual responses
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway returned ${aiResponse.status}: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received:', { 
      hasChoices: !!aiData.choices?.length 
    });

    const content = aiData.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON from AI response (handle markdown code blocks if present)
    let verificationResult;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      verificationResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }

    console.log('Verification complete:', {
      bbcVerified: verificationResult.bbcVerified,
      cnnVerified: verificationResult.cnnVerified,
      legitimacyScore: verificationResult.legitimacyScore
    });

    return new Response(
      JSON.stringify(verificationResult),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in verify-news function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify news';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
