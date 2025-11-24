'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/ui';

export default function MangaDetailPage() {
  const params = useParams();
  const mangaId = params.id;
  
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMangaDetails();
  }, [mangaId]);

  const fetchMangaDetails = async () => {
    try {
      const response = await fetch(`/api/external/myanimelist?action=manga-details&id=${mangaId}&type=manga`);
      if (!response.ok) {
        throw new Error('Failed to fetch manga details');
      }
      const data = await response.json();
      setManga(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching manga details:', error);
      setError('Erro ao carregar detalhes do mangá');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando mangá...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !manga) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-red-400 text-6xl mb-4">❌</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Mangá não encontrado'}
            </h3>
            <Button variant="primary" onClick={() => window.history.back()}>
              Voltar
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Capa */}
                <div className="flex-shrink-0">
                  <img
                    src={manga.imageUrl || '/placeholder-image.jpg'}
                    alt={manga.title}
                    className="w-64 h-96 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>

                {/* Informações */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {manga.title}
                  </h1>
                  
                  {manga.englishTitle && manga.englishTitle !== manga.title && (
                    <p className="text-lg text-gray-600 mb-4">{manga.englishTitle}</p>
                  )}

                  {/* Metadados */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Informações</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        {manga.rating && (
                          <div className="flex justify-between">
                            <span>Avaliação:</span>
                            <span className="font-medium">{manga.rating.toFixed(1)}/10</span>
                          </div>
                        )}
                        {manga.volumes && (
                          <div className="flex justify-between">
                            <span>Volumes:</span>
                            <span className="font-medium">{manga.volumes}</span>
                          </div>
                        )}
                        {manga.chapters && (
                          <div className="flex justify-between">
                            <span>Capítulos:</span>
                            <span className="font-medium">{manga.chapters}</span>
                          </div>
                        )}
                        {manga.status && (
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className="font-medium capitalize">
                              {manga.status.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                        {manga.members && (
                          <div className="flex justify-between">
                            <span>Membros:</span>
                            <span className="font-medium">
                              {manga.members.toLocaleString('pt-BR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Detalhes</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        {manga.authors && manga.authors.length > 0 && (
                          <div className="flex justify-between">
                            <span>Autor(es):</span>
                            <span className="font-medium text-right">
                              {manga.authors.join(', ')}
                            </span>
                          </div>
                        )}
                        {manga.genres && manga.genres.length > 0 && (
                          <div className="flex justify-between">
                            <span>Gêneros:</span>
                            <span className="font-medium text-right">
                              {manga.genres.join(', ')}
                            </span>
                          </div>
                        )}
                        {manga.serialization && manga.serialization.length > 0 && (
                          <div className="flex justify-between">
                            <span>Serialização:</span>
                            <span className="font-medium text-right">
                              {manga.serialization.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Descrição */}
                  {manga.description && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Sinopse</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {manga.description}
                      </p>
                    </div>
                  )}

                  {/* Botões de ação */}
                  <div className="flex gap-3">
                    <Button variant="primary" onClick={() => console.log('Adicionar à biblioteca:', manga)}>
                      Adicionar à Biblioteca
                    </Button>
                    <Button variant="outline" onClick={() => window.history.back()}>
                      Voltar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}