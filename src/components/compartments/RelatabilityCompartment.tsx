import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Clock, Activity } from "lucide-react";
import { RelatabilityCheck } from "@/types/news";

interface RelatabilityCompartmentProps {
  data: RelatabilityCheck;
  isLoading: boolean;
}

export const RelatabilityCompartment = ({ data, isLoading }: RelatabilityCompartmentProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "success";
    if (score >= 40) return "warning";
    return "destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return "HIGH RELATABILITY";
    if (score >= 40) return "MODERATE RELATABILITY";
    return "LOW RELATABILITY";
  };

  if (isLoading) {
    return (
      <Card className="p-6 h-full">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold">Compartment 1: Relatability Analysis</h3>
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
    <Card className="p-6 h-full border-l-4 border-l-primary">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Compartment 1: Relatability Analysis</h3>
        </div>
        <Badge variant={getScoreColor(data.overallScore) as any} className="font-medium">
          {getScoreBadge(data.overallScore)}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Location Analysis */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium">Location Context</span>
            <span className="text-sm text-muted-foreground">({data.location.score}%)</span>
          </div>
          <Progress value={data.location.score} className="h-2" />
          <p className="text-sm text-muted-foreground">{data.location.details}</p>
          {data.location.extractedLocations.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {data.location.extractedLocations.map((location, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {location}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp Analysis */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-medium">Temporal Consistency</span>
            <span className="text-sm text-muted-foreground">({data.timestamp.score}%)</span>
          </div>
          <Progress value={data.timestamp.score} className="h-2" />
          <p className="text-sm text-muted-foreground">{data.timestamp.details}</p>
          {data.timestamp.extractedDates.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {data.timestamp.extractedDates.map((date, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {date}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Event Context */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="font-medium">Event Plausibility</span>
            <span className="text-sm text-muted-foreground">({data.event.score}%)</span>
          </div>
          <Progress value={data.event.score} className="h-2" />
          <p className="text-sm text-muted-foreground">{data.event.details}</p>
          <div className="bg-muted p-3 rounded-md mt-2">
            <p className="text-sm">{data.event.eventContext}</p>
          </div>
        </div>

        {/* Overall Score */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Overall Relatability Score</span>
            <span className="text-2xl font-bold text-primary">{data.overallScore}%</span>
          </div>
          <Progress value={data.overallScore} className="h-3 mt-2" />
        </div>
      </div>
    </Card>
  );
};