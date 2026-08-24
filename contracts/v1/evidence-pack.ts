import type { CourseId, EvidencePoint } from "@/lib/domain";

export const EVIDENCE_PACK_SCHEMA_VERSION = "evidence-pack.v1" as const;

export interface CurriculumReferenceV1 {
  curriculumVersion: "2022-revised";
  courseId: CourseId;
  domain: string;
  standardCode?: string;
  standardText?: string;
}

export interface StudentEvidenceSnapshotV1 {
  id: string;
  revision: number;
  contentFingerprint: string;
  title: string;
  phenomenon: string;
  chart: {
    title: string;
    unit: string;
    points: EvidencePoint[];
  };
  method: string;
  limitation: string;
  source: {
    label: string;
    note: string;
    license: string;
  };
}

export interface EvidencePackV1 {
  schemaVersion: typeof EVIDENCE_PACK_SCHEMA_VERSION;
  id: string;
  title: string;
  curriculumLinks: CurriculumReferenceV1[];
  evidence: StudentEvidenceSnapshotV1[];
  relationship:
    | "same_mechanism"
    | "different_scale"
    | "supporting"
    | "conflicting"
    | "application"
    | "counterexample";
  disclosurePolicy: "stepwise" | "teacher_release" | "after_submit";
}
