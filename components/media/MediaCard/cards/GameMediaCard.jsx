// components/media/game/GameMediaCard.jsx
import BaseMediaCard from "../BaseMediaCard";

export default function GameMediaCard({
    item,
    mediaType = 'game',
    isLibrary = false,
    onIncreaseProgress,
    ...props
}) {
    const hasPendingTasks = () => {
        return item.progress?.tasks?.some(task => !task.completed) || false;
    };

    const getFirstPendingTask = () => {
        if (item.progress?.tasks) {
            const pendingTask = item.progress.tasks.find(task => !task.completed);
            return pendingTask || null;
        }
        return null;
    };

    const pendingTask = getFirstPendingTask();

    const shouldShowIncreaseButton = isLibrary &&
        item.status === 'in_progress' &&
        onIncreaseProgress &&
        hasPendingTasks();

    const increaseButtonLabel = () => {
        if (pendingTask) {
            return `Concluir: ${pendingTask.name}`;
        }
        return '';
    };

    const renderSpecificContent = () => {
        const shouldShowHours = item.status &&
            ['in_progress', 'dropped', 'completed'].includes(item.status) &&
            item.progress?.hours > 0;

        return (
            <div className="w-full mb-3">
                {shouldShowHours && (
                    <div className="inline-flex gap-1 px-2 py-1.5 bg-white/10 rounded-full text-xs text-white/80 font-medium">
                        <span className="font-medium">⏱️</span>
                        <span>Horas jogadas:</span>
                        <span className="font-semibold text-white">{item.progress.hours}h</span>
                    </div>
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
            showMetacritic={true}
            showRawgRating={true}
            useApiVoteCount={true}
            {...props}
        />
    );
}