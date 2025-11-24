'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Button, Card, CardContent, CardHeader, Rating } from '@/components/ui';
import ProgressBar from '@/components/ui/progress-bar/ProgressBar';
import { useMediaStore } from '@/store/media-store';
import { formatTime, formatDate } from '@/lib/utils';
import { ArrowLeft, Edit, Trash2, Clock, Calendar } from 'lucide-react';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getMediaById, deleteMedia } = useMediaStore();

  const movie = getMediaById(params.id);

  if (!movie) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Filme não encontrado</h1>
            <Button variant="primary" onClick={() => router.push('/movies')}>
              Voltar para Filmes
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este filme?')) {
      deleteMedia(movie.id);
      router.push('/movies');
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
              onClick={() => router.push('/movies')}
              icon={ArrowLeft}
            >
              Voltar
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{movie.title}</h1>
              {movie.releaseYear && (
                <p className="text-gray-600 mt-1">{movie.releaseYear}</p>
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
                  {movie.imageUrl ? (
                    <img
                      src={movie.imageUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                      <div className="text-center text-gray-600">
                        <Clock className="w-12 h-12 mx-auto mb-2" />
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
                    <Rating value={movie.rating} readonly showLabel />
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                      {movie.status === 'planned' && '📅 Planejado'}
                      {movie.status === 'in_progress' && '🎬 Em Progresso'}
                      {movie.status === 'completed' && '✅ Concluído'}
                      {movie.status === 'dropped' && '❌ Abandonado'}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2">
                    {movie.startedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Início: {formatDate(movie.startedAt)}
                      </div>
                    )}
                    {movie.finishedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Término: {formatDate(movie.finishedAt)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress */}
              {movie.progress && movie.status === 'in_progress' && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Progresso</h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Tempo assistido</span>
                        <span>
                          {movie.progress.currentTime && movie.progress.totalTime
                            ? `${formatTime(movie.progress.currentTime)} / ${formatTime(movie.progress.totalTime)}`
                            : 'Não informado'
                          }
                        </span>
                      </div>
                      {movie.progress.currentTime && movie.progress.totalTime && (
                        <ProgressBar
                          value={(movie.progress.currentTime / movie.progress.totalTime) * 100}
                          variant="default"
                          showLabel
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Genres */}
              {movie.genres.length > 0 && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Gêneros</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map((genre) => (
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
              {movie.description && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Sinopse</h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{movie.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Comment */}
              {movie.comment && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Seu Comentário</h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed italic">"{movie.comment}"</p>
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