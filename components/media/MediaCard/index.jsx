import AnimeMediaCard from './cards/AnimeMediaCard';
import GameMediaCard from './cards/GameMediaCard';
import MangaMediaCard from './cards/MangaMediaCard';
import MovieMediaCard from './cards/MovieMediaCard';
import SeriesMediaCard from './cards/SeriesMediaCard';
import BaseMediaCard from './BaseMediaCard';

export const MediaCardFactory = {
    getComponent: (mediaType) => {
        const components = {
            anime: AnimeMediaCard,
            game: GameMediaCard,
            manga: MangaMediaCard,
            movie: MovieMediaCard,
            series: SeriesMediaCard,
        };
        return components[mediaType] || BaseMediaCard;
    }
};

export default function MediaCard(props) {
    const { mediaType = 'anime' } = props;
    const Component = MediaCardFactory.getComponent(mediaType);
    return <Component {...props} />;
}