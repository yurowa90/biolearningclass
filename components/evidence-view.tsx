import { getCourseLabel } from "@/data/curriculum";
import type { EvidenceCard } from "@/lib/domain";

export function EvidenceView({
  card,
  compact = false,
}: {
  card: EvidenceCard;
  compact?: boolean;
}) {
  return (
    <article className={"paper-panel " + (compact ? "paper-panel-compact" : "")}>
      <div className="paper-meta">
        <span className="status-badge">검수 전 모의 자료</span>
        <span className="record-number">{card.id}</span>
      </div>

      <h2 className="paper-title">{card.title}</h2>
      <p className="paper-lede">{card.phenomenon}</p>

      <figure className="chart-card">
        <figcaption className="chart-title">
          <h3>{card.chart.title}</h3>
          <span>단위 {card.chart.unit}</span>
        </figcaption>
        <div className="bars" aria-hidden="true">
          {card.chart.points.map((point) => (
            <div className="bar-wrap" key={point.label}>
              <div className="bar" style={{ height: point.value + "%" }}>
                <span className="bar-value">{point.displayValue}</span>
              </div>
              <span className="bar-label">{point.label}</span>
            </div>
          ))}
        </div>
        <table className="sr-data-table">
          <caption>{card.chart.title}</caption>
          <thead>
            <tr>
              {card.chart.points.map((point) => (
                <th scope="col" key={point.label}>
                  {point.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {card.chart.points.map((point) => (
                <td key={point.label + point.displayValue}>
                  {point.displayValue} {card.chart.unit}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </figure>

      <dl className="evidence-note">
        <div>
          <dt>자료 생성 방법</dt>
          <dd>{card.method}</dd>
        </div>
        <div>
          <dt>해석의 한계</dt>
          <dd>{card.limitation}</dd>
        </div>
        <div>
          <dt>연계 과목</dt>
          <dd>
            {card.curriculumLinks
              .map((link) => getCourseLabel(link.courseId))
              .join(" · ")}
          </dd>
        </div>
        <div>
          <dt>출처 상태</dt>
          <dd>{card.source.note}</dd>
        </div>
      </dl>
    </article>
  );
}
