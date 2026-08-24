import {
  STUDENT_TASK_DTO_SCHEMA_VERSION,
  type EvidencePackV1,
  type RubricV1,
  type StudentTaskDTOv1,
  type TaskSpecV1,
} from "@/contracts/v1";

interface AssignmentContractsV1 {
  evidencePack: EvidencePackV1;
  taskSpec: TaskSpecV1;
  rubric: RubricV1;
}

export function projectStudentTaskV1({
  evidencePack,
  taskSpec,
  rubric,
}: AssignmentContractsV1): StudentTaskDTOv1 {
  if (taskSpec.evidencePackId !== evidencePack.id) {
    throw new Error("TaskSpec does not reference the supplied EvidencePack.");
  }
  if (rubric.taskSpecId !== taskSpec.id) {
    throw new Error("Rubric does not reference the supplied TaskSpec.");
  }

  return {
    schemaVersion: STUDENT_TASK_DTO_SCHEMA_VERSION,
    id: taskSpec.id,
    title: evidencePack.title,
    curriculumLinks: evidencePack.curriculumLinks,
    evidence: evidencePack.evidence,
    task: {
      type: taskSpec.taskType,
      prompt: taskSpec.prompt,
      conditions: taskSpec.conditions,
    },
    rubric: rubric.criteria.map((criterion) => ({
      id: criterion.id,
      label: criterion.label,
      observablePerformance: criterion.observablePerformance,
      maxScore: criterion.maxScore,
    })),
  };
}
