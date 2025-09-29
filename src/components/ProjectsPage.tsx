import React, { useMemo, useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import SharedHeader from "./SharedHeader";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../api/client";

type Plan = "basic" | "pro" | "premium";
type Project = { 
  id: number; 
  name: string; 
  client?: string;
  description?: string;
  status: "draft" | "active" | "done"; 
  createdAt: string; 
  updatedAt: string;
  stats?: {
    total_sessions: number;
    completed_sessions: number;
    total_files: number;
    completed_files: number;
    total_duration: number;
  };
};


function PlanCard({ plan, isDark }: { plan: Plan; isDark: boolean }) {
  const limits = {
    basic: { sessions: "1 интервью/нед", minutes: "≤20 мин", pages: "1 страница" },
    pro: { sessions: "≤5 интервью/нед", minutes: "≤45 мин", pages: "до 3 страниц" },
    premium: { sessions: "без ограничений", minutes: "∞", pages: "без ограничений" },
  } as const;
  const l = limits[plan];

  return (
    <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
      <CardHeader>
        <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>{plan === "basic" ? "Базовый план" : plan === "pro" ? "Расширенный план" : "Премиум план"}</CardTitle>
        <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>Текущие лимиты вашего тарифа</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className={`${isDark ? 'border-white/20 text-white' : 'border-gray-300 text-gray-700'}`}>Сессии: {l.sessions}</Badge>
        <Badge variant="outline" className={`${isDark ? 'border-white/20 text-white' : 'border-gray-300 text-gray-700'}`}>Длительность: {l.minutes}</Badge>
        <Badge variant="outline" className={`${isDark ? 'border-white/20 text-white' : 'border-gray-300 text-gray-700'}`}>Страницы: {l.pages}</Badge>
        <Button 
          className="ml-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          onClick={() => {
            window.history.pushState({}, "", "/pricing");
            window.dispatchEvent(new Event("popstate"));
          }}
        >
          Изменить тариф
        </Button>
      </CardContent>
    </Card>
  );
}

const ProjectCard: React.FC<{ project: Project; onDelete: (id: number) => void; isDark: boolean }> = ({ project, onDelete, isDark }) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Черновик';
      case 'active': return 'В работе';
      case 'done': return 'Завершен';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return isDark ? 'bg-slate-500/20 text-slate-300 border-slate-500/30' : 'bg-slate-100 text-slate-700 border-slate-200';
      case 'active': return 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white';
      case 'done': return isDark ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-700 border-green-200';
      default: return isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className={`${isDark ? 'bg-white/5 border-white/10 hover:border-purple-400/40' : 'bg-white border-gray-200 hover:border-purple-300 shadow-sm hover:shadow-md'} transition-all`}>
      <CardHeader>
        <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{project.name}</CardTitle>
        <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
          {project.client && `${project.client} • `}
          Создано: {new Date(project.createdAt).toLocaleDateString('ru-RU')}
        </CardDescription>
        {project.description && (
          <CardDescription className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {project.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Badge className={getStatusColor(project.status)}>
          {getStatusLabel(project.status)}
        </Badge>
        {project.stats && (
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {project.stats.total_sessions} сессий
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
            <a href={`/projects/${project.id}`}>Открыть</a>
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className={`${isDark ? 'border-red-500/40 text-red-300 hover:bg-red-500/10' : 'border-red-300 text-red-600 hover:bg-red-50'}`} 
            onClick={() => onDelete(project.id)}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Удалить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateProjectModal({ onCreate }: { onCreate: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="create" className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white"><Plus className="w-4 h-4 mr-2" /> Создать проект</Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-600 text-white">
        <DialogHeader>
          <DialogTitle>Новый проект</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="project-name" className="block mb-4">Название проекта</label>
            <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Лендинг студии" className="bg-black/50 border-white/10 text-white" />
          </div>
          <div className="flex justify-between gap-3 pt-2">
            <Button variant="outline" className="border-white/20" onClick={() => setOpen(false)}>Отмена</Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              onClick={() => {
                if (!name.trim()) return;
                onCreate(name.trim());
                setName("");
                setOpen(false);
              }}
            >
              Создать
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { user, stats, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка проектов
  useEffect(() => {
    const loadProjects = async () => {
      if (authLoading) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.getProjects();
        setProjects(response.projects);
      } catch (error: any) {
        console.error('Ошибка загрузки проектов:', error);
        setError(error.message || 'Ошибка загрузки проектов');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [authLoading]);

  const handleCreate = async (name: string) => {
    try {
      const response = await apiClient.createProject(name);
      setProjects([response.project, ...projects]);
    } catch (error: any) {
      console.error('Ошибка создания проекта:', error);
      setError(error.message || 'Ошибка создания проекта');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('Ошибка удаления проекта:', error);
      setError(error.message || 'Ошибка удаления проекта');
    }
  };

  return (
    <div className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="absolute inset-0">
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-black/50 via-purple-900/20 to-black' : 'bg-gradient-to-b from-gray-100 to-white'}`} />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`absolute w-2 h-2 rounded-full animate-float ${isDark ? 'bg-gradient-to-r from-cyan-400 to-purple-500' : 'bg-gradient-to-r from-blue-300 to-purple-300'}`} style={{ left: `${(i * 41) % 100}%`, top: `${(i * 59) % 100}%`, animationDelay: `${(i % 5) * 0.35}s`, animationDuration: `${4 + (i % 4)}s` }} />
        ))}
      </div>

      <div className="relative z-10">
        <SharedHeader 
          account={user ? { name: user.name, email: user.email } : { name: "Гость", email: "guest@example.com" }} 
          isDark={isDark} 
          onThemeToggle={toggleTheme}
          showBackButton={false}
        />

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl">Личный кабинет / Проекты</h1>
          </div>

          {user && <PlanCard plan={user.plan} isDark={isDark} />}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">Мои проекты</h2>
              <CreateProjectModal onCreate={handleCreate} />
            </div>
            {isLoading ? (
              <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} text-center py-12`}>
                <CardContent>
                  <div className="mb-4">Загрузка проектов...</div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className={`${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'} text-center py-12`}>
                <CardContent>
                  <div className="mb-4 text-red-500">{error}</div>
                  <Button onClick={() => window.location.reload()}>Попробовать снова</Button>
                </CardContent>
              </Card>
            ) : projects.length === 0 ? (
              <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} text-center py-12`}>
                <CardContent>
                  <div className="mb-4">Пока нет проектов</div>
                  <CreateProjectModal onCreate={handleCreate} />
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {projects.map((p) => (
                  <ProjectCard key={p.id} project={p} onDelete={handleDelete} isDark={isDark} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}


