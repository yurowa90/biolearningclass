"use client";

import { useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { EvidenceView } from "@/components/evidence-view";
import { findCurriculumStandard, getCourseLabel } from "@/data/curriculum";
import {
  selectedTeacherCards,
  useWorkspace,
  type StudentStage,
} from "@/lib/workspace";

const stages: Array<{ id: StudentStage; label: string }> = [
  { id: "evidence", label: "자료" },
  { id: "observe", label: "관찰" },
  { id: "question", label: "질문" },
  { id: "link", label: "근거" },
  { id: "explain", label: "CER" },
  { id: "review", label: "완료" },
];

export function StudentWorkspace() {
  const { state, dispatch } = useWorkspace();
  const cards = selectedTeacherCards(state);
  const [activeCardId, setActiveCardId] = useState(
    cards[0]?.id ?? "ev-enzyme-temperature",
  );
  const [mobilePanel, setMobilePanel] = useState<"activity" | "evidence">(
    "evidence",
  );
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const currentIndex = stages.findIndex(
    (stage) => stage.id === state.student.stage,
  );
  const currentCard =
    cards.find((card) => card.id === activeCardId) ?? cards[0];
  const selectedStandard = findCurriculumStandard(
    state.teacher.courseId,
    state.teacher.standardCode,
  )?.standard;

  useEffect(() => {
    stageHeadingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [state.student.stage]);

  const canAdvance = {
    evidence: cards.length > 0,
    observe: state.student.observation.trim().length >= 8,
    question: state.student.question.trim().length >= 8,
    link: state.student.linkedEvidenceIds.length >= 1,
    explain:
      state.student.claim.trim().length >= 8 &&
      state.student.evidence.trim().length >= 12 &&
      state.student.reasoning.trim().length >= 12,
    review: true,
  } satisfies Record<StudentStage, boolean>;

  function moveStage(direction: -1 | 1) {
    const nextIndex = Math.min(
      stages.length - 1,
      Math.max(0, currentIndex + direction),
    );
    const nextStage = stages[nextIndex].id;
    setMobilePanel(nextStage === "evidence" ? "evidence" : "activity");
    dispatch({ type: "STUDENT_STAGE_CHANGED", stage: nextStage });
  }

  return (
    <main className="workbench-shell student-shell">
      <AppHeader />

      <div className="student-context">
        <div>
          <p className="eyebrow">STUDENT INQUIRY · 단계형 증거 읽기</p>
          <h1>{state.teacher.title}</h1>
          <p>{state.teacher.prompt}</p>
          <div className="student-standard">
            <strong>
              {getCourseLabel(state.teacher.courseId)} · [
              {state.teacher.standardCode}]
            </strong>
            <span>{selectedStandard?.text}</span>
          </div>
        </div>
        <span className="approved-pill">학생 탐구 활동</span>
      </div>

      <div className="progress-strip student-progress-strip">
        <div className="design-summary" aria-label="현재 탐구 요약">
          <strong>{getCourseLabel(state.teacher.courseId)}</strong>
          <span>{state.teacher.standardCode}</span>
          <span>
            {currentIndex + 1}/{stages.length}단계
          </span>
        </div>
        <span
          className="step-counter"
          aria-label={`현재 ${currentIndex + 1}단계, 전체 ${stages.length}단계`}
        >
          {String(currentIndex + 1).padStart(2, "0")} /{" "}
          {String(stages.length).padStart(2, "0")}
        </span>
        <nav className="student-progress" aria-label="학생 탐구 단계">
          {stages.map((stage, index) => (
            <button
              type="button"
              key={stage.id}
              className={
                "student-progress-item " +
                (state.student.stage === stage.id ? "active" : "") +
                (index < currentIndex ? "complete" : "")
              }
              aria-current={
                state.student.stage === stage.id ? "step" : undefined
              }
              onClick={() => {
                if (index > currentIndex) return;
                setMobilePanel(
                  stage.id === "evidence" ? "evidence" : "activity",
                );
                dispatch({ type: "STUDENT_STAGE_CHANGED", stage: stage.id });
              }}
              disabled={index > currentIndex}
            >
              <span>{index + 1}.</span>
              {stage.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mobile-panel-switch" role="tablist" aria-label="학생 화면 전환">
        <button
          type="button"
          role="tab"
          aria-selected={mobilePanel === "evidence"}
          onClick={() => setMobilePanel("evidence")}
        >
          자료 보기
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePanel === "activity"}
          onClick={() => setMobilePanel("activity")}
        >
          현재 단계
        </button>
      </div>

      <div className="student-grid">
        <section
          className={
            "student-stage-panel " +
            (mobilePanel === "activity" ? "mobile-panel-active" : "")
          }
        >
          <h2 ref={stageHeadingRef} tabIndex={-1}>
            {state.student.stage === "evidence" && "자료를 천천히 읽습니다"}
            {state.student.stage === "observe" && "보이는 사실만 기록합니다"}
            {state.student.stage === "question" && "자료에서 질문을 만듭니다"}
            {state.student.stage === "link" && "설명에 사용할 근거를 고릅니다"}
            {state.student.stage === "explain" && "주장·근거·추론을 연결합니다"}
            {state.student.stage === "review" && "완료 전 내용을 검토합니다"}
          </h2>

          {state.student.stage === "evidence" && (
            <div className="student-instruction">
              <p>
                그래프, 자료 생성 방법, 해석의 한계를 확인하십시오. 전문가
                해설은 아직 공개되지 않습니다.
              </p>
              <ul>
                <li>무엇을 비교했는지 확인합니다.</li>
                <li>단위와 측정값의 범위를 확인합니다.</li>
                <li>자료만으로 알 수 없는 내용을 찾습니다.</li>
              </ul>
            </div>
          )}

          {state.student.stage === "observe" && (
            <label className="student-response">
              <span>관찰 기록</span>
              <small>
                원인을 설명하지 말고 수치·크기·증가·감소를 구체적으로 씁니다.
              </small>
              <textarea
                value={state.student.observation}
                onChange={(event) =>
                  dispatch({
                    type: "STUDENT_TEXT_UPDATED",
                    field: "observation",
                    value: event.target.value,
                  })
                }
                placeholder="예: 37℃에서 산소 발생량이 6.1 mL/min으로 가장 크고, 60℃에서는 0.8 mL/min으로 감소했다."
              />
              <em>{state.student.observation.trim().length}자 · 최소 8자</em>
            </label>
          )}

          {state.student.stage === "question" && (
            <label className="student-response">
              <span>탐구 질문</span>
              <small>
                자료의 변인 또는 관계가 드러나도록 질문형 문장으로 씁니다.
              </small>
              <textarea
                value={state.student.question}
                onChange={(event) =>
                  dispatch({
                    type: "STUDENT_TEXT_UPDATED",
                    field: "question",
                    value: event.target.value,
                  })
                }
                placeholder="예: 온도가 37℃보다 높아질 때 카탈레이스 반응 속도가 감소하는 까닭은 무엇일까?"
              />
              <em>{state.student.question.trim().length}자 · 최소 8자</em>
            </label>
          )}

          {state.student.stage === "link" && (
            <fieldset className="student-evidence-choice">
              <legend>내 설명에 직접 사용할 증거</legend>
              <p>자료를 선택하고, CER의 근거 문장에서 수치를 직접 인용합니다.</p>
              {cards.map((card) => (
                <label key={card.id}>
                  <input
                    type="checkbox"
                    checked={state.student.linkedEvidenceIds.includes(card.id)}
                    onChange={() =>
                      dispatch({
                        type: "STUDENT_EVIDENCE_TOGGLED",
                        evidenceId: card.id,
                      })
                    }
                  />
                  <span>
                    <strong>{card.title}</strong>
                    <small>
                      {card.chart.title} · {card.chart.unit}
                    </small>
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {state.student.stage === "explain" && (
            <div className="cer-editor">
              <label className="student-response cer-field">
                <span>C · 주장</span>
                <small>질문에 대한 현재의 답을 한두 문장으로 씁니다.</small>
                <textarea
                  value={state.student.claim}
                  onChange={(event) =>
                    dispatch({
                      type: "STUDENT_TEXT_UPDATED",
                      field: "claim",
                      value: event.target.value,
                    })
                  }
                />
              </label>
              <label className="student-response cer-field">
                <span>E · 근거</span>
                <small>선택한 자료의 수치·경향·조건을 구체적으로 씁니다.</small>
                <textarea
                  value={state.student.evidence}
                  onChange={(event) =>
                    dispatch({
                      type: "STUDENT_TEXT_UPDATED",
                      field: "evidence",
                      value: event.target.value,
                    })
                  }
                />
              </label>
              <label className="student-response cer-field">
                <span>R · 추론</span>
                <small>
                  과학 개념으로 근거와 주장을 연결하고 자료의 한계를 씁니다.
                </small>
                <textarea
                  value={state.student.reasoning}
                  onChange={(event) =>
                    dispatch({
                      type: "STUDENT_TEXT_UPDATED",
                      field: "reasoning",
                      value: event.target.value,
                    })
                  }
                />
              </label>
            </div>
          )}

          {state.student.stage === "review" && (
            <div className="submission-review">
              {state.student.submitted ? (
                <div className="submission-complete" role="status">
                  <span aria-hidden="true">✓</span>
                  <h3>탐구 결과가 저장되었습니다</h3>
                  <p>
                    실제 학급 제출은 아직 연결되지 않았습니다. 현재 결과는 이
                    브라우저 세션에만 임시 보관됩니다.
                  </p>
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() =>
                      dispatch({
                        type: "STUDENT_STAGE_CHANGED",
                        stage: "explain",
                      })
                    }
                  >
                    CER 다시 확인
                  </button>
                </div>
              ) : (
                <>
                  <dl>
                    <div>
                      <dt>관찰</dt>
                      <dd>{state.student.observation}</dd>
                    </div>
                    <div>
                      <dt>질문</dt>
                      <dd>{state.student.question}</dd>
                    </div>
                    <div>
                      <dt>주장</dt>
                      <dd>{state.student.claim}</dd>
                    </div>
                    <div>
                      <dt>근거</dt>
                      <dd>{state.student.evidence}</dd>
                    </div>
                    <div>
                      <dt>추론</dt>
                      <dd>{state.student.reasoning}</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    className="primary-action"
                    onClick={() => dispatch({ type: "STUDENT_SUBMITTED" })}
                  >
                    탐구 결과 저장
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        <aside
          className={
            "student-evidence-panel " +
            (mobilePanel === "evidence" ? "mobile-panel-active" : "")
          }
        >
          {cards.length > 1 && (
            <div className="selected-card-tabs">
              {cards.map((card) => (
                <button
                  type="button"
                  key={card.id}
                  className={currentCard?.id === card.id ? "active" : ""}
                  onClick={() => setActiveCardId(card.id)}
                >
                  {card.title}
                </button>
              ))}
            </div>
          )}
          {currentCard ? (
            <EvidenceView card={currentCard} compact />
          ) : (
            <div className="empty-state">
              <strong>탐구 자료를 불러오지 못했습니다.</strong>
              <p>페이지를 새로고침한 뒤 다시 확인하십시오.</p>
            </div>
          )}
        </aside>
      </div>

      <div className="student-footer">
        <button
          type="button"
          className="ghost-action"
          disabled={currentIndex === 0}
          onClick={() => moveStage(-1)}
        >
          이전
        </button>
        <span>
          {canAdvance[state.student.stage]
            ? "현재 단계 완료"
            : "필수 기록을 작성하십시오"}
        </span>
        {currentIndex < stages.length - 1 && (
          <button
            type="button"
            className="primary-inline"
            disabled={!canAdvance[state.student.stage]}
            onClick={() => moveStage(1)}
          >
            다음
          </button>
        )}
      </div>
    </main>
  );
}
