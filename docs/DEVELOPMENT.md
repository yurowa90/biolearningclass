# 개발 문서

사용 안내는 [README](../README.md)에 있습니다. 이 문서는 코드를 고치거나 배포하는 사람을 위한 것입니다.

## 기술 구성

- Next.js 16, React 19, TypeScript
- Vinext / Vite
- Cloudflare Worker 호환 빌드 (`worker/index.ts`)
- 화면은 논술형 평가 웹앱과 같은 디자인 토큰을 씁니다.

Node.js 22.13 이상이 필요합니다(`package.json`의 `engines`).

## 실행과 검증

```bash
npm ci
npm run dev
```

```bash
npm run lint
npm test
```

`npm test`는 성취기준 데이터 검증(`npm run curriculum:validate`), 타입 검사, 빌드, `tests/*.test.mjs` 실행을 차례로 합니다. 빌드와 lint는 `scripts/build-verified.sh`·`scripts/sites-env.sh`를 거칩니다.

## 저장소 구조 메모

- `app/page.tsx`: 학생 작업실(`components/student-workspace.tsx`)을 보여 주는 첫 화면입니다.
- `app/student/preview`, `app/teacher/builder`: 지금은 둘 다 `/`로 돌려보냅니다. 교사용 과제 설계 화면 컴포넌트(`components/teacher-builder.tsx`)는 코드에 있지만 공개 경로에는 연결되어 있지 않습니다.
- `data/curriculum-standards.json`: 7과목 97개 성취기준 데이터. `scripts/validate-curriculum-standards.mjs`로 검증합니다.
- `lib/workspace.tsx`: 학생 작성 상태를 브라우저 `sessionStorage`에 임시 저장합니다.
- `db/`, `drizzle/`, `examples/d1/`: 데이터베이스 연결을 위한 자리입니다. 현재 앱은 데이터베이스를 쓰지 않습니다.

## 배포

현재 운영 주소는 https://science-evidence-lab.yurosung.chatgpt.site 입니다.
