// /app/page.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { 
  Film, 
  Tv, 
  BookOpen, 
  Gamepad2, 
  Sparkles, 
  CheckCircle, 
  TrendingUp, 
  Users,
  Star,
  BarChart3,
  Shield,
  Smartphone,
  Globe,
  ArrowRight,
  Plus,
  Heart,
  Calendar,
  Trophy,
  Clock,
  Zap,
  ChevronRight,
  Bookmark
} from 'lucide-react';
import { cn } from '@/lib/utils/general-utils';
import { signIn, useSession } from 'next-auth/react';

export default function HomePage() {
  const { data: session } = useSession();
  const [isHovered, setIsHovered] = useState(null);

  const mediaTypes = [
    {
      icon: Film,
      label: 'Filmes',
      color: 'from-blue-500 to-cyan-500',
      count: '150.000+',
      description: 'Acompanhe tudo que você assistiu'
    },
    {
      icon: Tv,
      label: 'Séries',
      color: 'from-purple-500 to-pink-500',
      count: '50.000+',
      description: 'Controle episódios e temporadas'
    },
    {
      icon: BookOpen,
      label: 'Animes',
      color: 'from-red-500 to-orange-500',
      count: '20.000+',
      description: 'Seus animes favoritos'
    },
    {
      icon: BookOpen,
      label: 'Mangás',
      color: 'from-indigo-500 to-violet-500',
      count: '40.000+',
      description: 'Colecione suas leituras'
    },
    {
      icon: BookOpen,
      label: 'Livros',
      color: 'from-emerald-500 to-teal-500',
      count: '1.000.000+',
      description: 'Organize sua biblioteca'
    },
    {
      icon: Gamepad2,
      label: 'Jogos',
      color: 'from-amber-500 to-yellow-500',
      count: '100.000+',
      description: 'Suas conquistas e progresso'
    }
  ];

  const features = [
    {
      icon: CheckCircle,
      title: 'Controle Total',
      description: 'Marque como assistiu, está assistindo, planeja assistir ou abandonou',
      color: 'text-emerald-400'
    },
    {
      icon: Star,
      title: 'Avaliações',
      description: 'Dê notas de 1 a 5 estrelas e escreva reviews detalhados',
      color: 'text-yellow-400'
    },
    {
      icon: BarChart3,
      title: 'Estatísticas',
      description: 'Gráficos e insights sobre seus hábitos de consumo',
      color: 'text-blue-400'
    },
    {
      icon: Calendar,
      title: 'Calendário',
      description: 'Acompanhe lançamentos e organize sua agenda',
      color: 'text-purple-400'
    },
    {
      icon: Trophy,
      title: 'Conquistas',
      description: 'Desbloqueie badges por marcos especiais',
      color: 'text-orange-400'
    },
    {
      icon: Users,
      title: 'Comunidade',
      description: 'Compartilhe e descubra recomendações',
      color: 'text-pink-400'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Crie sua conta',
      description: 'Registre-se gratuitamente em menos de 1 minuto',
      icon: Plus,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      number: '02',
      title: 'Adicione conteúdos',
      description: 'Busque entre milhões de títulos ou adicione manualmente',
      icon: Bookmark,
      color: 'from-purple-500 to-pink-500'
    },
    {
      number: '03',
      title: 'Organize sua coleção',
      description: 'Classifique por status, gênero, data ou avaliação',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      number: '04',
      title: 'Acompanhe seu progresso',
      description: 'Visualize estatísticas e evolua seus hábitos',
      icon: BarChart3,
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const testimonials = [
    {
      name: 'Ana Silva',
      role: 'Cinéfila',
      content: 'Finalmente encontrei um app que organiza todos meus filmes e séries em um só lugar!',
      avatar: '👩‍🎨'
    },
    {
      name: 'Carlos Santos',
      role: 'Gamer',
      content: 'O sistema de estatísticas é incrível, consigo ver exatamente quanto tempo investi em cada jogo.',
      avatar: '🎮'
    },
    {
      name: 'Marina Costa',
      role: 'Leitora',
      content: 'Adoro poder marcar capítulos específicos dos livros que estou lendo.',
      avatar: '📚'
    }
  ];

  const handleGetStarted = () => {
    if (session) {
      window.location.href = '/dashboard';
    } else {
      signIn();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 sm:px-8 lg:pt-32 lg:pb-40">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 mb-8">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Organize seu entretenimento em um só lugar</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                EnterTrack
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-gray-300 mb-8 max-w-3xl mx-auto">
              A plataforma definitiva para acompanhar filmes, séries, animes, livros e jogos
            </p>
            
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Deixe de perder tempo lembrando onde parou. Centralize tudo, receba recomendações 
              inteligentes e transforme seu consumo de entretenimento em uma experiência organizada.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-300"
              >
                {session ? 'Acessar Dashboard' : 'Começar Grátis'}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Link href="/discover/movies">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg rounded-xl border-white/20 hover:bg-white/10 hover:border-white/30"
                >
                  <Film className="mr-2 w-5 h-5" />
                  Explorar Catálogo
                </Button>
              </Link>
            </div>
            
            <div className="mt-16 flex justify-center">
              <div className="inline-flex items-center gap-6 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="text-white font-semibold">10.000+</span>
                  <span className="text-gray-400">usuários</span>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-semibold">1M+</span>
                  <span className="text-gray-400">títulos</span>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-semibold">5M+</span>
                  <span className="text-gray-400">registros</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Types Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Tudo em <span className="text-gradient-primary">um só lugar</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Gerencie todos os tipos de entretenimento em uma plataforma unificada
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {mediaTypes.map((media) => {
            const Icon = media.icon;
            return (
              <div
                key={media.label}
                onMouseEnter={() => setIsHovered(media.label)}
                onMouseLeave={() => setIsHovered(null)}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:translate-y-[-4px]">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${media.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{media.label}</h3>
                  <p className="text-2xl font-bold text-white mb-1">{media.count}</p>
                  <p className="text-sm text-gray-400">{media.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-6 py-20 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Como funciona o <span className="text-gradient-primary">EnterTrack</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Simples, rápido e eficiente. Comece em 4 passos fáceis
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent hidden lg:block" />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${step.color} mb-6`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-5xl font-bold text-white/10 mb-2">{step.number}</div>
                    <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="text-center mt-16">
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-8 py-4 text-lg rounded-xl"
          >
            Começar Agora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-6 py-20 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Recursos <span className="text-gradient-primary">poderosos</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Tudo que você precisa para transformar seu consumo de entretenimento
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:translate-y-[-4px]"
              >
                <div className="inline-flex p-3 rounded-xl bg-white/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className={cn("w-6 h-6", feature.color)} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-6 py-20 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            O que nossos <span className="text-gradient-primary">usuários</span> dizem
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já transformaram seu entretenimento
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-300 italic">"{testimonial.content}"</p>
              <div className="flex mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 mb-6">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Sem custos, sem compromissos</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para transformar seu entretenimento?
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de usuários que já descobriram a melhor forma de acompanhar tudo que consomem
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg rounded-xl shadow-lg shadow-blue-500/25"
            >
              {session ? 'Ir para Dashboard' : 'Criar Minha Conta'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Link href="/discover">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg rounded-xl border-white/20 hover:bg-white/10"
              >
                <Globe className="mr-2 w-5 h-5" />
                Explorar sem cadastro
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span>100% seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <span>Responsivo</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>Grátis para sempre</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}