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

  // Componente para os campos específicos
  const GameSpecificFields = ({ currentStatus, register, errors }) => {
    const showPendingTasks = currentStatus === 'in_progress';
    
    if (!showPendingTasks) return null;
    
    return (
      <div className="pt-6 border-t border-gray-700">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tarefas Pendentes no Jogo
          </label>
          
          {/* Lista de tarefas */}
          {pendingTasks.length > 0 ? (
            <div className="space-y-2 mb-4">
              {pendingTasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <span className="text-white flex-1">{task}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(index)}
                    className="ml-2 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm mb-4 italic">
              Nenhuma tarefa adicionada ainda
            </div>
          )}
          
          {/* Campo para adicionar nova tarefa */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Digite uma tarefa pendente..."
              className="flex-1"
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
            >
              Adicionar
            </Button>
          </div>
          
          <p className="text-xs text-gray-400 mt-2">
            Exemplos: Conquistar troféu X, Completar missão Y, Encontrar item Z
          </p>
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
        register={register}
        errors={errors}
      />
    </BaseMediaForm>
  );
};

export default GameForm;