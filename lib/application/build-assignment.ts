import {
  EVIDENCE_PACK_SCHEMA_VERSION,
  RUBRIC_SCHEMA_VERSION,
  TASK_SPEC_SCHEMA_VERSION,
  type EvidencePackV1,
  type RubricV1,
  type StudentEvidenceSnapshotV1,
  type TaskSpecV1,
} from "@/contracts/v1";
import { findCurriculumStandard } from "@/data/curriculum";
import type { EvidenceCard } from "@/lib/domain";
import type { WorkspaceState } from "@/lib/workspace";

function fingerprint(value: unknown) {
  const source = JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return "fnv1a-" + (hash >>> 0).toString(16).padStart(8, "0");
}

function toStudentEvidenceSnapshot(
  card: EvidenceCard,
): StudentEvidenceSnapshotV1 {
  const publicContent = {
    id: card.id,
    title: card.title,
    phenomenon: card.phenomenon,
    chart: card.chart,
    method: card.method,
    limitation: card.limitation,
    source: card.source,
  };

  return {
    ...publicContent,
    revision: card.revision,
    contentFingerprint: fingerprint(publicContent),
  };
}

export function buildEvidencePackV1(
  state: WorkspaceState,
  cards: EvidenceCard[],
): EvidencePackV1 {
  const evidence = cards.map(toStudentEvidenceSnapshot);
  const curriculumMatch = findCurriculumStandard(
    state.teacher.courseId,
    state.teacher.standardCode,
  );
  const curriculumLinks = [
    {
      curriculumVersion: "2022-revised" as const,
      courseId: state.teacher.courseId,
      domain: state.teacher.standardDomain,
      standardCode: state.teacher.standardCode,
      standardText: curriculumMatch?.standard.text,
    },
  ];
  const packFingerprint = fingerprint({
    title: state.teacher.title,
    curriculumLinks,
    evidence: evidence.map((item) => ({
      id: item.id,
      revision: item.revision,
      contentFingerprint: item.contentFingerprint,
    })),
    disclosurePolicy: state.teacher.disclosurePolicy,
  });

  return {
    schemaVersion: EVIDENCE_PACK_SCHEMA_VERSION,
    id: `pack-${packFingerprint.slice(-8)}`,
    title: state.teacher.title,
    curriculumLinks,
    evidence,
    relationship: evidence.length > 1 ? "supporting" : "application",
    disclosurePolicy: state.teacher.disclosurePolicy,
  };
}

export function buildTaskSpecV1(
  state: WorkspaceState,
  pack: EvidencePackV1,
): TaskSpecV1 {
  const taskContent = {
    evidencePackId: pack.id,
    curriculumLinks: pack.curriculumLinks,
    taskType: state.teacher.outputType,
    prompt: state.teacher.prompt,
  };

  return {
    schemaVersion: TASK_SPEC_SCHEMA_VERSION,
    id: `task-${fingerprint(taskContent).slice(-8)}`,
    evidencePackId: pack.id,
    curriculumLinks: pack.curriculumLinks,
    evidenceRefs: pack.evidence.map((item) => ({
      id: item.id,
      revision: item.revision,
      contentFingerprint: item.contentFingerprint,
    })),
    taskType: state.teacher.outputType,
    prompt: state.teacher.prompt,
    conditions: [
      "자료에서 직접 확인한 수치 또는 경향을 한 가지 이상 인용한다.",
      "자료의 한계 또는 추가로 필요한 증거를 한 가지 이상 밝힌다.",
    ],
    evaluationElements: state.teacher.rubric.map((criterion) => criterion.label),
    expectedEvidenceIds: pack.evidence.map((item) => item.id),
  };
}

export function buildRubricV1(
  state: WorkspaceState,
  task: TaskSpecV1,
): RubricV1 {
  const criteria = state.teacher.rubric.map((criterion) => ({
    id: criterion.id,
    label: criterion.label,
    observablePerformance: criterion.description,
    maxScore: criterion.maxScore,
  }));

  return {
    schemaVersion: RUBRIC_SCHEMA_VERSION,
    id: `rubric-${fingerprint({ taskSpecId: task.id, criteria }).slice(-8)}`,
    taskSpecId: task.id,
    criteria,
    totalScore: state.teacher.rubric.reduce(
      (sum, criterion) => sum + criterion.maxScore,
      0,
    ),
    approvalStatus: state.teacher.approved ? "teacher_approved" : "draft",
  };
}

export function buildAssignmentContracts(
  state: WorkspaceState,
  cards: EvidenceCard[],
) {
  const evidencePack = buildEvidencePackV1(state, cards);
  const taskSpec = buildTaskSpecV1(state, evidencePack);
  const rubric = buildRubricV1(state, taskSpec);
  return { evidencePack, taskSpec, rubric };
}
