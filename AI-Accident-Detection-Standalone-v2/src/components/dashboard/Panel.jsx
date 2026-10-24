// Shared card wrapper: title/subtitle row plus an optional right-hand slot.
export default function Panel({ title, subtitle, aside, className = '', children }) {
  return (
    <section className={`d-panel ${className}`}>
      <header className="d-panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}

export function SampleTag({ children = 'Sample data' }) {
  return <span className="d-tag">{children}</span>;
}
