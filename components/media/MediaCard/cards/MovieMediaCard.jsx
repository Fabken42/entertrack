import BaseMediaCard from '../BaseMediaCard';

export default function MovieMediaCard({
    item,
    mediaType = 'movie',
    isLibrary = false,
    onIncreaseProgress,
    ...props
}) {
    return (
        <BaseMediaCard
            item={item}
            mediaType={mediaType}
            isLibrary={isLibrary}
            onIncreaseProgress={onIncreaseProgress}
            shouldShowIncreaseButton={false}
            {...props}
        />
    );
}