import React, { useState, useEffect } from "react";
import { ArrowLeft, Settings, Play, Square, Upload, FileText, Database, Edit3, Save, Download, Mic, MicOff, AlertCircle, CheckCircle, Clock, Users, Calendar, BarChart3, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import SharedHeader from "./SharedHeader";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../api/client";

type ProjectStatus = "draft" | "active" | "done";
type Project = {
  id: number;
  name: string;
  client?: string;
  description?: string;
  status: ProjectStatus;
  updatedAt: string;
  pages: number;
  sessions: number;
};

type ImportItem = {
  id: string;
  name: string;
  type: "audio" | "text";
  size: string;
  uploadedAt: string;
  status: "processing" | "completed" | "error";
};

type Entity = {
  id: string;
  term: string;
  type: string;
  context: string;
  confidence: number;
};

type Session = {
  id: number;
  project_id: number;
  type: "interview" | "import";
  status: "pending" | "processing" | "completed" | "error";
  duration?: number;
  file_path?: string;
  file_size?: number;
  transcript?: string;
  created_at: string;
  updated_at: string;
};

// Mock данные удалены - используем реальные данные с сервера

const mockImports: ImportItem[] = [
  {
    id: "1",
    name: "client_interview_1.mp3",
    type: "audio",
    size: "12.5 MB",
    uploadedAt: "2024-01-14",
    status: "completed"
  },
  {
    id: "2", 
    name: "requirements_doc.txt",
    type: "text",
    size: "2.1 KB",
    uploadedAt: "2024-01-13",
    status: "completed"
  },
  {
    id: "3",
    name: "follow_up_call.mp3", 
    type: "audio",
    size: "8.3 MB",
    uploadedAt: "2024-01-15",
    status: "processing"
  }
];

const mockEntities: Entity[] = [
  {
    id: "1",
    term: "User Authentication",
    type: "Feature",
    context: "Login system with 2FA support",
    confidence: 0.95
  },
  {
    id: "2",
    term: "Mobile Responsive",
    type: "Requirement",
    context: "Design must work on all screen sizes",
    confidence: 0.88
  },
  {
    id: "3",
    term: "Payment Gateway",
    type: "Integration",
    context: "Stripe integration for secure payments",
    confidence: 0.92
  }
];

function ProjectPage() {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [userSessions, setUserSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [description, setDescription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editedProjectName, setEditedProjectName] = useState("");
  const [editedProjectClient, setEditedProjectClient] = useState("");

  const mockAccount = { name: "Иван Иванов", email: "ivan@example.com" };

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Получаем ID проекта из URL
        const pathParts = window.location.pathname.split('/');
        const projectId = pathParts[pathParts.length - 1];
        
        if (!projectId || isNaN(Number(projectId))) {
          throw new Error('Неверный ID проекта');
        }
        
        // Загружаем проект, сессии проекта и сессии пользователя параллельно
        const [projectData, sessionsData, userSessionsData] = await Promise.all([
          apiClient.getProject(Number(projectId)),
          apiClient.getProjectSessions(Number(projectId)),
          apiClient.getUserSessions()
        ]);
        
        // API возвращает объект с полем project, а не сам проект
        const project = projectData.project || projectData;
        const sessions = sessionsData.sessions || sessionsData;
        const userSessions = userSessionsData.sessions || userSessionsData;
        setProject(project);
        setSessions(sessions);
        setUserSessions(userSessions);
        setDescription(project.description || "");
        setEditedProjectName(project.name);
        setEditedProjectClient(project.client || "");
      } catch (err) {
        console.error('Ошибка загрузки проекта:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки проекта');
      } finally {
        setLoading(false);
      }
    };
    
    loadProject();
  }, []);

  const getStatusBadge = (status: ProjectStatus) => {
    const variants = {
      draft: isDark 
        ? "bg-slate-500/20 text-slate-300 border-slate-500/30"
        : "bg-slate-100 text-slate-700 border-slate-200",
      active: isDark
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-blue-100 text-blue-700 border-blue-200",
      done: isDark
        ? "bg-green-500/20 text-green-300 border-green-500/30"
        : "bg-green-100 text-green-700 border-green-200"
    };
    
    const labels = {
      draft: "Черновик",
      active: "В работе", 
      done: "Готов"
    };

    return (
      <Badge className={`${variants[status]} border`}>
        {labels[status]}
      </Badge>
    );
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    // Handle file upload logic here
    console.log("Files uploaded:", files);
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleSaveProject = async () => {
    if (!project) return;
    
    try {
      const updatedProject = await apiClient.updateProject(project.id, {
        name: editedProjectName,
        client: editedProjectClient,
        description: description,
        status: project.status
      });
      
      setProject(updatedProject);
      setIsEditingProject(false);
    } catch (err) {
      console.error('Ошибка сохранения проекта:', err);
      setError(err instanceof Error ? err.message : 'Ошибка сохранения проекта');
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    
    if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
      try {
        await apiClient.deleteProject(project.id);
        window.history.pushState({}, "", "/app");
        window.dispatchEvent(new Event("popstate"));
      } catch (err) {
        console.error('Ошибка удаления проекта:', err);
        setError(err instanceof Error ? err.message : 'Ошибка удаления проекта');
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Загрузка проекта...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className={`text-xl mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            Ошибка загрузки проекта
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {error}
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Проект не найден</div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full animate-float ${isDark ? 'bg-gradient-to-r from-cyan-400 to-purple-500' : 'bg-gradient-to-r from-blue-300 to-purple-300'}`}
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animationDelay: `${(i % 5) * 0.4}s`,
              animationDuration: `${4 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      {/* Shared Header */}
      <SharedHeader 
        account={user ? { name: user.name, email: user.email } : mockAccount}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        showBackButton={false}
      />

      {/* Project Info Header */}
      <div className={`${isDark ? 'bg-black/40' : 'bg-white/40'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Back Button */}
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.history.pushState({}, "", "/app");
                window.dispatchEvent(new Event("popstate"));
              }}
              className={`group px-3 py-2 rounded-lg transition-all duration-200 ${
                isDark 
                  ? 'text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" />
              Назад к проектам
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  {isEditingProject ? (
                    <div className="flex flex-col gap-1">
                      <Input
                        value={editedProjectName}
                        onChange={(e) => setEditedProjectName(e.target.value)}
                        className={`bg-transparent border-none p-0 h-auto ${isDark ? 'text-white' : 'text-gray-900'} focus:ring-0 focus:outline-none`}
                        style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: 'bold', 
                          lineHeight: '1.2',
                          fontFamily: 'inherit'
                        }}
                      />
                      <Input
                        value={editedProjectClient}
                        onChange={(e) => setEditedProjectClient(e.target.value)}
                        placeholder="Компания"
                        className={`bg-transparent border-none p-0 h-auto ${isDark ? 'text-gray-300' : 'text-gray-600'} focus:ring-0 focus:outline-none`}
                        style={{ 
                          fontSize: '1.125rem', 
                          lineHeight: '1.2',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ lineHeight: '1.2' }}>{editedProjectName}</h1>
                      {editedProjectClient && (
                        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`} style={{ lineHeight: '1.2' }}>{editedProjectClient}</p>
                      )}
                    </div>
                  )}
                  {getStatusBadge(project.status)}
                </div>
                <div className={`flex items-center gap-6 mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Обновлено {new Date(project.updated_at).toLocaleDateString('ru-RU')}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {sessions.length} страниц
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    {sessions.length} сессий
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditingProject ? (
                <>
                  <Button
                    onClick={handleSaveProject}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить
                  </Button>
                  <Button
                    onClick={() => {
                      setEditedProjectName(project.name);
                      setEditedProjectClient(project.client || "");
                      setIsEditingProject(false);
                    }}
                    variant="outline"
                    className={`${isDark ? 'border-white/30 text-white hover:bg-white/15 bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                  >
                    Отмена
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditingProject(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Редактирование
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
            {/* Sessions Block */}
            <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} shadow-lg`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Сессии проекта</CardTitle>
                    <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      Управление интервью и импортированными материалами
                    </CardDescription>
                  </div>
                  <Button
                    onClick={async () => {
                      if (!project) {
                        setError('Проект не загружен');
                        return;
                      }
                      
                      // Проверяем лимиты тарифа
                      if (user?.plan === 'basic' && userSessions.length >= 1) {
                        setError('Достигнут лимит сессий для базового тарифа (1 сессия в неделю)');
                        return;
                      }
                      
                      try {
                        const response = await apiClient.createSession(project.id, 'interview');
                        const session = response.session || response;
                        // Обновляем список сессий
                        setSessions(prev => [...prev, session]);
                        setUserSessions(prev => [...prev, session]);
                        window.history.pushState({}, "", `/projects/${project.id}/sessions/${session.id}`);
                        window.dispatchEvent(new Event("popstate"));
                      } catch (err) {
                        console.error('Ошибка создания сессии:', err);
                        setError(err instanceof Error ? err.message : 'Ошибка создания сессии');
                      }
                    }}
                    disabled={user?.plan === 'basic' && userSessions.length >= 1}
                    className={`${
                      user?.plan === 'basic' && userSessions.length >= 1
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    } text-white`}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {user?.plan === 'basic' && userSessions.length >= 1 ? 'Лимит достигнут' : 'Новая сессия'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                          isDark 
                            ? 'bg-white/5 border-white/10 hover:border-purple-400/40' 
                            : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              session.type === 'interview' 
                                ? 'bg-cyan-500/20 text-cyan-400' 
                                : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {session.type === 'interview' ? (
                                <Mic className="w-5 h-5" />
                              ) : (
                                <Upload className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {session.type === 'interview' ? 'Интервью' : 'Импорт'}
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {new Date(session.created_at).toLocaleString('ru-RU')}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <Badge className={
                              session.status === 'pending' 
                                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' 
                                : session.status === 'completed'
                                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                : session.status === 'error'
                                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            }>
                              {session.status === 'pending' ? 'Ожидает' : 
                               session.status === 'completed' ? 'Завершено' :
                               session.status === 'error' ? 'Ошибка' : 'Обрабатывается'}
                            </Badge>
                            
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {session.duration ? `${Math.floor(session.duration / 60)} мин` : 
                               session.file_size ? `${(session.file_size / 1024 / 1024).toFixed(1)} MB` : ''}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {session.status === 'pending' ? (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    window.history.pushState({}, "", `/projects/${project.id}/sessions/${session.id}`);
                                    window.dispatchEvent(new Event("popstate"));
                                  }}
                                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                >
                                  <Play className="w-4 h-4 mr-1" />
                                  Продолжить генерацию
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    window.history.pushState({}, "", `/projects/${project.id}/sessions/${session.id}`);
                                    window.dispatchEvent(new Event("popstate"));
                                  }}
                                  className={`${isDark ? 'border-white/30 text-white hover:bg-white/15 hover:text-white bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-700'}`}
                                >
                                  <FileText className="w-4 h-4 mr-1" />
                                  Открыть
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                className={`${isDark ? 'border-red-400/50 text-red-300 hover:bg-red-500/10' : 'border-red-300 text-red-600 hover:bg-red-50'}`}
                                onClick={() => console.log("Delete session", session.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                      isDark ? 'bg-white/10' : 'bg-gray-100'
                    }`}>
                      <Mic className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Сессий пока нет
                    </h3>
                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Создайте первую сессию интервью или импортируйте аудио/текст
                    </p>
                    <Button
                      onClick={async () => {
                        if (!project) {
                          setError('Проект не загружен');
                          return;
                        }
                        
                        // Проверяем лимиты тарифа
                        if (user?.plan === 'basic' && userSessions.length >= 1) {
                          setError('Достигнут лимит сессий для базового тарифа (1 сессия в неделю)');
                          return;
                        }
                        
                        try {
                          const response = await apiClient.createSession(project.id, 'interview');
                          const session = response.session || response;
                          // Обновляем список сессий
                          setSessions(prev => [...prev, session]);
                          setUserSessions(prev => [...prev, session]);
                          window.history.pushState({}, "", `/projects/${project.id}/sessions/${session.id}`);
                          window.dispatchEvent(new Event("popstate"));
                        } catch (err) {
                          console.error('Ошибка создания сессии:', err);
                          setError(err instanceof Error ? err.message : 'Ошибка создания сессии');
                        }
                      }}
                      disabled={user?.plan === 'basic' && userSessions.length >= 1}
                      className={`${
                        user?.plan === 'basic' && userSessions.length >= 1
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      } text-white`}
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      {user?.plan === 'basic' && userSessions.length >= 1 ? 'Лимит достигнут' : 'Создать первую сессию'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}

export default ProjectPage;
