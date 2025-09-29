import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Search, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NewsInputFormProps {
  onAnalyze: (newsContent: string, sourceUrl?: string) => void;
  isLoading: boolean;
}

export const NewsInputForm = ({ onAnalyze, isLoading }: NewsInputFormProps) => {
  const [newsContent, setNewsContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsContent.trim()) {
      onAnalyze(newsContent.trim(), sourceUrl.trim() || undefined);
    }
  };

  return (
    <Card className="p-6 shadow-lg border-0 bg-card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            News Content to Verify
          </label>
          <Textarea
            value={newsContent}
            onChange={(e) => setNewsContent(e.target.value)}
            placeholder="Paste the news article content here for comprehensive verification analysis..."
            className="min-h-[120px] resize-none border-input focus:border-primary"
            required
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Source URL (Optional)
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/news-article"
              className="pl-10 border-input focus:border-primary"
              type="url"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={!newsContent.trim() || isLoading}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-medium py-3"
        >
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? "Analyzing..." : "Start Comprehensive Analysis"}
        </Button>
      </form>
    </Card>
  );
};