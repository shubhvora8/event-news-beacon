export interface Stage1Result {
  decision: 'PASS' | 'BLOCK';
  reason: string;
  domainScore?: number;
  domainStatus?: string;
  domainReason?: string;
  contentScore?: number;
  overallAuthenticityScore?: number;
  wordCount?: number;
  preprocessingDecision?: string;
  preprocessingReason?: string;
  readyForStage2: boolean;
}
