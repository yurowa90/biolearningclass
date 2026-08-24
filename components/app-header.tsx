"use client";

import Link from "next/link";

export function AppHeader() {
  return (
    <header className="topbar">
      <div className="topbar-line" aria-hidden="true" />
      <div className="topbar-content">
        <Link className="brand brand-link" href="/">
          <span className="brand-kicker">
            SCIENCE INQUIRY · 학생 탐구
          </span>
          <span className="brand-title">과학 증거 탐구 작업실</span>
          <span className="brand-description">
            자료를 관찰하고 질문을 만들며 근거를 바탕으로 과학적으로 설명합니다.
          </span>
        </Link>

        <div className="header-actions">
          <span className="draft-status">
            작성 내용은 이 브라우저 세션에 임시 저장됩니다.
          </span>
          <div className="product-tags" aria-label="도구 범위">
            <span>학생용</span>
            <span>과학과</span>
            <span>2022 개정</span>
          </div>
        </div>
      </div>
    </header>
  );
}
