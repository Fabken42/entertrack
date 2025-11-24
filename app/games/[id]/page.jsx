'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Button, Card, CardContent, CardHeader, Rating } from '@/components/ui';
import ProgressBar from '@/components/ui/progress-bar/ProgressBar';
import { useMediaStore } from '@/store/media-store';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Edit, Trash2, GamepadIcon, Calendar, Trophy } from 'lucide-react';

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getMediaById, deleteMedia } = useMediaStore();
  
  const game = getMediaById(params.id);

  if (!game) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Game não encontrado</h1>
            <Button variant="primary" onClick={() => router.push('/games')}>
              Voltar para Games
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este game?')) {
      deleteMedia(game.id);
      router.push('/games');
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
              onClick={() => router.push('/games')}
              icon={ArrowLeft}
            >
              Voltar
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{game.title}</h1>
              {game.releaseYear && (
                <p className="text-gray-600 mt-1">{game.releaseYear}</p>
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
            {/* Left Column - Cover and Basic Info */}
            <div className="lg:col-span-1">
              <Card variant="elevated">
                <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg bg-gray-200">
                  {game.imageUrl ? (
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                      <div className="text-center text-gray-600">
                        <GamepadIcon className="w-12 h-12 mx-auto mb-2" />
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
                    <Rating value={game.rating} readonly showLabel />
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                      {game.status === 'planned' && '📅 Planejado'}
                      {game.status === 'in_progress' && '🎮 Em Progresso'}
                      {game.status === 'completed' && '✅ Concluído'}
                      {game.status === 'dropped' && '❌ Abandonado'}
                    </div>
                  </div>

                  {/* Platinum Badge */}
                  {game.progress?.isPlatinum && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-center">
                      <Trophy className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-sm font-medium">Platina Conquistada!</span>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="space-y-2">
                    {game.startedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Início: {formatDate(game.startedAt)}
                      </div>
                    )}
                    {game.finishedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Término: {formatDate(game.finishedAt)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress */}
              {game.progress && (game.status === 'in_progress' || game.status === 'completed') && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Progresso</h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Conclusão</span>
                        <span>
                          {game.progress.completionPercentage
                            ? `${game.progress.completionPercentage}%`
                            : 'Não informado'
                          }
                        </span>
                      </div>
                      {game.progress.completionPercentage && (
                        <ProgressBar
                          value={game.progress.completionPercentage}
                          variant={
                            game.progress.completionPercentage < 30 ? 'danger' :
                            game.progress.completionPercentage < 70 ? 'warning' : 'success'
                          }
                          showLabel
                        />
                      )}
                    </div>

                    {/* Play Time */}
                    {game.progress.playTime && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tempo de jogo</span>
                        <span>{game.progress.playTime} horas</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Achievements */}
              {game.progress?.achievements && game.progress.achievements.length > 0 && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Conquistas</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {game.progress.achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            achievement.achieved
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div>
                            <h3 className="font-medium text-gray-900">{achievement.name}</h3>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {achievement.achieved ? (
                              <>
                                <Trophy className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600">
                                  {achievement.achievedAt ? formatDate(achievement.achievedAt) : 'Conquistada'}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">Não conquistada</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Genres */}
              {game.genres.length > 0 && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Gêneros</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {game.genres.map((genre) => (
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
              {game.description && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Sinopse</h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{game.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Comment */}
              {game.comment && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Seu Comentário</h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed italic">"{game.comment}"</p>
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