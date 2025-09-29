import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, Brain, Award, AlertTriangle } from "lucide-react";
import { Trustworthiness } from "@/types/news";

interface TrustworthinessCompartmentProps {
  data: Trustworthiness;
  isLoading: boolean;
}

export const TrustworthinessCompartment = ({ data, isLoading }: TrustworthinessCompartmentProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "success";
    if (score >= 40) return "warning";
    return "destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return "HIGHLY TRUSTWORTHY";
    if (score >= 40) return "MODERATELY TRUSTWORTHY";
    return "LOW TRUSTWORTHINESS";
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'neutral': return 'success';
      case 'positive': return 'secondary';
      case 'negative': return 'warning';
      case 'sensational': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 h-full">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-warning animate-pulse" />
          <h3 className="text-lg font-semibold">Compartment 3: Trustworthiness Assessment</h3>
        </div>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-20 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 h-full border-l-4 border-l-warning">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold">Compartment 3: Trustworthiness Assessment</h3>
        </div>
        <Badge variant={getScoreColor(data.overallScore) as any} className="font-medium">
          {getScoreBadge(data.overallScore)}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Language Analysis */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-warning" />
            <span className="font-medium">Language & Bias Analysis</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Bias Score</span>
                <span className="text-sm font-medium">{data.languageAnalysis.bias}%</span>
              </div>
              <Progress value={data.languageAnalysis.bias} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Credibility</span>
                <span className="text-sm font-medium">{data.languageAnalysis.credibilityScore}%</span>
              </div>
              <Progress value={data.languageAnalysis.credibilityScore} className="h-2" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Emotional Tone:</span>
            <Badge variant={getToneColor(data.languageAnalysis.emotionalTone) as any} className="text-xs">
              {data.languageAnalysis.emotionalTone.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Factual Consistency */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-warning" />
            <span className="font-medium">Factual Consistency</span>
            <span className="text-sm text-muted-foreground">({data.factualConsistency.score}%)</span>
          </div>
          <Progress value={data.factualConsistency.score} className="h-2" />
          
          {data.factualConsistency.inconsistencies.length > 0 && (
            <div className="space-y-2 mt-3">
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  Detected Inconsistencies ({data.factualConsistency.inconsistencies.length})
                </span>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {data.factualConsistency.inconsistencies.map((inconsistency, index) => (
                  <div key={index} className="text-xs p-2 bg-destructive/10 rounded border-l-2 border-destructive">
                    {inconsistency}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Source Credibility */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-warning" />
            <span className="font-medium">Source Credibility</span>
            <span className="text-sm text-muted-foreground">({data.sourceCredibility.score}%)</span>
          </div>
          <Progress value={data.sourceCredibility.score} className="h-2" />
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm">{data.sourceCredibility.reputation}</p>
          </div>
        </div>

        {/* Overall Score */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Overall Trustworthiness Score</span>
            <span className="text-2xl font-bold text-warning">{data.overallScore}%</span>
          </div>
          <Progress value={data.overallScore} className="h-3 mt-2" />
        </div>
      </div>
    </Card>
  );
};