
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://skillbridge-ai-49ln.onrender.com";

export interface CourseProgress {
  id: number;
  learner_name: string;
  course_title: string;
  progress: number;
  updated_at?: string | null;
}

export interface AssessmentResult {
  id: number;
  learner_name: string;
  assessment_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  created_at?: string | null;
}

export async function getCourseProgress(): Promise<CourseProgress[]> {
  const response = await fetch(`${API_BASE_URL}/api/progress`);

  if (!response.ok) {
    throw new Error("Could not load course progress.");
  }

  return response.json();
}

export async function saveCourseProgress(
  course_title: string,
  progress: number,
  learner_name = "Student",
): Promise<CourseProgress> {
  const response = await fetch(`${API_BASE_URL}/api/progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      learner_name,
      course_title,
      progress,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not save course progress.");
  }

  return response.json();
}

export async function getAssessmentResults(): Promise<AssessmentResult[]> {
  const response = await fetch(`${API_BASE_URL}/api/assessments`);

  if (!response.ok) {
    throw new Error("Could not load assessment results.");
  }

  return response.json();
}

export async function saveAssessmentResult(
  assessment_name: string,
  score: number,
  total_questions: number,
  learner_name = "Student",
): Promise<AssessmentResult> {
  const response = await fetch(`${API_BASE_URL}/api/assessments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      learner_name,
      assessment_name,
      score,
      total_questions,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not save assessment result.");
  }

  return response.json();
}


