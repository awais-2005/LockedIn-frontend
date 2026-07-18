import type {
  AnalyzeDraft,
  ChatReply,
  ChallengeSubmitResult,
  CheckpointQuiz,
  CheckpointSubmitResult,
  CompleteDayResult,
  CourseDetail,
  CourseProgress,
  CourseSummary,
  DayDetail,
  User,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      ...(init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!res.ok) {
    let body: unknown = undefined;
    try {
      body = await res.json();
    } catch {
      // no JSON body
    }
    let message = `Request failed with status ${res.status}`;
    if (body && typeof body === "object" && "message" in body && typeof (body as { message?: unknown }).message !== "undefined") {
      message = String((body as { message?: unknown }).message);
    }
    throw new ApiError(res.status, message, body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function post<T>(path: string, body?: unknown) {
  return request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
}

// ---- Auth ----
export const authApi = {
  signup: (data: { email: string; password: string; full_name: string }) =>
    post<{ message: string }>("/api/auth/signup", data),
  verifyOtp: (data: { email: string; otp: string }) => post<{ user: User }>("/api/auth/verify-otp", data),
  resendOtp: (data: { email: string }) => post<{ message: string }>("/api/auth/resend-otp", data),
  login: (data: { email: string; password: string }) => post<{ user: User }>("/api/auth/login", data),
  google: (data: { id_token: string }) => post<{ user: User }>("/api/auth/google", data),
  logout: () => post<{ message: string }>("/api/auth/logout"),
  me: () => request<{ user: User }>("/api/auth/me"),
};

// ---- Courses ----
export const coursesApi = {
  analyze: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<AnalyzeDraft>("/api/courses/analyze", { method: "POST", body: form });
  },
  confirm: (data: { draft_id: string; chosen_days: number }) =>
    post<{ course: CourseDetail }>("/api/courses/confirm", data),
  list: () => request<CourseSummary[]>("/api/courses"),
  get: (courseId: string) => request<CourseDetail>(`/api/courses/${courseId}`),
  remove: (courseId: string) => request<void>(`/api/courses/${courseId}`, { method: "DELETE" }),
};

// ---- Days ----
export const daysApi = {
  get: (courseId: string, dayNumber: number) =>
    request<DayDetail>(`/api/courses/${courseId}/days/${dayNumber}`),
  chat: (courseId: string, dayNumber: number, message: string) =>
    post<ChatReply>(`/api/courses/${courseId}/days/${dayNumber}/chat`, { message }),
  submitChallenge: (courseId: string, dayNumber: number, challengeId: string, content: string) =>
    post<ChallengeSubmitResult>(
      `/api/courses/${courseId}/days/${dayNumber}/challenges/${challengeId}/submit`,
      { content }
    ),
  complete: (courseId: string, dayNumber: number) =>
    post<CompleteDayResult>(`/api/courses/${courseId}/days/${dayNumber}/complete`),
};

// ---- Checkpoints ----
export const checkpointsApi = {
  get: (courseId: string, checkpointDay: number) =>
    request<CheckpointQuiz>(`/api/courses/${courseId}/checkpoint/${checkpointDay}`),
  submit: (
    courseId: string,
    checkpointDay: number,
    data: { answers: Record<string, string>; tab_switch_count: number; time_taken_seconds: number }
  ) => post<CheckpointSubmitResult>(`/api/courses/${courseId}/checkpoint/${checkpointDay}/submit`, data),
};

// ---- Progress ----
export const progressApi = {
  get: (courseId: string) => request<CourseProgress>(`/api/courses/${courseId}/progress`),
};
