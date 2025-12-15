// /components/forms/media-form/GameForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, Rating as RatingComponent, TextArea } from '@/components/ui';
import { GamepadIcon, Trophy, Target, Plus, Trash2, Star, Calendar, Users, TrendingUp } from 'lucide-react';
import { cn, formatApiRating, statusOptions } from '@/lib/utils';

// Schema específico para jogos
const gameSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  genres: z.array(z.string()).min(1, 'Selecione pelo menos um gênero'),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  rating: z.enum(['terrible', 'bad', 'ok', 'good', 'perfect']).optional(),
  comment: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  progress: z.object({
    pendingTasks: z.array(z.string()).optional(),
  }).optional(),
  // Campos específicos do RAWG
  playtime: z.number().optional(),
  metacritic: z.number().min(0).max(100).optional(),
  platforms: z.array(z.string()).optional(),
  developers: z.array(z.string()).optional(),
  publishers: z.array(z.string()).optional(),
});

const GameForm = (props) => {
  const {
    initialData,
    externalData,
    manualCreateQuery,
    onCancel,
    loading = false,
    onSubmit,
  } = props;

  console.log('GameForm props:', props);

  const [selectedGenres, setSelectedGenres] = React.useState(
    initialData?.genres || externalData?.genres || []
  );
  const [selectedRating, setSelectedRating] = React.useState(
    initialData?.rating
  );
  const [newTask, setNewTask] = React.useState('');

  const isEditMode = !!initialData;
  const hasExternalData = !!externalData;
  const isManualEntry = !hasExternalData && !isEditMode;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(gameSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      releaseYear: initialData.releaseYear,
      genres: initialData.genres,
      rating: initialData.rating,
      comment: initialData.comment,
      imageUrl: initialData.imageUrl,
      status: initialData.status,
      progress: initialData.progress || { pendingTasks: [] },
      playtime: initialData.playtime,
      metacritic: initialData.metacritic,
      platforms: initialData.platforms,
      developers: initialData.developers,
      publishers: initialData.publishers,
    } : externalData ? {
      title: externalData.title,
      description: externalData.description,
      releaseYear: externalData.releaseYear,
      genres: externalData.genres,
      status: 'planned',
      imageUrl: externalData.imageUrl,
      progress: { pendingTasks: [] },
      rating: undefined,
      playtime: externalData.playtime,
      metacritic: externalData.metacritic,
      platforms: externalData.platforms,
      developers: externalData.developers,
      publishers: externalData.publishers,
    } : manualCreateQuery ? {
      title: manualCreateQuery,
      status: 'planned',
      genres: [],
      progress: { pendingTasks: [] },
      platforms: [],
      developers: [],
      publishers: [],
    } : {
      status: 'planned',
      genres: [],
      progress: { pendingTasks: [] },
      platforms: [],
      developers: [],
      publishers: [],
    },
  });

  const currentStatus = watch('status');
  const showRatingAndComment = currentStatus === 'completed' || currentStatus === 'dropped';
  const showProgressFields = currentStatus === 'in_progress' || currentStatus === 'dropped';
  const pendingTasks = watch('progress.pendingTasks') || [];

  const handleGenreToggle = (genre) => {
    if (hasExternalData && !isEditMode) return;

    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];

    setSelectedGenres(newGenres);
    setValue('genres', newGenres, { shouldValidate: true });
  };

  const handleRatingChangeInternal = (rating) => {
    setSelectedRating(rating);
    setValue('rating', rating, { shouldValidate: true });
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      const updatedTasks = [...pendingTasks, newTask.trim()];
      setValue('progress.pendingTasks', updatedTasks, { shouldValidate: true });
      setNewTask('');
    }
  };

  const handleRemoveTask = (index) => {
    const updatedTasks = pendingTasks.filter((_, i) => i !== index);
    setValue('progress.pendingTasks', updatedTasks, { shouldValidate: true });
  };

  const onSubmitForm = (data) => {
    console.log('GameForm: onSubmitForm chamado com:', data);
    
    if (onSubmit) {
      const formData = {
        ...data,
        mediaType: 'game',
        rating: showRatingAndComment ? selectedRating : undefined,
        comment: showRatingAndComment ? data.comment : undefined,
        genres: selectedGenres,
        progress: (showProgressFields) ? {
          pendingTasks: data.progress?.pendingTasks || [],
        } : undefined,
        ...(externalData && {
          externalId: externalData.externalId,
          apiRating: externalData.apiRating,
          apiVoteCount: externalData.apiVoteCount,
          playtime: externalData.playtime,
          metacritic: externalData.metacritic,
          platforms: externalData.platforms,
          developers: externalData.developers,
          publishers: externalData.publishers,
        }),
      };
      
      console.log('GameForm: Enviando dados para onSubmit:', formData);
      onSubmit(formData);
    } else {
      console.error('GameForm: onSubmit não definido');
    }
  };

  const availableGenres = [
    'Ação', 'Aventura', 'RPG', 'Estratégia', 'Esportes', 'Corrida',
    'Tiro', 'Luta', 'Quebra-cabeça', 'Simulação', 'Terror', 'Sobrevivência',
    'Plataforma', 'Indie', 'MMO', 'MOBA', 'Battle Royale', 'Casual'
  ];

  const mediaColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
      {hasExternalData && (
        <div className={cn("glass border rounded-xl p-6 space-y-4", "border-purple-500/30")}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", mediaColor)}>
              <GamepadIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                Dados importados do RAWG
              </h3>
              <p className="text-sm text-white/60">Estes dados foram obtidos automaticamente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {externalData.apiRating && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <div>
                  <span className="text-white/80">Nota:</span>
                  <div className="font-medium text-white">
                    {formatApiRating(externalData.apiRating, 1)?.display}/5
                  </div>
                  {externalData.apiVoteCount && (
                    <div className="text-xs text-white/60">
                      ({externalData.apiVoteCount.toLocaleString()} avaliações)
                    </div>
                  )}
                </div>
              </div>
            )}

            {externalData.metacritic && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Target className="w-4 h-4 text-green-400" />
                <div>
                  <span className="text-white/80">Metacritic:</span>
                  <div className={cn(
                    "font-bold",
                    externalData.metacritic >= 75 ? "text-green-400" :
                    externalData.metacritic >= 50 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {externalData.metacritic}
                  </div>
                </div>
              </div>
            )}

            {externalData.playtime && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <GamepadIcon className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-white/80">Tempo de jogo:</span>
                  <div className="font-medium text-white">
                    {externalData.playtime}h
                  </div>
                </div>
              </div>
            )}

            {externalData.releaseYear && (
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <Calendar className="w-4 h-4 text-white/60" />
                <div>
                  <span className="text-white/80">Ano:</span>
                  <div className="font-medium text-white">{externalData.releaseYear}</div>
                </div>
              </div>
            )}

            {externalData.platforms && externalData.platforms.length > 0 && (
              <div className="md:col-span-2 flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                <TrendingUp className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-white/80">Plataformas:</span>
                  <div className="font-medium text-white">
                    {externalData.platforms.join(', ')}
                  </div>
                </div>
              </div>
            )}

            {externalData.developers && externalData.developers.length > 0 && (
              <div className="md:col-span-2 flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                <Users className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-white/80">Desenvolvedores:</span>
                  <div className="font-medium text-white">
                    {externalData.developers.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {hasExternalData && externalData.imageUrl && (
        <div className="flex justify-center">
          <div className="rounded-xl overflow-hidden border glass w-48 h-64">
            <img
              src={externalData.imageUrl}
              alt={externalData.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {externalData?.description && (
        <div className="glass border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", mediaColor)}>
              <GamepadIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">
                Descrição
              </h3>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                {externalData.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {isManualEntry && (
        <div className="glass border border-white/10 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", mediaColor)}>
              <GamepadIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Informações Básicas</h3>
              <p className="text-sm text-white/60">Preencha os dados manualmente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Título *"
              {...register('title')}
              error={errors.title?.message}
              placeholder="Título do jogo"
              variant="glass"
            />

            <Input
              label="Ano de Lançamento"
              type="number"
              icon={Calendar}
              {...register('releaseYear', { valueAsNumber: true })}
              error={errors.releaseYear?.message}
              placeholder="2024"
              variant="glass"
            />

            <div className="md:col-span-2">
              <Input
                label="URL da Imagem"
                {...register('imageUrl')}
                error={errors.imageUrl?.message}
                placeholder="https://exemplo.com/imagem.jpg"
                variant="glass"
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Plataformas"
                {...register('platforms')}
                error={errors.platforms?.message}
                placeholder="PC, PlayStation 5, Xbox Series X"
                variant="glass"
                helperText="Separe as plataformas com vírgula"
              />
            </div>

            <Input
              label="Tempo de Jogo (horas)"
              type="number"
              icon={GamepadIcon}
              {...register('playtime', { valueAsNumber: true })}
              error={errors.playtime?.message}
              placeholder="40"
              variant="glass"
            />

            <Input
              label="Metacritic (0-100)"
              type="number"
              icon={Target}
              {...register('metacritic', { valueAsNumber: true })}
              error={errors.metacritic?.message}
              placeholder="85"
              variant="glass"
              min={0}
              max={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Descrição
            </label>
            <TextArea
              {...register('description')}
              placeholder="Descreva o jogo..."
              variant="glass"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Gêneros *
            </label>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover-lift",
                    selectedGenres.includes(genre)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>
            {errors.genres && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                {errors.genres.message}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="glass border border-white/10 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {hasExternalData ? 'Sua experiência' : 'Sua avaliação'}
            </h3>
            <p className="text-sm text-white/60">Como você avalia este conteúdo?</p>
          </div>
        </div>

        <Select
          label="Status *"
          {...register('status')}
          error={errors.status?.message}
          options={statusOptions}
          variant="glass"
        />

        {showRatingAndComment && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Sua avaliação
              </label>
              <RatingComponent
                value={selectedRating}
                onChange={handleRatingChangeInternal}
                showLabel
                size="lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Seu comentário
              </label>
              <TextArea
                {...register('comment')}
                placeholder="Compartilhe suas impressões..."
                variant="glass"
                rows={3}
              />
            </div>
          </>
        )}
      </div>

      {/* Campos específicos do jogo */}
      {showProgressFields && (
        <div className={cn(
          "glass border border-white/10 rounded-xl p-6 space-y-4",
          "border-l-4 border-purple-500/30"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <GamepadIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Missões Pendentes</h3>
              <p className="text-sm text-white/60">Adicione tarefas ou objetivos que ainda precisa completar</p>
            </div>
          </div>

          {/* Lista de tarefas */}
          {pendingTasks.length > 0 ? (
            <div className="space-y-2 mb-4">
              {pendingTasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg group hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-white">{task}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(index)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all duration-200"
                    aria-label="Remover tarefa"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 mb-4 bg-white/5 rounded-lg border border-dashed border-white/10">
              <Trophy className="w-8 h-8 text-white/30 mb-2" />
              <p className="text-white/60 text-sm italic">Nenhuma missão adicionada ainda</p>
              <p className="text-white/40 text-xs mt-1">Adicione suas próximas conquistas</p>
            </div>
          )}

          {/* Campo para adicionar nova tarefa */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Ex: Conquistar troféu platina, Completar modo história..."
                variant="glass"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTask}
                className="whitespace-nowrap"
                icon={Plus}
                disabled={!newTask.trim()}
              >
                Adicionar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {['Conquistar todos os troféus', 'Completar modo difícil', 'Encontrar todos os segredos', 'Farmar 100k moedas'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setNewTask(suggestion)}
                  className="text-xs text-white/60 hover:text-white p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="min-w-[100px]"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="min-w-[100px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {initialData ? 'Atualizar' : hasExternalData ? 'Adicionar à minha lista' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};

export default GameForm;