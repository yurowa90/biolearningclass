import type {
  CurriculumReferenceV1,
  StudentEvidenceSnapshotV1,
} from "@/contracts/v1/evidence-pack";
import type { RubricCriterionV1 } from "@/contracts/v1/rubric";
import type { TaskSpecV1 } from "@/contracts/v1/task-spec";

export const STUDENT_TASK_DTO_SCHEMA_VERSION = "student-task.v1" as const;

export interface StudentTaskDTOv1 {
  schemaVersion: typeof STUDENT_TASK_DTO_SCHEMA_VERSION;
  id: string;
  title: string;
  curriculumLinks: CurriculumReferenceV1[];
  evidence: StudentEvidenceSnapshotV1[];
  task: {
    type: TaskSpecV1["taskType"];
    prompt: string;
    conditions: string[];
  };
  rubric: Array<
    Pick<
      RubricCriterionV1,
      "id" | "label" | "observablePerformance" | "maxScore"
    >
  >;
}
