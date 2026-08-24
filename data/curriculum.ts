import curriculumSource from "@/data/curriculum-standards.json";
import type { CourseId } from "@/lib/domain";

export interface CurriculumStandard {
  code: string;
  text: string;
}

export interface CurriculumDomain {
  name: string;
  standards: CurriculumStandard[];
}

export interface CurriculumSubject {
  id: CourseId;
  officialName: string;
  subjectType: string;
  domains: CurriculumDomain[];
}

interface CurriculumDataset {
  schemaVersion: "curriculum-standard.v1";
  curriculumVersion: string;
  source: {
    title: string;
    ministryNoticeUrl: string;
    ncicOriginalUrl: string;
    extractionNote: string;
  };
  subjects: CurriculumSubject[];
}

export const curriculumData = curriculumSource as CurriculumDataset;
export const curriculumSubjects = curriculumData.subjects;

export function getCurriculumSubject(courseId: CourseId) {
  return curriculumSubjects.find((subject) => subject.id === courseId);
}

export function getCourseLabel(courseId: CourseId) {
  return getCurriculumSubject(courseId)?.officialName ?? courseId;
}

export function getStandardsForDomain(courseId: CourseId, domainName: string) {
  return (
    getCurriculumSubject(courseId)?.domains.find(
      (domain) => domain.name === domainName,
    )?.standards ?? []
  );
}

export function findCurriculumStandard(courseId: CourseId, code: string) {
  const subject = getCurriculumSubject(courseId);
  if (!subject) return undefined;

  for (const domain of subject.domains) {
    const standard = domain.standards.find((item) => item.code === code);
    if (standard) return { domain: domain.name, standard };
  }

  return undefined;
}
