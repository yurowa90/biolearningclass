"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  findCurriculumStandard,
  getCurriculumSubject,
} from "@/data/curriculum";
import { evidenceCards } from "@/data/evidence";
import type { CourseId, EvidencePack, RubricCriterion } from "@/lib/domain";

export type StudentStage =
  | "evidence"
  | "observe"
  | "question"
  | "link"
  | "explain"
  | "review";

export interface WorkspaceState {
  schemaVersion: 2;
  teacher: {
    courseId: CourseId;
    standardDomain: string;
    standardCode: string;
    selectedEvidenceIds: string[];
    title: string;
    prompt: string;
    outputType: EvidencePack["targetOutput"];
    disclosurePolicy: EvidencePack["disclosurePolicy"];
    rubric: RubricCriterion[];
    approved: boolean;
  };
  student: {
    stage: StudentStage;
    observation: string;
    question: string;
    linkedEvidenceIds: string[];
    claim: string;
    evidence: string;
    reasoning: string;
    submitted: boolean;
  };
}

export type WorkspaceAction =
  | { type: "COURSE_CHANGED"; courseId: CourseId }
  | { type: "DOMAIN_CHANGED"; standardDomain: string }
  | { type: "STANDARD_CHANGED"; standardCode: string }
  | { type: "EVIDENCE_TOGGLED"; evidenceId: string }
  | { type: "TASK_FIELD_UPDATED"; field: "title" | "prompt"; value: string }
  | {
      type: "OUTPUT_UPDATED";
      value: EvidencePack["targetOutput"];
    }
  | {
      type: "DISCLOSURE_UPDATED";
      value: EvidencePack["disclosurePolicy"];
    }
  | { type: "RUBRIC_UPDATED"; criterionId: string; value: string }
  | { type: "TEACHER_APPROVED" }
  | { type: "STUDENT_STAGE_CHANGED"; stage: StudentStage }
  | {
      type: "STUDENT_TEXT_UPDATED";
      field: "observation" | "question" | "claim" | "evidence" | "reasoning";
      value: string;
    }
  | { type: "STUDENT_EVIDENCE_TOGGLED"; evidenceId: string }
  | { type: "STUDENT_SUBMITTED" }
  | { type: "RESET_DEMO" }
  | { type: "RESTORED"; state: WorkspaceState };

const initialRubric: RubricCriterion[] = [
  {
    id: "rubric-observation",
    label: "자료 관찰",
    description: "자료에서 직접 확인한 수치와 경향을 정확히 구분해 제시한다.",
    maxScore: 4,
  },
  {
    id: "rubric-evidence",
    label: "근거 사용",
    description: "주장을 뒷받침하는 증거를 선택하고 자료 위치를 구체적으로 밝힌다.",
    maxScore: 4,
  },
  {
    id: "rubric-reasoning",
    label: "과학적 추론",
    description: "근거와 주장을 과학 개념으로 연결하고 자료의 한계를 언급한다.",
    maxScore: 4,
  },
];

export const initialWorkspaceState: WorkspaceState = {
  schemaVersion: 2,
  teacher: {
    courseId: "integrated-science-1",
    standardDomain: "시스템과 상호작용",
    standardCode: "10통과1-03-05",
    selectedEvidenceIds: [evidenceCards[0].id],
    title: "온도와 효소 반응 자료 탐구",
    prompt:
      "제시된 자료를 관찰하고, 온도에 따른 효소 반응 속도의 변화를 근거로 설명하십시오.",
    outputType: "cer",
    disclosurePolicy: "stepwise",
    rubric: initialRubric,
    approved: false,
  },
  student: {
    stage: "evidence",
    observation: "",
    question: "",
    linkedEvidenceIds: [],
    claim: "",
    evidence: "",
    reasoning: "",
    submitted: false,
  },
};

function matchingEvidenceIds(courseId: CourseId, standardCode: string) {
  return evidenceCards
    .filter((card) =>
      card.curriculumLinks.some(
        (link) =>
          link.courseId === courseId && link.standardCode === standardCode,
      ),
    )
    .map((card) => card.id);
}

function defaultCurriculumSelection(
  courseId: CourseId,
  requestedDomain?: string,
) {
  const subject = getCurriculumSubject(courseId);
  const domains = requestedDomain
    ? subject?.domains.filter((domain) => domain.name === requestedDomain) ?? []
    : subject?.domains ?? [];

  for (const domain of domains) {
    for (const standard of domain.standards) {
      if (matchingEvidenceIds(courseId, standard.code).length > 0) {
        return { domain: domain.name, standardCode: standard.code };
      }
    }
  }

  const fallbackDomain = domains[0];
  return {
    domain: fallbackDomain?.name ?? "",
    standardCode: fallbackDomain?.standards[0]?.code ?? "",
  };
}

function retainMatchingEvidence(
  currentIds: string[],
  courseId: CourseId,
  standardCode: string,
) {
  const matchingIds = matchingEvidenceIds(courseId, standardCode);
  const retainedIds = currentIds.filter((id) => matchingIds.includes(id));
  return retainedIds.length > 0 ? retainedIds : matchingIds.slice(0, 1);
}

function isRestorableState(value: unknown): value is WorkspaceState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<WorkspaceState>;
  const validCourses: CourseId[] = [
    "integrated-science-1",
    "integrated-science-2",
    "science-inquiry-1",
    "science-inquiry-2",
    "biology",
    "cell-metabolism",
    "genetics",
  ];
  const validStages: StudentStage[] = [
    "evidence",
    "observe",
    "question",
    "link",
    "explain",
    "review",
  ];
  const validOutputs: EvidencePack["targetOutput"][] = [
    "cer",
    "data_essay",
    "debate",
    "oral_defense",
  ];
  const validDisclosures: EvidencePack["disclosurePolicy"][] = [
    "stepwise",
    "teacher_release",
    "after_submit",
  ];
  const teacher = candidate.teacher;
  const student = candidate.student;
  const curriculumMatch = teacher
    ? findCurriculumStandard(teacher.courseId, teacher.standardCode)
    : undefined;
  return (
    candidate.schemaVersion === 2 &&
    Boolean(teacher) &&
    Boolean(student) &&
    validCourses.includes(teacher!.courseId) &&
    typeof teacher!.standardDomain === "string" &&
    typeof teacher!.standardCode === "string" &&
    curriculumMatch?.domain === teacher!.standardDomain &&
    Array.isArray(teacher!.selectedEvidenceIds) &&
    teacher!.selectedEvidenceIds.every((id) => typeof id === "string") &&
    typeof teacher!.title === "string" &&
    typeof teacher!.prompt === "string" &&
    validOutputs.includes(teacher!.outputType) &&
    validDisclosures.includes(teacher!.disclosurePolicy) &&
    Array.isArray(teacher!.rubric) &&
    teacher!.rubric.every(
      (criterion) =>
        typeof criterion.id === "string" &&
        typeof criterion.label === "string" &&
        typeof criterion.description === "string" &&
        typeof criterion.maxScore === "number",
    ) &&
    validStages.includes(student!.stage) &&
    typeof student!.observation === "string" &&
    typeof student!.question === "string" &&
    Array.isArray(student!.linkedEvidenceIds) &&
    typeof student!.claim === "string" &&
    typeof student!.evidence === "string" &&
    typeof student!.reasoning === "string"
  );
}

function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  switch (action.type) {
    case "COURSE_CHANGED": {
      const selection = defaultCurriculumSelection(action.courseId);
      const nextIds = retainMatchingEvidence(
        state.teacher.selectedEvidenceIds,
        action.courseId,
        selection.standardCode,
      );
      return {
        ...state,
        teacher: {
          ...state.teacher,
          courseId: action.courseId,
          standardDomain: selection.domain,
          standardCode: selection.standardCode,
          selectedEvidenceIds: nextIds,
          approved: false,
        },
        student: {
          ...state.student,
          linkedEvidenceIds: state.student.linkedEvidenceIds.filter((id) =>
            nextIds.includes(id),
          ),
        },
      };
    }
    case "DOMAIN_CHANGED": {
      const selection = defaultCurriculumSelection(
        state.teacher.courseId,
        action.standardDomain,
      );
      const nextIds = retainMatchingEvidence(
        state.teacher.selectedEvidenceIds,
        state.teacher.courseId,
        selection.standardCode,
      );
      return {
        ...state,
        teacher: {
          ...state.teacher,
          standardDomain: selection.domain,
          standardCode: selection.standardCode,
          selectedEvidenceIds: nextIds,
          approved: false,
        },
        student: {
          ...state.student,
          linkedEvidenceIds: state.student.linkedEvidenceIds.filter((id) =>
            nextIds.includes(id),
          ),
        },
      };
    }
    case "STANDARD_CHANGED": {
      const curriculumMatch = findCurriculumStandard(
        state.teacher.courseId,
        action.standardCode,
      );
      if (!curriculumMatch) return state;

      const nextIds = retainMatchingEvidence(
        state.teacher.selectedEvidenceIds,
        state.teacher.courseId,
        action.standardCode,
      );
      return {
        ...state,
        teacher: {
          ...state.teacher,
          standardDomain: curriculumMatch.domain,
          standardCode: action.standardCode,
          selectedEvidenceIds: nextIds,
          approved: false,
        },
        student: {
          ...state.student,
          linkedEvidenceIds: state.student.linkedEvidenceIds.filter((id) =>
            nextIds.includes(id),
          ),
        },
      };
    }
    case "EVIDENCE_TOGGLED": {
      const exists = state.teacher.selectedEvidenceIds.includes(action.evidenceId);
      const nextIds = exists
        ? state.teacher.selectedEvidenceIds.filter((id) => id !== action.evidenceId)
        : [...state.teacher.selectedEvidenceIds, action.evidenceId].slice(-2);
      return {
        ...state,
        teacher: {
          ...state.teacher,
          selectedEvidenceIds: nextIds,
          approved: false,
        },
        student: {
          ...state.student,
          linkedEvidenceIds: state.student.linkedEvidenceIds.filter((id) =>
            nextIds.includes(id),
          ),
        },
      };
    }
    case "TASK_FIELD_UPDATED":
      return {
        ...state,
        teacher: {
          ...state.teacher,
          [action.field]: action.value,
          approved: false,
        },
      };
    case "OUTPUT_UPDATED":
      return {
        ...state,
        teacher: {
          ...state.teacher,
          outputType: action.value,
          approved: false,
        },
      };
    case "DISCLOSURE_UPDATED":
      return {
        ...state,
        teacher: {
          ...state.teacher,
          disclosurePolicy: action.value,
          approved: false,
        },
      };
    case "RUBRIC_UPDATED":
      return {
        ...state,
        teacher: {
          ...state.teacher,
          rubric: state.teacher.rubric.map((criterion) =>
            criterion.id === action.criterionId
              ? { ...criterion, description: action.value }
              : criterion,
          ),
          approved: false,
        },
      };
    case "TEACHER_APPROVED":
      return {
        ...state,
        teacher: { ...state.teacher, approved: true },
        student: { ...state.student, submitted: false },
      };
    case "STUDENT_STAGE_CHANGED":
      return {
        ...state,
        student: { ...state.student, stage: action.stage },
      };
    case "STUDENT_TEXT_UPDATED":
      return {
        ...state,
        student: {
          ...state.student,
          [action.field]: action.value,
          submitted: false,
        },
      };
    case "STUDENT_EVIDENCE_TOGGLED": {
      const linked = state.student.linkedEvidenceIds.includes(action.evidenceId);
      return {
        ...state,
        student: {
          ...state.student,
          linkedEvidenceIds: linked
            ? state.student.linkedEvidenceIds.filter((id) => id !== action.evidenceId)
            : [...state.student.linkedEvidenceIds, action.evidenceId],
          submitted: false,
        },
      };
    }
    case "STUDENT_SUBMITTED":
      return {
        ...state,
        student: { ...state.student, submitted: true },
      };
    case "RESTORED":
      return action.state;
    case "RESET_DEMO":
      return initialWorkspaceState;
    default:
      return state;
  }
}

interface WorkspaceContextValue {
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  hydrated: boolean;
  draftStatus: "ready" | "restored" | "changed";
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
const STORAGE_KEY = "science-evidence-student-workspace-v1";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialWorkspaceState);
  const [hydrated, setHydrated] = useReducer(() => true, false);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isRestorableState(parsed)) {
          dispatch({ type: "RESTORED", state: parsed });
        }
      }
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated();
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const draftStatus: WorkspaceContextValue["draftStatus"] = hydrated
    ? "changed"
    : "ready";
  const value = useMemo(
    () => ({ state, dispatch, hydrated, draftStatus }),
    [state, hydrated, draftStatus],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return context;
}

export function isTeacherDraftValid(state: WorkspaceState) {
  return (
    state.teacher.selectedEvidenceIds.length >= 1 &&
    state.teacher.selectedEvidenceIds.length <= 2 &&
    state.teacher.standardDomain.trim().length >= 2 &&
    state.teacher.standardCode.trim().length >= 5 &&
    state.teacher.title.trim().length >= 5 &&
    state.teacher.prompt.trim().length >= 15 &&
    state.teacher.rubric.every(
      (criterion) => criterion.description.trim().length >= 10,
    )
  );
}

export function selectedTeacherCards(state: WorkspaceState) {
  return evidenceCards.filter((card) =>
    state.teacher.selectedEvidenceIds.includes(card.id),
  );
}
