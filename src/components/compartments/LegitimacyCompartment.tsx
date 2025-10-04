import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { LegitimacyCheck, NewsSource } from "@/types/news";
import { Button } from "@/components/ui/button";

interface LegitimacyCompartmentProps {
  data: LegitimacyCheck;
  isLoading: boolean;
}

export const LegitimacyCompartment = ({ data, isLoading }: LegitimacyCompartmentProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "success";
    if (score >= 40) return "warning";
    return "destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return "VERIFIED LEGITIMATE";
    if (score >= 40) return "PARTIALLY VERIFIED";
    return "UNVERIFIED";
  };

  const renderNewsSource = (source: NewsSource, index: number) => (
    <div key={index} className="p-3 bg-muted rounded-md space-y-2">
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-sm line-clamp-2">{source.title}</h4>
        <Badge variant="outline" className="text-xs ml-2">
          {Math.round(source.similarity)}% match
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">{source.excerpt}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{source.publishDate}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          onClick={() => window.open(source.url, '_blank')}
        >
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="p-6 h-full">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-accent animate-pulse" />
          <h3 className="text-lg font-semibold">Compartment 2: Legitimacy Verification</h3>
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
    <Card className="p-6 h-full border-l-4 border-l-accent">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold">Compartment 2: Legitimacy Verification</h3>
        </div>
        <Badge variant={getScoreColor(data.overallScore) as any} className="font-medium">
          {getScoreBadge(data.overallScore)}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* BBC Verification */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {data.bbcVerification.found ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive" />
              )}
              <span className="font-medium">BBC News Verification</span>
            </div>
            <Badge variant={data.bbcVerification.found ? "success" : "destructive"} className="text-xs">
              {data.bbcVerification.found ? "FOUND" : "NOT FOUND"}
            </Badge>
          </div>
          
          {data.bbcVerification.found && (
            <>
              <Progress value={data.bbcVerification.similarity} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {data.bbcVerification.similarity}% content similarity with BBC sources
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {data.bbcVerification.matchingArticles.map(renderNewsSource)}
              </div>
            </>
          )}
        </div>

        {/* CNN Verification */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {data.cnnVerification.found ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive" />
              )}
              <span className="font-medium">CNN News Verification</span>
            </div>
            <Badge variant={data.cnnVerification.found ? "success" : "destructive"} className="text-xs">
              {data.cnnVerification.found ? "FOUND" : "NOT FOUND"}
            </Badge>
          </div>
          
          {data.cnnVerification.found && (
            <>
              <Progress value={data.cnnVerification.similarity} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {data.cnnVerification.similarity}% content similarity with CNN sources
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {data.cnnVerification.matchingArticles.map(renderNewsSource)}
              </div>
            </>
          )}
        </div>

        {/* ABC News Verification */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {data.abcVerification.found ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive" />
              )}
              <span className="font-medium">ABC News Verification</span>
            </div>
            <Badge variant={data.abcVerification.found ? "success" : "destructive"} className="text-xs">
              {data.abcVerification.found ? "FOUND" : "NOT FOUND"}
            </Badge>
          </div>
          
          {data.abcVerification.found && (
            <>
              <Progress value={data.abcVerification.similarity} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {data.abcVerification.similarity}% content similarity with ABC News sources
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {data.abcVerification.matchingArticles.map(renderNewsSource)}
              </div>
            </>
          )}
        </div>

        {/* Guardian Verification */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {data.guardianVerification.found ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive" />
              )}
              <span className="font-medium">The Guardian Verification</span>
            </div>
            <Badge variant={data.guardianVerification.found ? "success" : "destructive"} className="text-xs">
              {data.guardianVerification.found ? "FOUND" : "NOT FOUND"}
            </Badge>
          </div>
          
          {data.guardianVerification.found && (
            <>
              <Progress value={data.guardianVerification.similarity} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {data.guardianVerification.similarity}% content similarity with Guardian sources
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {data.guardianVerification.matchingArticles.map(renderNewsSource)}
              </div>
            </>
          )}
        </div>

        {/* Cross Reference Analysis */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            <span className="font-medium">Cross-Reference Score</span>
            <span className="text-sm text-muted-foreground">({data.crossReference.score}%)</span>
          </div>
          <Progress value={data.crossReference.score} className="h-2" />
          <p className="text-sm text-muted-foreground">{data.crossReference.details}</p>
        </div>

        {/* Overall Score */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Overall Legitimacy Score</span>
            <span className="text-2xl font-bold text-accent">{data.overallScore}%</span>
          </div>
          <Progress value={data.overallScore} className="h-3 mt-2" />
        </div>
      </div>
    </Card>
  );
};