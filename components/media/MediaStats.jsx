// /components/media/MediaStats.jsx
'use client';

import { cn } from '@/lib/utils/general-utils';
import { getStatItems } from '@/lib/utils/media-utils';

const MediaStats = ({ stats }) => {
  const statItems = getStatItems(stats);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {statItems.map((stat, index) => (
        <div
          key={index}
          className={cn(
            "glass border rounded-xl p-4 flex flex-col items-center justify-center hover-lift transition-all duration-300",
            stat.borderColor
          )}
        >
          <div className={cn(
            "p-3 rounded-lg mb-3 bg-gradient-to-br",
            stat.color
          )}>
            <stat.icon className={cn("w-6 h-6", stat.textColor)} />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stat.value}
          </div>
          <div className={cn("text-sm font-medium", stat.textColor)}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaStats;