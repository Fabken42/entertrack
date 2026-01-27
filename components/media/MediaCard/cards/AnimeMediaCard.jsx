import BaseMediaCard from '../BaseMediaCard';
import { shouldShowCount } from '@/lib/utils/general-utils';

export default function AnimeMediaCard({
  item,
  mediaType = 'anime',
  isLibrary = false,
  onIncreaseProgress,
  ...props
}) {
  const shouldShowIncreaseButton = isLibrary &&
    item.status === 'in_progress' &&
    onIncreaseProgress;

  const increaseButtonLabel = () => {
    const currentEpisode = item.progress?.episodes || 0;
    const nextEpisode = currentEpisode + 1;
    return `Ep. ${nextEpisode} assistido`;
  };

  const renderSpecificContent = () => {
    return (
      <div className="flex flex-wrap gap-1.5 mb-3">
        {shouldShowCount(item.episodes) && (
          <span className="inline-flex gap-1 px-2 py-1.5 bg-white/10 rounded-full text-xs text-white/80 font-medium">
            <span className="text-xs">📺</span>
            {item.episodes} episódio{item.episodes > 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  };

  return (
    <BaseMediaCard
      item={item}
      mediaType={mediaType}
      isLibrary={isLibrary}
      onIncreaseProgress={onIncreaseProgress}
      renderSpecificContent={renderSpecificContent}
      increaseButtonLabel={increaseButtonLabel()}
      shouldShowIncreaseButton={shouldShowIncreaseButton}
      {...props}
    />
  );
}