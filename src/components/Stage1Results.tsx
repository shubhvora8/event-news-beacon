import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, XCircle, Shield } from "lucide-react";
import { Stage1Result } from "@/types/stage1";

interface Stage1ResultsProps {
  result: Stage1Result;
}

export const Stage1Results = ({ result }: Stage1ResultsProps) => {
  const getDecisionIcon = () => {
    if (result.decision === 'PASS') {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    return <XCircle className="h-6 w-6 text-red-500" />;
  };

  const getDecisionColor = () => {
    return result.decision === 'PASS' ? 'text-green-600' : 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 0.7) return <Badge variant="default" className="bg-green-500">High</Badge>;
    if (score >= 0.4) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="destructive">Low</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'trusted') return <Badge variant="default" className="bg-green-500">Trusted</Badge>;
    if (status === 'questionable') return <Badge variant="destructive">Questionable</Badge>;
    return <Badge variant="secondary">Unknown</Badge>;
  };

  return (
    <Card className="mb-6 border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl">Stage 1: Pre-Filter Results</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Initial authenticity and quality checks
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Decision */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            {getDecisionIcon()}
            <div>
              <h3 className={`text-xl font-bold ${getDecisionColor()}`}>
                {result.decision}
              </h3>
              <p className="text-sm text-muted-foreground">{result.reason}</p>
            </div>
          </div>
        </div>

        {/* Domain Analysis */}
        {result.domainScore !== undefined && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Domain Analysis
            </h4>
            <div className="space-y-3 pl-7">
              <div className="flex items-center justify-between">
                <span className="text-sm">Domain Trust Score:</span>
                {getScoreBadge(result.domainScore)}
              </div>
              <div>
                <Progress value={result.domainScore * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {(result.domainScore * 100).toFixed(0)}% trusted
                </p>
              </div>
              {result.domainStatus && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  {getStatusBadge(result.domainStatus)}
                </div>
              )}
              {result.domainReason && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Reason:</span> {result.domainReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Content Analysis */}
        {result.contentScore !== undefined && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Content Quality
            </h4>
            <div className="space-y-3 pl-7">
              <div className="flex items-center justify-between">
                <span className="text-sm">Content Score:</span>
                {getScoreBadge(result.contentScore)}
              </div>
              <div>
                <Progress value={result.contentScore * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {(result.contentScore * 100).toFixed(0)}% quality
                </p>
              </div>
              {result.wordCount !== undefined && (
                <p className="text-sm">
                  <span className="font-medium">Word Count:</span> {result.wordCount} words
                </p>
              )}
            </div>
          </div>
        )}

        {/* Overall Authenticity Score */}
        {result.overallAuthenticityScore !== undefined && (
          <div className="bg-primary/5 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Overall Authenticity Score</h4>
            <div className="space-y-2">
              <Progress value={result.overallAuthenticityScore * 100} className="h-3" />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Combined score: 60% domain + 40% content
                </p>
                <span className="text-lg font-bold">
                  {(result.overallAuthenticityScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stage 2 Readiness */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Ready for Stage 2 Analysis:</span>
            {result.readyForStage2 ? (
              <Badge variant="default" className="bg-green-500">
                Yes - Proceeding
              </Badge>
            ) : (
              <Badge variant="destructive">
                No - Blocked
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
