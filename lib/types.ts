// Types mirror the FastAPI backend contract exactly. Do not rename fields —
// keep this file as the single source of truth for shapes shared across the app.

export interface User {
  id: string;
  email: string;
  full_name: string;
  [key: string]: unknown;
}

export type DayStatus = "locked" | "unlocked" | "completed";
export type TopicType = "programming" | "theory";
export type ChallengeType = "coding_medium" | "coding_expert" | "mcq" | "scenario";
export type CheckpointType = "big" | "master";
export type CheckpointStatus = "locked" | "available" | "passed" | "failed";

export interface CourseSummary {
  id: string;
  title: string;
  total_days: number;
  completed_days: number;
  status: string;
  created_at: string;
}

export interface CourseDaySummary {
  day_number: number;
  topic_title: string;
  status: DayStatus;
}

export interface CourseDetail {
  id: string;
  title: string;
  total_days: number;
  status: string;
  days: CourseDaySummary[];
}

export interface AnalyzeDraft {
  draft_id: string;
  extracted_title: string;
  detected_explicit_days: number | null;
  recommended_days: number;
  topic_count_estimate: number;
}

export interface Challenge {
  id: string;
  type: ChallengeType;
  prompt: string;
  language: string | null;
  difficulty: string;
}

export interface DayDetail {
  day_number: number;
  topic_title: string;
  topic_type: TopicType;
  content_technical: string;
  content_simple: string;
  status: DayStatus;
  challenges: Challenge[];
}

export interface ChatReply {
  reply: string;
}

export interface ChallengeSubmitResult {
  is_correct: boolean;
  feedback: string;
}

export interface CompleteDayResult {
  status: "completed";
}

export interface CompleteDayBlocked {
  reason: string;
  checkpoint_day?: number;
}

export interface CheckpointQuestion {
  id: string;
  prompt: string;
  options: string[];
}

export interface CheckpointQuiz {
  quiz_id: string;
  quiz_type: CheckpointType;
  questions: CheckpointQuestion[];
}

export interface CheckpointSubmitResult {
  score: number;
  passed: boolean;
  feedback: string;
}

export interface ProgressCheckpoint {
  day: number;
  type: CheckpointType;
  status: CheckpointStatus;
}

export interface CourseProgress {
  completed_days: number;
  total_days: number;
  percent: number;
  current_day: number;
  checkpoints: ProgressCheckpoint[];
}
