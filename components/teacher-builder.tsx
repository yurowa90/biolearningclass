"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { EvidenceView } from "@/components/evidence-view";
import {
  curriculumData,
  curriculumSubjects,
  findCurriculumStandard,
  getCurriculumSubject,
  getStandardsForDomain,
} from "@/data/curriculum";
import { evidenceCards } from "@/data/evidence";
import type { CourseId } from "@/lib/domain";
import {
  isTeacherDraftValid,
  selectedTeacherCards,
  useWorkspace,
} from "@/lib/workspace";

const stepLabels = ["성취기준·증거", "과제 설계", "채점 기준", "승인·미리보기"];

const outputLabels = {
  cer: "CER 설명문",
  data_essay: "자료 해석형 논술",
  debate: "근거 기반 토론",
  oral_defense: "자료 제시형 구술",
};

const disclosureLabels = {
  stepwise: "관찰·질문 뒤 단계적으로 공개",
  teacher_release: "교사가 수동으로 공개",
  after_submit: "최종 제출 뒤 해설 공개",
};

export function TeacherBuilder() {
  const router = useRouter();
  const { state, dispatch } = useWorkspace();
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("");
  const [mobilePanel, setMobilePanel] = useState<"settings" | "preview">(
    "settings",
  );
  const teacher = state.teacher;
  const selectedCards = selectedTeacherCards(state);
  const currentCourse = curriculumSubjects.find(
    (subject) => subject.id === teacher.courseId,
  );

  const domainOptions = useMemo(
    () => getCurriculumSubject(teacher.courseId)?.domains ?? [],
    [teacher.courseId],
  );

  const standardOptions = useMemo(
    () =>
      getStandardsForDomain(teacher.courseId, teacher.standardDomain),
    [teacher.courseId, teacher.standardDomain],
  );

  const availableCards = useMemo(
    () =>
      evidenceCards.filter((card) =>
        card.curriculumLinks.some(
          (link) =>
            link.courseId === teacher.courseId &&
            link.standardCode === teacher.standardCode,
        ),
      ),
    [teacher.courseId, teacher.standardCode],
  );

  const selectedStandard = findCurriculumStandard(
    teacher.courseId,
    teacher.standardCode,
  )?.standard;

  const matchedCards = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ko-KR");
    if (!normalized) return availableCards;
    return availableCards.filter((card) =>
      [card.title, card.phenomenon, ...card.coreConcepts]
        .join(" ")
        .toLocaleLowerCase("ko-KR")
        .includes(normalized),
    );
  }, [availableCards, query]);

  const stepReady = [
    teacher.standardDomain.length > 0 &&
      teacher.standardCode.length > 0 &&
      teacher.selectedEvidenceIds.length >= 1 &&
      teacher.selectedEvidenceIds.length <= 2,
    teacher.title.trim().length >= 5 && teacher.prompt.trim().length >= 15,
    teacher.rubric.every(
      (criterion) => criterion.description.trim().length >= 10,
    ),
    isTeacherDraftValid(state),
  ];

  function approveAndPreview() {
    if (!isTeacherDraftValid(state)) return;
    dispatch({ type: "TEACHER_APPROVED" });
    dispatch({ type: "STUDENT_STAGE_CHANGED", stage: "evidence" });
    router.push("/student/preview");
  }

  return (
    <main className="workbench-shell">
      <AppHeader />

      <div className="builder-heading">
        <div>
          <p className="eyebrow">TEACHER WORKSPACE · 증거 기반 탐구 설계</p>
          <h1>증거 기반 탐구 과제 설계</h1>
          <p>
            카드 1∼2개를 묶어 과제와 채점 기준을 만들고, 같은 상태를 학생
            화면에서 확인합니다.
          </p>
        </div>
        <div className="approval-state">
          <span className={teacher.approved ? "approved-dot" : "draft-dot"} />
          {teacher.approved ? "교사 승인 초안" : "편집 중"}
        </div>
      </div>

      <div className="progress-strip">
        <div className="design-summary" aria-label="현재 설계 요약">
          <strong>{currentCourse?.officialName}</strong>
          <span>{teacher.standardCode}</span>
          <span>증거 {selectedCards.length}개</span>
          <span>
            총 {teacher.rubric.reduce((sum, item) => sum + item.maxScore, 0)}점
          </span>
        </div>
        <span
          className="step-counter"
          aria-label={`현재 ${step + 1}단계, 전체 ${stepLabels.length}단계`}
        >
          {String(step + 1).padStart(2, "0")} /{" "}
          {String(stepLabels.length).padStart(2, "0")}
        </span>
        <nav className="builder-steps" aria-label="과제 제작 단계">
          {stepLabels.map((label, index) => (
            <button
              type="button"
              key={label}
              className={
                "builder-step " +
                (step === index ? "active" : "") +
                (stepReady[index] ? " complete" : "")
              }
              aria-current={step === index ? "step" : undefined}
              onClick={() => setStep(index)}
            >
              <span>{index + 1}.</span>
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mobile-panel-switch" role="tablist" aria-label="교사 화면 전환">
        <button
          type="button"
          role="tab"
          aria-selected={mobilePanel === "settings"}
          onClick={() => setMobilePanel("settings")}
        >
          설정
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePanel === "preview"}
          onClick={() => setMobilePanel("preview")}
        >
          결과 미리보기
        </button>
      </div>

      <div className="builder-grid">
        <section
          className={
            "builder-editor " +
            (mobilePanel === "settings" ? "mobile-panel-active" : "")
          }
        >
          {step === 0 && (
            <>
              <div className="panel-heading">
                <p className="eyebrow">01 · CURRICULUM &amp; EVIDENCE</p>
                <h2>수업의 기준과 증거를 선택합니다</h2>
                <p>증거 카드는 최대 2개까지 묶을 수 있습니다.</p>
              </div>

              <div className="form-grid two-columns">
                <label className="field">
                  <span>과목</span>
                  <select
                    value={teacher.courseId}
                    onChange={(event) =>
                      dispatch({
                        type: "COURSE_CHANGED",
                        courseId: event.target.value as CourseId,
                      })
                    }
                  >
                    {curriculumSubjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.officialName}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="field">
                  <span>성취기준 연계 영역</span>
                  <select
                    value={teacher.standardDomain}
                    onChange={(event) =>
                      dispatch({
                        type: "DOMAIN_CHANGED",
                        standardDomain: event.target.value,
                      })
                    }
                  >
                    {domainOptions.map((domain) => (
                      <option key={domain.name} value={domain.name}>
                        {domain.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field full-span">
                  <span>성취기준</span>
                  <select
                    value={teacher.standardCode}
                    onChange={(event) =>
                      dispatch({
                        type: "STANDARD_CHANGED",
                        standardCode: event.target.value,
                      })
                    }
                  >
                    {standardOptions.map((standard) => (
                      <option key={standard.code} value={standard.code}>
                        [{standard.code}] {standard.text}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <p className="source-warning">
                {curriculumData.source.title} 원문과 대조한 7과목 97개
                성취기준입니다. {" "}
                <a
                  href={curriculumData.source.ministryNoticeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  교육부 고시 확인
                </a>
                {" · "}
                <a
                  href={curriculumData.source.ncicOriginalUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  NCIC 원문 확인
                </a>
              </p>

              <fieldset className="evidence-picker">
                <legend>증거 카드 선택</legend>
                <label className="evidence-search">
                  <span>카드 검색</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="현상·개념·카드 제목"
                  />
                </label>
                {matchedCards.map((card) => {
                  const checked = teacher.selectedEvidenceIds.includes(card.id);
                  const disabled =
                    !checked && teacher.selectedEvidenceIds.length >= 2;
                  return (
                    <label
                      className={
                        "picker-card " +
                        (checked ? "selected" : "") +
                        (disabled ? "disabled" : "")
                      }
                      key={card.id}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() =>
                          dispatch({
                            type: "EVIDENCE_TOGGLED",
                            evidenceId: card.id,
                          })
                        }
                      />
                      <span className="picker-copy">
                        <small>
                          {card.evidenceType} · 난이도 {card.difficulty}
                        </small>
                        <strong>{card.title}</strong>
                        <span>{card.coreConcepts.join(" · ")}</span>
                      </span>
                      <span className="picker-status">검수 전</span>
                    </label>
                  );
                })}
                {matchedCards.length === 0 && (
                  <div className="empty-state">
                    <strong>조건에 맞는 카드가 없습니다.</strong>
                    <p>
                      이 성취기준에 연결된 검수 전 카드가 아직 없습니다. 다른
                      성취기준을 선택하십시오.
                    </p>
                  </div>
                )}
              </fieldset>
            </>
          )}

          {step === 1 && (
            <>
              <div className="panel-heading">
                <p className="eyebrow">02 · TASK SPECIFICATION</p>
                <h2>학생이 무엇을 하게 할지 명확히 씁니다</h2>
                <p>AI 생성 없이 교사가 직접 작성하는 첫 과제 명세입니다.</p>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>과제 제목</span>
                  <input
                    value={teacher.title}
                    onChange={(event) =>
                      dispatch({
                        type: "TASK_FIELD_UPDATED",
                        field: "title",
                        value: event.target.value,
                      })
                    }
                  />
                </label>

                <label className="field">
                  <span>학생 발문</span>
                  <textarea
                    value={teacher.prompt}
                    onChange={(event) =>
                      dispatch({
                        type: "TASK_FIELD_UPDATED",
                        field: "prompt",
                        value: event.target.value,
                      })
                    }
                  />
                  <small>{teacher.prompt.trim().length}자 · 최소 15자</small>
                </label>

                <div className="form-grid two-columns">
                  <label className="field">
                    <span>학생 결과물</span>
                    <select
                      value={teacher.outputType}
                      onChange={(event) =>
                        dispatch({
                          type: "OUTPUT_UPDATED",
                          value: event.target
                            .value as keyof typeof outputLabels,
                        })
                      }
                    >
                      {Object.entries(outputLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>자료 공개 순서</span>
                    <select
                      value={teacher.disclosurePolicy}
                      onChange={(event) =>
                        dispatch({
                          type: "DISCLOSURE_UPDATED",
                          value: event.target
                            .value as keyof typeof disclosureLabels,
                        })
                      }
                    >
                      {Object.entries(disclosureLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="panel-heading">
                <p className="eyebrow">03 · RUBRIC</p>
                <h2>관찰 가능한 수행으로 채점 기준을 씁니다</h2>
                <p>각 기준은 하나의 핵심 수행만 판단하도록 구성합니다.</p>
              </div>

              <div className="rubric-editor">
                {teacher.rubric.map((criterion, index) => (
                  <label className="rubric-row" key={criterion.id}>
                    <span className="rubric-number">0{index + 1}</span>
                    <span className="rubric-label">
                      <strong>{criterion.label}</strong>
                      <small>{criterion.maxScore}점</small>
                    </span>
                    <textarea
                      value={criterion.description}
                      onChange={(event) =>
                        dispatch({
                          type: "RUBRIC_UPDATED",
                          criterionId: criterion.id,
                          value: event.target.value,
                        })
                      }
                    />
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="panel-heading">
                <p className="eyebrow">04 · REVIEW &amp; APPROVE</p>
                <h2>학생에게 보일 내용을 최종 확인합니다</h2>
                <p>
                  이 단계의 승인은 실제 게시가 아니라 학생 화면 미리보기를 위한
                  교사 승인입니다.
                </p>
              </div>

              <div className="review-sheet">
                <dl>
                  <div>
                    <dt>과목·영역</dt>
                    <dd>
                      {
                        curriculumSubjects.find(
                          (subject) => subject.id === teacher.courseId,
                        )?.officialName
                      }{" "}
                      · {teacher.standardDomain}
                    </dd>
                  </div>
                  <div>
                    <dt>성취기준</dt>
                    <dd>
                      [{teacher.standardCode}] {selectedStandard?.text}
                    </dd>
                  </div>
                  <div>
                    <dt>과제</dt>
                    <dd>{teacher.title}</dd>
                  </div>
                  <div>
                    <dt>발문</dt>
                    <dd>{teacher.prompt}</dd>
                  </div>
                  <div>
                    <dt>자료</dt>
                    <dd>{selectedCards.map((card) => card.title).join(" / ")}</dd>
                  </div>
                  <div>
                    <dt>결과물</dt>
                    <dd>{outputLabels[teacher.outputType]}</dd>
                  </div>
                  <div>
                    <dt>채점</dt>
                    <dd>
                      {teacher.rubric.length}개 기준 · 총{" "}
                      {teacher.rubric.reduce(
                        (sum, criterion) => sum + criterion.maxScore,
                        0,
                      )}
                      점
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="primary-action"
                  disabled={!isTeacherDraftValid(state)}
                  onClick={approveAndPreview}
                >
                  교사 승인 후 학생 화면 열기
                </button>
              </div>
            </>
          )}

          <div className="builder-footer">
            <button
              type="button"
              className="ghost-action"
              disabled={step === 0}
              onClick={() => setStep((current) => Math.max(0, current - 1))}
            >
              이전
            </button>
            <span>
              {stepReady[step] ? "현재 단계 완료" : "필수 항목을 확인하십시오"}
            </span>
            {step < stepLabels.length - 1 && (
              <button
                type="button"
                className="primary-inline"
                disabled={!stepReady[step]}
                onClick={() =>
                  setStep((current) =>
                    Math.min(stepLabels.length - 1, current + 1),
                  )
                }
              >
                다음 단계
              </button>
            )}
          </div>
        </section>

        <aside
          className={
            "builder-preview " +
            (mobilePanel === "preview" ? "mobile-panel-active" : "")
          }
          aria-label="선택 내용 미리보기"
        >
          <div className="preview-document-meta">
            <strong>과학 증거 탐구 문서</strong>
            <span>학생용</span>
            <span>{teacher.approved ? "승인 초안" : "초안"}</span>
          </div>
          <div className="preview-header">
            <p className="eyebrow">결과 미리보기</p>
            <h2>학생 화면에 전달될 자료</h2>
          </div>
          <div className="preview-summary">
            <span>
              {teacher.standardCode
                ? `[${teacher.standardCode}] ${teacher.standardDomain}`
                : "성취기준 미선택"}
            </span>
            <strong>{teacher.title || "과제 제목을 입력하십시오"}</strong>
            <p>{teacher.prompt || "학생 발문이 여기에 표시됩니다."}</p>
            {selectedStandard && (
              <small className="standard-summary">{selectedStandard.text}</small>
            )}
          </div>
          {selectedCards.length > 0 ? (
            <>
              <div className="selected-card-tabs">
                {selectedCards.map((card) => (
                  <span key={card.id}>{card.title}</span>
                ))}
              </div>
              <EvidenceView card={selectedCards[0]} compact />
            </>
          ) : (
            <div className="empty-state">
              <strong>선택된 증거 카드가 없습니다.</strong>
              <p>왼쪽에서 카드 1∼2개를 선택하십시오.</p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
