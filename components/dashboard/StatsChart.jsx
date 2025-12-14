// /components/dashboard/StatsChart.jsx
'use client';

import { cn } from '@/lib/utils';

export function StatsChart({ stats, className }) {
  if (!stats?.byType || stats.byType.length === 0) return null;

  const total = stats.byType.reduce((sum, type) => sum + type.count, 0);
  
  return (
    <div className={cn("p-4 bg-white/5 rounded-xl border border-white/10", className)}>
      <h3 className="text-sm font-medium text-gray-400 mb-4">Distribuição por Tipo</h3>
      
      <div className="space-y-3">
        {stats.byType.map((type) => {
          const percentage = total > 0 ? (type.count / total) * 100 : 0;
          
          return (
            <div key={type._id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white">{type._id}</span>
                <span className="text-gray-400">
                  {type.count} ({percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}