export type SpicinessLevel = 1 | 2 | 3 | 4 | 5;

export interface TaskNode {
  id: string;
  text: string;
  completed: boolean;
  estimatedMinutes?: number;
  isExpanded: boolean;
  isBreakingDown?: boolean;
  isEstimating?: boolean;
  children: TaskNode[];
}

export type ToneStyleKey =
  | 'professor'
  | 'manager'
  | 'polite'
  | 'less_snarky'
  | 'concise'
  | 'apology'
  | 'bullets'
  | 'assertive';

export interface ToneResult {
  subjectLine: string;
  rewrittenText: string;
}

export interface JudgeResult {
  overallTone: string;
  isAngryScore: number;
  subtext: string;
  explanation: string;
  suggestedReply: string;
}