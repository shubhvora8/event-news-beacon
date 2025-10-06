import { useState } from "react";
import { NewsDetectionHeader } from "@/components/NewsDetectionHeader";
import { NewsInputForm } from "@/components/NewsInputForm";
import { AnalysisResults } from "@/components/AnalysisResults";
import { Stage1Results } from "@/components/Stage1Results";
import { NewsAnalysisService } from "@/services/newsAnalysisService";
import { Stage1Service } from "@/services/stage1Service";
import { NewsAnalysis } from "@/types/news";
import { Stage1Result } from "@/types/stage1";
import { useToast } from "@/components/ui/use-toast";

const NewsVerification = () => {
  const [stage1Result, setStage1Result] = useState<Stage1Result | null>(null);
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async (newsContent: string, sourceUrl?: string) => {
    setIsLoading(true);
    setStage1Result(null);
    setAnalysis(null);
    
    try {
      // STAGE 1: Pre-filter check
      toast({
        title: "Stage 1: Pre-Filter",
        description: "Checking source authenticity and content quality...",
      });

      const stage1 = await Stage1Service.filterNews(newsContent, sourceUrl);
      setStage1Result(stage1);
      
      toast({
        title: "Stage 1 Complete",
        description: `${stage1.decision}: ${stage1.reason}`,
        variant: stage1.decision === 'PASS' ? "default" : "destructive",
      });

      // If Stage 1 blocks the article, don't proceed to Stage 2
      if (!stage1.readyForStage2) {
        toast({
          title: "Analysis Stopped",
          description: "Article did not pass initial quality filters.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // STAGE 2: Full verification (existing 3-compartment system)
      toast({
        title: "Stage 2: Full Verification",
        description: "Running comprehensive analysis across all three compartments...",
      });

      const result = await NewsAnalysisService.analyzeNews(newsContent, sourceUrl);
      setAnalysis(result);
      
      toast({
        title: "Analysis Complete",
        description: `Final Verdict: ${result.overallVerdict}`,
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
              Two-Stage News Verification System
            </h2>
            <p className="text-muted-foreground">
              Stage 1 pre-filters for authenticity, then Stage 2 performs comprehensive analysis through Relatability, Legitimacy, and Trustworthiness
            </p>
          </div>
          
          <NewsInputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        </section>

        {/* Stage 1 Results */}
        {stage1Result && (
          <section>
            <Stage1Results result={stage1Result} />
          </section>
        )}

        {/* Stage 2 Analysis Results (only shown if Stage 1 passed) */}
        {stage1Result?.readyForStage2 && (
          <section>
            <AnalysisResults analysis={analysis} isLoading={isLoading} />
          </section>
        )}

        {/* Information Footer */}
        <footer className="text-center py-8 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Two-Stage Verification Process</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground mb-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-primary mb-2">Stage 1: Pre-Filter</h4>
                <p>Initial quality checks on source authenticity (60%) and content quality (40%). Blocks low-quality articles before deep analysis.</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-accent mb-2">Stage 2: Full Verification</h4>
                <p>Comprehensive analysis through three compartments: Relatability (35%), Legitimacy (50%), and Trustworthiness (15%).</p>
              </div>
            </div>
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