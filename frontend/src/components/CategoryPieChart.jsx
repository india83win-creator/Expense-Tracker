import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import GlassCard from './GlassCard';

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function CategoryPieChart({ data }) {
  const hasData = data && data.length > 0;

  return (
    <GlassCard className="p-5 h-full">
      <h3 className="font-display text-base mb-4">Spending by category</h3>
      {!hasData ? (
        <div className="flex items-center justify-center h-56 text-ink-faint text-sm">
          No expenses logged this month yet.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-1/2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatINR(value)}
                  contentStyle={{
                    background: '#161D33',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  itemStyle={{ color: '#F5F7FA' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full sm:w-1/2 flex flex-col gap-2">
            {data.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="truncate text-ink-soft">
                    {c.icon} {c.name}
                  </span>
                </div>
                <span className="font-mono shrink-0 ml-2">{formatINR(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
