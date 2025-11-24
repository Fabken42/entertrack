// Usuário mockado
export const mockUser = {
  id: 'user-1',
  email: 'usuario@exemplo.com',
  name: 'João Silva',
  avatar: '/mock/avatar.jpg',
  createdAt: new Date('2024-01-01')
};

// Dados mockados para todos os tipos de mídia
export const mockMedia = [
  // FILMES
  {
    id: 'movie-1',
    userId: 'user-1',
    mediaType: 'movie',
    title: 'Inception',
    description: 'Um ladrão que rouba segredos corporativos através do uso da tecnologia de compartilhamento de sonhos é dado a tarefa inversa de plantar uma ideia na mente de um CEO.',
    imageUrl: '/mock/movies/inception.jpg',
    genres: ['Ficção Científica', 'Ação', 'Suspense'],
    releaseYear: 2010,
    status: 'completed',
    rating: 'perfect',
    comment: 'Mind blowing! A cinematografia e a trilha sonora são incríveis.',
    startedAt: new Date('2024-01-15'),
    finishedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
    progress: {
      currentTime: 8880, // 2h28m em segundos
      totalTime: 8880
    }
  },
  {
    id: 'movie-2',
    userId: 'user-1',
    mediaType: 'movie',
    title: 'The Shawshank Redemption',
    description: 'Dois homens presos estabelecem um vínculo ao longo de vários anos, encontrando consolo e eventual redenção através de atos de decência comum.',
    imageUrl: '/mock/movies/shawshank.jpg',
    genres: ['Drama'],
    releaseYear: 1994,
    status: 'in_progress',
    rating: 'great',
    startedAt: new Date('2024-02-01'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-01'),
    progress: {
      currentTime: 3600, // 1h em segundos
      totalTime: 8520 // 2h22m
    }
  },

  // SÉRIES
  {
    id: 'series-1',
    userId: 'user-1',
    mediaType: 'series',
    title: 'Breaking Bad',
    description: 'Um professor de química do ensino médio diagnosticado com câncer de pulmão inoperável se volta para a fabricação e venda de metanfetamina para garantir o futuro de sua família.',
    imageUrl: '/mock/series/breaking-bad.jpg',
    genres: ['Drama', 'Crime', 'Suspense'],
    releaseYear: 2008,
    status: 'completed',
    rating: 'perfect',
    comment: 'Uma das melhores séries já feitas. Personagens incrivelmente desenvolvidos.',
    startedAt: new Date('2024-01-05'),
    finishedAt: new Date('2024-02-20'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-20'),
    progress: {
      currentEpisode: 62,
      totalEpisodes: 62,
      currentSeason: 5,
      totalSeasons: 5
    }
  },
  {
    id: 'series-2',
    userId: 'user-1',
    mediaType: 'series',
    title: 'Stranger Things',
    description: 'Quando um jovem garoto desaparece, uma pequena cidade descobre um mistério envolvendo experimentos secretos, forças sobrenaturais aterrorizantes e uma garota muito estranha.',
    imageUrl: '/mock/series/stranger-things.jpg',
    genres: ['Ficção Científica', 'Horror', 'Drama'],
    releaseYear: 2016,
    status: 'in_progress',
    rating: 'good',
    startedAt: new Date('2024-02-10'),
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-15'),
    progress: {
      currentEpisode: 5,
      totalEpisodes: 34,
      currentSeason: 2,
      totalSeasons: 4
    }
  },

  // ANIMES
  {
    id: 'anime-1',
    userId: 'user-1',
    mediaType: 'anime',
    title: 'Attack on Titan',
    description: 'Em um mundo onde a humanidade vive dentro de cidades cercadas por três muros enormes que os protegem dos titãs gigantescos que os devoram humanos, a história segue Eren Yeager.',
    imageUrl: '/mock/animes/aot.jpg',
    genres: ['Ação', 'Drama', 'Fantasia', 'Shounen'],
    releaseYear: 2013,
    status: 'completed',
    rating: 'perfect',
    comment: 'Arte incrível, história complexa e desenvolvimento de personagens excepcional.',
    startedAt: new Date('2024-01-08'),
    finishedAt: new Date('2024-03-01'),
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-03-01'),
    progress: {
      currentEpisode: 89,
      totalEpisodes: 89,
      currentSeason: 4,
      totalSeasons: 4
    }
  },
  {
    id: 'anime-2',
    userId: 'user-1',
    mediaType: 'anime',
    title: 'Demon Slayer',
    description: 'Um jovem rapaz torna-se um caçador de demônios para salvar sua irmã e caçar o demônio que matou sua família.',
    imageUrl: '/mock/animes/demon-slayer.jpg',
    genres: ['Ação', 'Fantasia', 'Shounen'],
    releaseYear: 2019,
    status: 'in_progress',
    rating: 'great',
    startedAt: new Date('2024-02-20'),
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-25'),
    progress: {
      currentEpisode: 18,
      totalEpisodes: 44,
      currentSeason: 2,
      totalSeasons: 3
    }
  },

  // LIVROS
  {
    id: 'book-1',
    userId: 'user-1',
    mediaType: 'book',
    title: '1984',
    description: 'Uma distopia clássica sobre vigilância governamental e controle totalitário.',
    imageUrl: '/mock/books/1984.jpg',
    genres: ['Ficção', 'Distopia', 'Política'],
    releaseYear: 1949,
    status: 'completed',
    rating: 'great',
    comment: 'Assustadoramente relevante nos dias de hoje.',
    startedAt: new Date('2024-01-12'),
    finishedAt: new Date('2024-01-25'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
    progress: {
      currentPage: 328,
      totalPages: 328
    }
  },
  {
    id: 'book-2',
    userId: 'user-1',
    mediaType: 'book',
    title: 'O Hobbit',
    description: 'A aventura de Bilbo Bolseiro em sua jornada inesperada.',
    imageUrl: '/mock/books/hobbit.jpg',
    genres: ['Fantasia', 'Aventura'],
    releaseYear: 1937,
    status: 'in_progress',
    rating: 'good',
    startedAt: new Date('2024-02-15'),
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-20'),
    progress: {
      currentPage: 150,
      totalPages: 310
    }
  },

  // GAMES
  {
    id: 'game-1',
    userId: 'user-1',
    mediaType: 'game',
    title: 'The Witcher 3: Wild Hunt',
    description: 'Um caçador de monstros em uma missão épica em um mundo de fantasia.',
    imageUrl: '/mock/games/witcher3.jpg',
    genres: ['RPG', 'Aventura', 'Fantasia'],
    releaseYear: 2015,
    status: 'completed',
    rating: 'perfect',
    comment: 'Jogo incrível, mundo aberto vasto e histórias cativantes.',
    startedAt: new Date('2024-01-20'),
    finishedAt: new Date('2024-03-10'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-10'),
    progress: {
      completionPercentage: 100,
      playTime: 120,
      isPlatinum: true,
      achievements: [
        {
          id: 'ach-1',
          name: 'Platinum Trophy',
          description: 'Conquistou todos os troféus',
          achieved: true,
          achievedAt: new Date('2024-03-10')
        }
      ]
    }
  },
  {
    id: 'game-2',
    userId: 'user-1',
    mediaType: 'game',
    title: 'God of War',
    description: 'Kratos e seu filho Atreus embarcam em uma jornada épica.',
    imageUrl: '/mock/games/god-of-war.jpg',
    genres: ['Ação', 'Aventura', 'RPG'],
    releaseYear: 2018,
    status: 'in_progress',
    rating: 'great',
    startedAt: new Date('2024-02-25'),
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-05'),
    progress: {
      completionPercentage: 65,
      playTime: 35,
      isPlatinum: false,
      achievements: [
        {
          id: 'ach-2',
          name: 'The Bear and the Wolf',
          description: 'Complete o jogo principal',
          achieved: false
        }
      ]
    }
  },

  // ITENS PLANEJADOS
  {
    id: 'planned-1',
    userId: 'user-1',
    mediaType: 'movie',
    title: 'Interstellar',
    description: 'Uma equipe de exploradores viaja através de um buraco de minhoca no espaço na tentativa de garantir a sobrevivência da humanidade.',
    imageUrl: '/mock/movies/interstellar.jpg',
    genres: ['Ficção Científica', 'Drama', 'Aventura'],
    releaseYear: 2014,
    status: 'planned',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  },
  {
    id: 'planned-2',
    userId: 'user-1',
    mediaType: 'anime',
    title: 'One Piece',
    description: 'Acompanhe as aventuras de Monkey D. Luffy e sua tripulação em busca do tesouro supremo, o One Piece.',
    imageUrl: '/mock/animes/one-piece.jpg',
    genres: ['Ação', 'Aventura', 'Comédia', 'Shounen'],
    releaseYear: 1999,
    status: 'planned',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  }
];