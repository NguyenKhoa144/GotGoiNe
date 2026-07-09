import type { WhyReason } from "@/data/home";

type WhySectionProps = {
  reasons: WhyReason[];
};

export function WhySection({ reasons }: WhySectionProps) {
  return (
    <section className="home-why-section" id="why">
      <div className="home-container">
        <div className="home-section-eyebrow">Tại sao chọn chúng tôi</div>
        <h2 className="home-section-title">
          Tại sao khách hàng
          <br />
          yêu thích Gọt Gòi Nè?
        </h2>
        <p className="home-section-sub">
          Ba lý do đơn giản - nhưng chúng tôi thực hiện mỗi ngày, không ngoại lệ.
        </p>
        <div className="home-why-grid">
          {reasons.map((reason) => (
            <div className="home-why-card" key={reason.title}>
              <div className="home-why-icon">{reason.icon}</div>
              <h4>{reason.title}</h4>
              <p>{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
