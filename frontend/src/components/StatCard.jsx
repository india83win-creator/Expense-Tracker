import GlassCard from './GlassCard';

export default function StatCard({ label, value, icon: Icon, accent = '#34D399', sub }) {
  return (
    <GlassCard className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-soft uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: `${accent}1A` }}
          >
            <Icon size={15} style={{ color: accent }} strokeWidth={2.2} />
          </div>
        )}
      </div>
      <div className="font-mono text-2xl font-medium tracking-tight">{value}</div>
      {sub && <div className="text-xs text-ink-faint">{sub}</div>}
    </GlassCard>
  );
}
