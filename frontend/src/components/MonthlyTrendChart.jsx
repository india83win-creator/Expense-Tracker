import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import GlassCard from './GlassCard';

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function MonthlyTrendChart({ data }) {
  return (
    <GlassCard className="p-5 h-full">
      <h3 className="font-display text-base mb-4">Last 6 months</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#5B6478"
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#5B6478"
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              formatter={(value) => formatINR(value)}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{
                background: '#161D33',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                fontSize: 12,
              }}
              itemStyle={{ color: '#F5F7FA' }}
              labelStyle={{ color: '#94A3B8' }}
            />
            <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#34D399" maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
