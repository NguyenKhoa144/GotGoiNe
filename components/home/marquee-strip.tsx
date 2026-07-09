type MarqueeStripProps = {
  items: string[];
};

export function MarqueeStrip({ items }: MarqueeStripProps) {
  return (
    <div className="marquee-strip">
      <div className="marquee-track">
        {items.concat(items).map((item, idx) => (
          <span key={`${item}-${idx}`} className="marquee-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
