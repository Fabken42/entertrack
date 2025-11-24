'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Button, Card, CardContent, CardHeader, Rating } from '@/components/ui';
import ProgressBar from '@/components/ui/progress-bar/ProgressBar';
import { useMediaStore } from '@/store/media-store';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Edit, Trash2, BookOpen, Calendar } from 'lucide-react';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getMediaById, deleteMedia } = useMediaStore();
  
  const book = getMediaById(params.id);

  if (!book) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Livro não encontrado</h1>
            <Button variant="primary" onClick={() => router.push('/books')}>
              Voltar para Livros
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este livro?')) {
      deleteMedia(book.id);
      router.push('/books');
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
              onClick={() => router.push('/books')}
              icon={ArrowLeft}
            >
              Voltar
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
              {book.releaseYear && (
                <p className="text-gray-600 mt-1">{book.releaseYear}</p>
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
                  {book.imageUrl ? (
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                      <div className="text-center text-gray-600">
                        <BookOpen className="w-12 h-12 mx-auto mb-2" />
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
                    <Rating value={book.rating} readonly showLabel />
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                      {book.status === 'planned' && '📅 Planejado'}
                      {book.status === 'in_progress' && '📖 Em Progresso'}
                      {book.status === 'completed' && '✅ Concluído'}
                      {book.status === 'dropped' && '❌ Abandonado'}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2">
                    {book.startedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Início: {formatDate(book.startedAt)}
                      </div>
                    )}
                    {book.finishedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Término: {formatDate(book.finishedAt)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress */}
              {book.progress && (book.status === 'in_progress' || book.status === 'completed') && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Progresso</h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Páginas</span>
                        <span>
                          {book.progress.currentPage && book.progress.totalPages
                            ? `${book.progress.currentPage} / ${book.progress.totalPages}`
                            : 'Não informado'
                          }
                        </span>
                      </div>
                      {book.progress.currentPage && book.progress.totalPages && (
                        <ProgressBar
                          value={(book.progress.currentPage / book.progress.totalPages) * 100}
                          variant="default"
                          showLabel
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Genres */}
              {book.genres.length > 0 && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Gêneros</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {book.genres.map((genre) => (
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
              {book.description && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Sinopse</h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{book.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Comment */}
              {book.comment && (
                <Card variant="elevated">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Seu Comentário</h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed italic">"{book.comment}"</p>
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