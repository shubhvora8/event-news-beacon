const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FetchNewsRequest {
  query: string;
  sources?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, sources = 'bbc-news,cnn' }: FetchNewsRequest = await req.json();
    console.log('Fetching news:', { query, sources });

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const NEWSAPI_KEY = Deno.env.get('NEWSAPI_KEY');
    if (!NEWSAPI_KEY) {
      throw new Error('NEWSAPI_KEY not configured');
    }

    // Search for articles matching the query
    const searchUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sources=${sources}&sortBy=relevancy&pageSize=10&apiKey=${NEWSAPI_KEY}`;
    
    console.log('Calling NewsAPI...');
    const newsResponse = await fetch(searchUrl);

    if (!newsResponse.ok) {
      const errorText = await newsResponse.text();
      console.error('NewsAPI error:', errorText);
      throw new Error(`NewsAPI returned ${newsResponse.status}: ${errorText}`);
    }

    const newsData = await newsResponse.json();
    console.log('NewsAPI response:', { 
      status: newsData.status, 
      totalResults: newsData.totalResults,
      articlesCount: newsData.articles?.length 
    });

    if (newsData.status !== 'ok') {
      throw new Error(`NewsAPI error: ${newsData.message || 'Unknown error'}`);
    }

    return new Response(
      JSON.stringify({
        articles: newsData.articles || [],
        totalResults: newsData.totalResults || 0
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in fetch-news function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news';
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
