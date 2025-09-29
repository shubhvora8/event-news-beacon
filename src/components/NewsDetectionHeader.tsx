import { Shield, Newspaper } from "lucide-react";

export const NewsDetectionHeader = () => {
  return (
    <header className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-6 px-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center gap-3">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8" />
          <Newspaper className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">News Verification System</h1>
          <p className="text-primary-foreground/80 text-sm">Stage 2: Advanced Multi-Compartment Analysis</p>
        </div>
      </div>
    </header>
  );
};