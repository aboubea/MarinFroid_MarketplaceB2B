export function PageHeader({
  title,
  subtitle,
  action,
  compact,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="page-header" style={compact ? { marginBottom: 16 } : undefined}>
      <div>
        <h1 className="page-title" style={compact ? { fontSize: 22, marginBottom: 2 } : undefined}>{title}</h1>
        {subtitle && <p className="page-subtitle" style={compact ? { fontSize: 13.5 } : undefined}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
