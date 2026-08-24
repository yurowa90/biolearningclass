import type { EvidencePackV1 } from "@/contracts/v1/evidence-pack";

export const TASK_SPEC_SCHEMA_VERSION = "task-spec.v1" as const;

export interface TaskSpecV1 {
  schemaVersion: typeof TASK_SPEC_SCHEMA_VERSION;
  id: string;
  evidencePackId: string;
  curriculumLinks: EvidencePackV1["curriculumLinks"];
  evidenceRefs: Array<{
    id: string;
    revision: number;
    contentFingerprint: string;
  }>;
  taskType: "cer" | "data_essay" | "debate" | "oral_defense";
  prompt: string;
  conditions: string[];
  evaluationElements: string[];
  expectedEvidenceIds: string[];
}
