import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set(
    "test",
    process.pid + "-" + Date.now() + "-" + pathname,
  );
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost" + pathname, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("기본 주소를 학생용 탐구 화면으로 렌더링한다", async () => {
  const response = await render("/");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(html, /<html[^>]*lang=["']ko["']/i);
  assert.match(html, /<title>과학 증거 탐구 작업실<\/title>/i);
  assert.match(html, /STUDENT INQUIRY · 단계형 증거 읽기/);
  assert.match(html, /자료 보기/);
  assert.match(html, /자료를 천천히 읽습니다/);
  assert.match(html, /10통과1-03-05/);
  assert.doesNotMatch(html, /교사 작업실/);
  assert.doesNotMatch(html, /증거 기반 탐구 과제 설계/);
  assert.doesNotMatch(html, /codex-preview/);
});

test("이전 교사·미리보기 주소를 학생용 기본 주소로 보낸다", async () => {
  for (const pathname of ["/teacher/builder", "/student/preview"]) {
    const response = await render(pathname);
    const location = response.headers.get("location");

    assert.equal(response.status, 307);
    assert.ok(location);
    assert.equal(new URL(location).pathname, "/");
  }
});
