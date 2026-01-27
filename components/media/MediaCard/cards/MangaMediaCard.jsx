import BaseMediaCard from '../BaseMediaCard';
import { formatChaptersVolumes } from '@/lib/utils/media-utils';
import { shouldShowCount } from '@/lib/utils/general-utils';

export default function MangaMediaCard({
    item,
    mediaType = 'manga',
    isLibrary = false,
    onIncreaseProgress,
    ...props
}) {
    const shouldShowIncreaseButton = isLibrary &&
        item.status === 'in_progress' &&
        onIncreaseProgress;

    const increaseButtonLabel = () => {
        const currentChapter = item.progress?.chapters || 0;
        const nextChapter = currentChapter + 1;
        return `Cap.${nextChapter} lido`;
    };

    // MangaMediaCard.js - Ajuste na função renderSpecificContent
    const renderSpecificContent = () => {
        return (
            <div className="flex flex-wrap gap-2 mb-3">
                {shouldShowCount(item.chapters) && (
                    <span className="inline-flex gap-1 px-2 py-1.5 bg-white/10 rounded-full text-xs text-white/80 font-medium">
                        <span>📖</span>
                        {item.chapters} capítulo{item.chapters > 1 ? 's' : ''}
                    </span>
                )}
                {shouldShowCount(item.volumes) && (
                    <span className="inline-flex gap-1 px-2 py-1.5 bg-white/10 rounded-full text-xs text-white/80 font-medium">
                        <span>📚</span>
                        {formatChaptersVolumes(item.volumes, item.status)} volume{parseInt(item.volumes) > 1 ? 's' : ''}
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
        >
        </BaseMediaCard>
    );
}