import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const expectedSubjects = new Map([
  ["integrated-science-1", 16],
  ["integrated-science-2", 15],
  ["science-inquiry-1", 6],
  ["science-inquiry-2", 6],
  ["biology", 19],
  ["cell-metabolism", 18],
  ["genetics", 17],
]);

const source = JSON.parse(
  await readFile(resolve("data/curriculum-standards.json"), "utf8"),
);

if (source.schemaVersion !== "curriculum-standard.v1") {
  throw new Error("Unexpected curriculum schema version.");
}

if (!Array.isArray(source.subjects) || source.subjects.length !== 7) {
  throw new Error("The curriculum must contain exactly seven subjects.");
}

const seenCodes = new Set();
let total = 0;

for (const subject of source.subjects) {
  const expectedCount = expectedSubjects.get(subject.id);
  if (!expectedCount) {
    throw new Error(`Unexpected subject id: ${subject.id}`);
  }

  const standards = subject.domains.flatMap((domain) => domain.standards);
  if (standards.length !== expectedCount) {
    throw new Error(
      `${subject.officialName} count mismatch: ${standards.length}/${expectedCount}`,
    );
  }

  for (const standard of standards) {
    if (seenCodes.has(standard.code)) {
      throw new Error(`Duplicate achievement standard: ${standard.code}`);
    }
    if (!/^\d{2}[가-힣]+\d{0,2}(?:-\d{2}){1,2}$/.test(standard.code)) {
      throw new Error(`Invalid achievement standard code: ${standard.code}`);
    }
    if (!standard.text.endsWith(".")) {
      throw new Error(`Incomplete achievement standard text: ${standard.code}`);
    }
    seenCodes.add(standard.code);
    total += 1;
  }
}

if (total !== 97) {
  throw new Error(`Achievement standard total mismatch: ${total}/97`);
}

const integratedScienceOne = source.subjects.find(
  (subject) => subject.id === "integrated-science-1",
);
const correctedStandard = integratedScienceOne.domains
  .flatMap((domain) => domain.standards)
  .find((standard) => standard.code === "10통과1-03-06");
const expectedCorrectedText =
  "생명 시스템의 유지에 필요한 세포 내 정보의 흐름을 유전자로부터 단백질이 만들어지는 과정을 중심으로 설명할 수 있다.";

if (correctedStandard?.text !== expectedCorrectedText) {
  throw new Error("The verified text for 10통과1-03-06 has changed.");
}

console.log(
  `Validated ${source.subjects.length} subjects, ${source.subjects.reduce(
    (sum, subject) => sum + subject.domains.length,
    0,
  )} domains, and ${total} achievement standards.`,
);
