import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { NewsAnalysis } from "@/types/news";
import { RelatabilityCompartment } from "./compartments/RelatabilityCompartment";
import { LegitimacyCompartment } from "./compartments/LegitimacyCompartment";
import { TrustworthinessCompartment } from "./compartments/TrustworthinessCompartment";

interface AnalysisResultsProps {
  analysis: NewsAnalysis | null;
  isLoading: boolean;
}

export const AnalysisResults = ({ analysis, isLoading }: AnalysisResultsProps) => {
  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'VERIFIED':
        return <CheckCircle className="w-6 h-6 text-success" />;
      case 'SUSPICIOUS':
        return <AlertTriangle className="w-6 h-6 text-warning" />;
      case 'FAKE':
        return <XCircle className="w-6 h-6 text-destructive" />;
      default:
        return <Shield className="w-6 h-6 text-primary" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'VERIFIED': return 'success';
      case 'SUSPICIOUS': return 'warning';
      case 'FAKE': return 'destructive';
      default: return 'secondary';
    }
  };

  const getVerdictDescription = (verdict: string) => {
    switch (verdict) {
      case 'VERIFIED':
        return 'This news content has been verified through multiple authoritative sources and appears to be legitimate.';
      case 'SUSPICIOUS':
        return 'This news content shows some inconsistencies and requires further verification before trust.';
      case 'FAKE':
        return 'This news content contains significant red flags and appears to be false or misleading.';
      default:
        return 'This news content requires manual review by experts for final verification.';
    }
  };

  if (!analysis && !isLoading) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Ready for Analysis</h3>
        <p className="text-muted-foreground">
          Enter news content above to start the comprehensive verification process.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Verdict Card */}
      {analysis && (
        <Card className="p-6 text-center bg-gradient-to-r from-card to-muted/20">
          <div className="flex items-center justify-center gap-3 mb-4">
            {getVerdictIcon(analysis.overallVerdict)}
            <h2 className="text-2xl font-bold">{analysis.overallVerdict.replace('_', ' ')}</h2>
          </div>
          
          <Badge variant={getVerdictColor(analysis.overallVerdict) as any} className="mb-4 text-lg px-4 py-2">
            Overall Score: {analysis.overallScore}%
          </Badge>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {getVerdictDescription(analysis.overallVerdict)}
          </p>
          
          <div className="mt-6">
            <Progress value={analysis.overallScore} className="h-4" />
          </div>
        </Card>
      )}

      {/* Three Compartments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RelatabilityCompartment 
          data={analysis?.relatability || {} as any} 
          isLoading={isLoading} 
        />
        
        <LegitimacyCompartment 
          data={analysis?.legitimacy || {} as any} 
          isLoading={isLoading} 
        />
        
        <TrustworthinessCompartment 
          data={analysis?.trustworthiness || {} as any} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
};