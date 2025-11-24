'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Button, Card, CardContent, CardHeader, Rating } from '@/components/ui';
import ProgressBar from '@/components/ui/progress-bar/ProgressBar';
import { useMediaStore } from '@/store/media-store';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Edit, Trash2, Tv, Calendar } from 'lucide-react';

export default function AnimeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getMediaById, deleteMedia } = useMediaStore();
  
  const anime = getMediaById(params.id);

  if (!anime) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Anime não encontrado</h1>
            <Button variant="primary" onClick={() => router.push('/animes')}>
              Voltar para Animes
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este anime?')) {
      deleteMedia(anime.id);
      router.push('/animes');
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/animes')}
              icon={ArrowLeft}
            >
              Voltar
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{anime.title}</h1>
              {anime.releaseYear && (
                <p className="text-gray-600 mt-1">{anime.releaseYear}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" icon={Edit}>
                Editar
              </Button>
              <Button variant="danger" icon={Trash2} onClick={handleDelete}>
                Excluir
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Poster and Basic Info */}
            <div className="lg:col-span-1">
              <Card variant="elevated">
                <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg bg-gray-200">
                  {anime.imageUrl ? (
                    <img
                      src={anime.imageUrl}
                      alt={anime.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                      <div className="text-center text-gray-600">
                        <Tv className="w-12 h-12 mx-auto mb-2" />
                        <p>Sem imagem</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  {/* Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sua avaliação
                    </label>
                    <Rating value={anime.rating} readonly showLabel />
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                      {anime.status === 'planned' && '📅 Planejado'}
                      {anime.status === 'in_progress' && '🎬 Em Progresso'}
                      {anime.status === 'completed' && '✅ Concluído'}
                      {anime.status === 'dropped' && '❌ Abandonado'}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2">
                    {anime.startedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Início: {formatDate(anime.startedAt)}
                      </div>
                    )}
                    {anime.finishedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Término: {formatDate(anime.finishedAt)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress */}
              {anime.progress && (anime.status === 'in_progress' || anime.status === 'completed') && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Progresso</h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Episódios</span>
                        <span>
                          {anime.progress.currentEpisode && anime.progress.totalEpisodes
                            ? `${anime.progress.currentEpisode} / ${anime.progress.totalEpisodes}`
                            : 'Não informado'
                          }
                        </span>
                      </div>
                      {anime.progress.currentEpisode && anime.progress.totalEpisodes && (
                        <ProgressBar
                          value={(anime.progress.currentEpisode / anime.progress.totalEpisodes) * 100}
                          variant="primary"
                          showLabel
                        />
                      )}
                    </div>
                    {anime.progress.currentSeason && anime.progress.totalSeasons && (
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Temporadas</span>
                          <span>
                            {anime.progress.currentSeason} / {anime.progress.totalSeasons}
                          </span>
                        </div>
                        <ProgressBar
                          value={(anime.progress.currentSeason / anime.progress.totalSeasons) * 100}
                          variant="success"
                          showLabel
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Genres */}
              {anime.genres.length > 0 && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Gêneros</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {anime.genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              {anime.description && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Sinopse</h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{anime.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Comment */}
              {anime.comment && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Seu Comentário</h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed italic">"{anime.comment}"</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}