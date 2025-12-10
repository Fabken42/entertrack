// /entertrack/components/forms/media-form/GameForm.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseMediaForm from './BaseMediaForm';
import { Input, Button } from '@/components/ui';
import { Plus, Trash2 } from 'lucide-react';

// Schema específico para jogos
const gameSchema = z.object({
  // Campos base
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  releaseYear: z.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  genres: z.array(z.string()).min(1, 'Selecione pelo menos um gênero'),
  status: z.enum(['planned', 'in_progress', 'completed', 'dropped']),
  rating: z.enum(['terrible', 'bad', 'ok', 'good', 'great', 'perfect']).optional(),
  comment: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  // Campos específicos de jogos para status in_progress
  progress: z.object({
    pendingTasks: z.array(z.string()).optional(), // 🔥 MODIFICADO: array de strings
  }).optional(),
});

const GameForm = (props) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(gameSchema),
    defaultValues: props.initialData ? {
      ...props.initialData,
      progress: props.initialData.progress || { pendingTasks: [] },
    } : props.externalData ? {
      title: props.externalData.title,
      description: props.externalData.description,
      releaseYear: props.externalData.releaseYear,
      genres: props.externalData.genres,
      status: 'planned',
      imageUrl: props.externalData.imageUrl,
      progress: { pendingTasks: [] },
    } : {
      progress: { pendingTasks: [] },
    },
  });

  const [newTask, setNewTask] = React.useState('');
  const pendingTasks = watch('progress.pendingTasks') || [];

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

  const handleSubmit = (baseData) => {
    const formData = {
      ...baseData,
      mediaType: 'game',
      progress: baseData.status === 'in_progress' ? {
        pendingTasks: baseData.progress?.pendingTasks || [],
      } : undefined,
    };
    props.onSubmit(formData);
  };

  const [selectedRating, setSelectedRating] = React.useState(
    props.initialData?.rating
  );

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
    setValue('rating', rating, { shouldValidate: true });
  };

  const GameSpecificFields = ({ currentStatus, register, errors }) => {
    const showPendingTasks = currentStatus === 'in_progress';

    if (!showPendingTasks) return null;

    return (
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
    );
  };

  return (
    <BaseMediaForm
      mediaType="game"
      initialData={props.initialData}
      externalData={props.externalData}
      manualCreateQuery={props.manualCreateQuery}
      onCancel={props.onCancel}
      loading={props.loading}
      onSubmit={handleSubmit}
      selectedRating={selectedRating}
      onRatingChange={handleRatingChange}
    >
      <GameSpecificFields
        currentStatus={watch('status')}
        register={register}
        errors={errors}
      />
    </BaseMediaForm>
  );
};

export default GameForm;