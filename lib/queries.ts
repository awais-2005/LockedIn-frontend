import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, checkpointsApi, coursesApi, daysApi, progressApi } from "./api";

// ---- Auth ----
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    retry: false,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => qc.clear(),
  });
}

// ---- Courses ----
export function useCourses() {
  return useQuery({ queryKey: ["courses"], queryFn: coursesApi.list });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ["courses", courseId],
    queryFn: () => coursesApi.get(courseId),
    enabled: !!courseId,
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: coursesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useAnalyzeCourse() {
  return useMutation({ mutationFn: coursesApi.analyze });
}

export function useConfirmCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: coursesApi.confirm,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

// ---- Days ----
export function useDay(courseId: string, dayNumber: number) {
  return useQuery({
    queryKey: ["courses", courseId, "days", dayNumber],
    queryFn: () => daysApi.get(courseId, dayNumber),
    enabled: !!courseId && !!dayNumber,
  });
}

export function useDayChat(courseId: string, dayNumber: number) {
  return useMutation({
    mutationFn: (message: string) => daysApi.chat(courseId, dayNumber, message),
  });
}

export function useSubmitChallenge(courseId: string, dayNumber: number) {
  return useMutation({
    mutationFn: ({ challengeId, content }: { challengeId: string; content: string }) =>
      daysApi.submitChallenge(courseId, dayNumber, challengeId, content),
  });
}

export function useCompleteDay(courseId: string, dayNumber: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => daysApi.complete(courseId, dayNumber),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses", courseId] });
      qc.invalidateQueries({ queryKey: ["courses", courseId, "progress"] });
    },
  });
}

// ---- Checkpoints ----
export function useCheckpoint(courseId: string, checkpointDay: number) {
  return useQuery({
    queryKey: ["courses", courseId, "checkpoint", checkpointDay],
    queryFn: () => checkpointsApi.get(courseId, checkpointDay),
    enabled: !!courseId && !!checkpointDay,
  });
}

export function useSubmitCheckpoint(courseId: string, checkpointDay: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { answers: Record<string, string>; tab_switch_count: number; time_taken_seconds: number }) =>
      checkpointsApi.submit(courseId, checkpointDay, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses", courseId] });
      qc.invalidateQueries({ queryKey: ["courses", courseId, "progress"] });
    },
  });
}

// ---- Progress ----
export function useProgress(courseId: string) {
  return useQuery({
    queryKey: ["courses", courseId, "progress"],
    queryFn: () => progressApi.get(courseId),
    enabled: !!courseId,
  });
}
