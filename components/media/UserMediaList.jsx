// /components/media/UserMediaList.jsx
'use client';

import React from 'react';
import UserMediaCard from './UserMediaCard';
import { cn } from '@/lib/utils/general-utils';

const UserMediaList = ({ items, viewMode, mediaType, onEdit, onDelete }) => {
  if (viewMode === 'grid') {
    return (
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8",
        "fade-in"
      )}>
        {items.map((item) => (
          <UserMediaCard
            key={item._id}
            item={item}
            viewMode={viewMode}
            mediaType={mediaType}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4 mb-8 fade-in">
      {items.map((item) => (
        <UserMediaCard
          key={item._id}
          item={item}
          viewMode={viewMode}
          mediaType={mediaType}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default UserMediaList;