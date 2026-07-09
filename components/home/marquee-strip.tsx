type MarqueeStripProps = {
  items: string[];
};

export function MarqueeStrip({ items }: MarqueeStripProps) {
  return (
    <div className="home-marquee-strip">
      <div className="home-marquee-track">
        {items.concat(items).map((item, idx) => (
          <span key={`${item}-${idx}`} className="home-marquee-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
