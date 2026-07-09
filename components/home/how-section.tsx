import type { ProcessStep } from "@/data/home";

type HowSectionProps = {
  steps: ProcessStep[];
};

export function HowSection({ steps }: HowSectionProps) {
  return (
    <section className="how-section" id="process">
      <div className="container how-inner">
        <div className="section-eyebrow">📦 Quy trình</div>
        <h2 className="section-title">
          Từ vườn đến tay bạn
          <br />
          trong 4 bước
        </h2>
        <p className="section-sub">
          Quy trình chặt chẽ - để mỗi hộp trái cây đến tay bạn đều tươi, sạch và an toàn tuyệt
          đối.
        </p>
        <div className="steps-grid">
          {steps.map((step) => (
            <div className="step-card" key={step.number}>
              <div className="step-num">{step.number}</div>
              <span className="step-icon">{step.icon}</span>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
