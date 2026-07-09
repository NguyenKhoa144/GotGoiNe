import type { ProcessStep } from "@/data/home";

type HowSectionProps = {
  steps: ProcessStep[];
};

export function HowSection({ steps }: HowSectionProps) {
  return (
    <section className="home-how-section" id="process">
      <div className="home-container home-how-inner">
        <div className="home-section-eyebrow">📦 Quy trình</div>
        <h2 className="home-section-title">
          Từ vườn đến tay bạn
          <br />
          trong 4 bước
        </h2>
        <p className="home-section-sub">
          Quy trình chặt chẽ - để mỗi hộp trái cây đến tay bạn đều tươi, sạch và an toàn tuyệt
          đối.
        </p>
        <div className="home-steps-grid">
          {steps.map((step) => (
            <div className="home-step-card" key={step.number}>
              <div className="home-step-num">{step.number}</div>
              <span className="home-step-icon">{step.icon}</span>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
