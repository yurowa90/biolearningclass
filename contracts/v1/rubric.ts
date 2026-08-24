export const RUBRIC_SCHEMA_VERSION = "rubric.v1" as const;

export interface RubricCriterionV1 {
  id: string;
  label: string;
  observablePerformance: string;
  maxScore: number;
}

export interface RubricV1 {
  schemaVersion: typeof RUBRIC_SCHEMA_VERSION;
  id: string;
  taskSpecId: string;
  criteria: RubricCriterionV1[];
  totalScore: number;
  approvalStatus: "draft" | "teacher_approved";
}
