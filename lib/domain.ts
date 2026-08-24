export type UserMode = "student" | "teacher";

export type CourseId =
  | "integrated-science-1"
  | "integrated-science-2"
  | "science-inquiry-1"
  | "science-inquiry-2"
  | "biology"
  | "cell-metabolism"
  | "genetics";

export interface CurriculumLink {
  courseId: CourseId;
  domain: string;
  standardCode: string;
}

export interface EvidencePoint {
  label: string;
  value: number;
  displayValue: string;
}

export interface SourceReference {
  label: string;
  note: string;
  license: string;
}

export interface EvidenceCard {
  id: string;
  revision: number;
  title: string;
  phenomenon: string;
  evidenceType: "experiment" | "observation" | "comparison" | "model";
  difficulty: 1 | 2 | 3 | 4 | 5;
  curriculumLinks: CurriculumLink[];
  biologicalScales: string[];
  coreConcepts: string[];
  chart: {
    title: string;
    unit: string;
    points: EvidencePoint[];
  };
  method: string;
  limitation: string;
  source: SourceReference;
  reviewStatus: "draft" | "source_verified" | "published";
}

export interface EvidencePack {
  id: string;
  title: string;
  evidenceCardIds: string[];
  relationship:
    | "same_mechanism"
    | "different_scale"
    | "supporting"
    | "conflicting"
    | "application"
    | "counterexample";
  targetQuestion: string;
  targetOutput: "cer" | "data_essay" | "debate" | "oral_defense";
  disclosurePolicy: "stepwise" | "teacher_release" | "after_submit";
}

export interface TaskSpec {
  id: string;
  evidencePackId: string;
  taskType: EvidencePack["targetOutput"];
  prompt: string;
  conditions: string[];
  evaluationElements: string[];
  expectedEvidence: string[];
}

export interface RubricCriterion {
  id: string;
  label: string;
  description: string;
  maxScore: number;
}

export interface Rubric {
  id: string;
  taskSpecId: string;
  criteria: RubricCriterion[];
}
