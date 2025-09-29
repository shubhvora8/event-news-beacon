import { useState } from "react";
import { NewsDetectionHeader } from "@/components/NewsDetectionHeader";
import { NewsInputForm } from "@/components/NewsInputForm";
import { AnalysisResults } from "@/components/AnalysisResults";
import { NewsAnalysisService } from "@/services/newsAnalysisService";
import { NewsAnalysis } from "@/types/news";
import { useToast } from "@/components/ui/use-toast";

const NewsVerification = () => {
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async (newsContent: string, sourceUrl?: string) => {
    setIsLoading(true);
    setAnalysis(null);
    
    try {
      toast({
        title: "Analysis Started",
        description: "Running comprehensive verification across all three compartments...",
      });

      const result = await NewsAnalysisService.analyzeNews(newsContent, sourceUrl);
      setAnalysis(result);
      
      toast({
        title: "Analysis Complete",
        description: `News verification completed with ${result.overallVerdict} verdict.`,
        variant: result.overallVerdict === 'VERIFIED' ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "An error occurred during news verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NewsDetectionHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Input Section */}
        <section className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Advanced News Verification System
            </h2>
            <p className="text-muted-foreground">
              Comprehensive analysis through three specialized compartments: Relatability, Legitimacy, and Trustworthiness
            </p>
          </div>
          
          <NewsInputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        </section>

        {/* Analysis Results */}
        <section>
          <AnalysisResults analysis={analysis} isLoading={isLoading} />
        </section>

        {/* Information Footer */}
        <footer className="text-center py-8 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">How Our Verification System Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-primary mb-2">Compartment 1: Relatability</h4>
                <p>Analyzes location context, temporal consistency, and event plausibility to verify if the news content relates to real, verifiable circumstances.</p>
              </div>
              <div>
                <h4 className="font-medium text-accent mb-2">Compartment 2: Legitimacy</h4>
                <p>Cross-references content with authoritative sources like BBC and CNN to verify if the news has been reported by legitimate news organizations.</p>
              </div>
              <div>
                <h4 className="font-medium text-warning mb-2">Compartment 3: Trustworthiness</h4>
                <p>Evaluates language bias, factual consistency, and source credibility to assess the overall trustworthiness of the news content.</p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default NewsVerification;