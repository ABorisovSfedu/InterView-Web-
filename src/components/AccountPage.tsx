import React, { useState, useEffect } from "react";
import { ArrowLeft, User, CreditCard, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import SharedHeader from "./SharedHeader";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../api/client";

const mockAccount = { name: "Иван Иванов", email: "ivan@example.com" };

export default function AccountPage() {
  const { isDark, toggleTheme } = useTheme();
  const { user, updateProfile, changePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Состояние формы профиля
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    company: "",
    position: ""
  });

  // Состояние формы смены пароля
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Синхронизируем данные пользователя с формой
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        company: "",
        position: ""
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Обновляем профиль через AuthContext
      await updateProfile({
        name: profileData.name
      });
      
      setSuccess('Профиль успешно обновлен');
      
      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Ошибка обновления профиля:', err);
      setError(err instanceof Error ? err.message : 'Ошибка обновления профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Валидация паролей
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Новые пароли не совпадают');
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Новый пароль должен содержать минимум 6 символов');
      setIsLoading(false);
      return;
    }

    try {
      // Меняем пароль через AuthContext
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      // Очищаем форму
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      setSuccess('Пароль успешно изменен');
      
      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Ошибка смены пароля:', err);
      setError(err instanceof Error ? err.message : 'Ошибка смены пароля');
    } finally {
      setIsLoading(false);
    }
  };


  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'basic': return 'Базовый';
      case 'pro': return 'Расширенный';
      case 'premium': return 'Премиум';
      default: return plan;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-500';
      case 'pro': return 'bg-purple-500';
      case 'premium': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlanLimits = (plan: string) => {
    // Моковые данные о текущем использовании (в реальном приложении это будет приходить с сервера)
    const mockUsage = {
      interviews: 1, // использовано собеседований на этой неделе (1 из 1 для basic, 1 из 3 для pro)
      recordingMinutes: 15, // использовано минут записи (15 из 20 для basic, 15 из 60 для pro)
      pages: 1, // использовано страниц макетов (1 из 1 для basic, 1 из 5 для pro)
    };

    switch (plan) {
      case 'basic':
        return [
          { 
            name: 'Собеседования', 
            value: `${mockUsage.interviews}/1 в неделю`, 
            color: 'bg-blue-500',
            used: mockUsage.interviews,
            limit: 1,
            unit: 'в неделю'
          },
          { 
            name: 'Запись', 
            value: `${mockUsage.recordingMinutes}/20 минут`, 
            color: 'bg-green-500',
            used: mockUsage.recordingMinutes,
            limit: 20,
            unit: 'минут'
          },
          { 
            name: 'Макеты', 
            value: `${mockUsage.pages}/1 страница`, 
            color: 'bg-yellow-500',
            used: mockUsage.pages,
            limit: 1,
            unit: 'страниц'
          },
          { 
            name: 'Библиотека', 
            value: 'Базовая библиотека элементов', 
            color: 'bg-purple-500',
            used: null,
            limit: null,
            unit: null
          },
          { 
            name: 'Доп. собеседование', 
            value: '+1500₽ за дополнительное', 
            color: 'bg-orange-500',
            used: null,
            limit: null,
            unit: null
          }
        ];
      case 'pro':
        return [
          { 
            name: 'Собеседования', 
            value: `${mockUsage.interviews}/3 в неделю`, 
            color: 'bg-blue-500',
            used: mockUsage.interviews,
            limit: 3,
            unit: 'в неделю'
          },
          { 
            name: 'Запись', 
            value: `${mockUsage.recordingMinutes}/60 минут`, 
            color: 'bg-green-500',
            used: mockUsage.recordingMinutes,
            limit: 60,
            unit: 'минут'
          },
          { 
            name: 'Макеты', 
            value: `${mockUsage.pages}/5 страниц`, 
            color: 'bg-yellow-500',
            used: mockUsage.pages,
            limit: 5,
            unit: 'страниц'
          },
          { 
            name: 'Библиотека', 
            value: 'Расширенная библиотека элементов', 
            color: 'bg-purple-500',
            used: null,
            limit: null,
            unit: null
          },
          { 
            name: 'Аналитика', 
            value: 'Детальная аналитика', 
            color: 'bg-pink-500',
            used: null,
            limit: null,
            unit: null
          },
          { 
            name: 'Поддержка', 
            value: 'Приоритетная поддержка', 
            color: 'bg-orange-500',
            used: null,
            limit: null,
            unit: null
          }
        ];
      case 'premium':
        return [
          { 
            name: 'Собеседования', 
            value: `${mockUsage.interviews}/∞`, 
            color: 'bg-blue-500',
            used: mockUsage.interviews,
            limit: Infinity,
            unit: 'неограниченно'
          },
          { 
            name: 'Запись', 
            value: `${mockUsage.recordingMinutes}/∞ минут`, 
            color: 'bg-green-500',
            used: mockUsage.recordingMinutes,
            limit: Infinity,
            unit: 'минут'
          },
          { 
            name: 'Макеты', 
            value: `${mockUsage.pages}/∞ страниц`, 
            color: 'bg-yellow-500',
            used: mockUsage.pages,
            limit: Infinity,
            unit: 'страниц'
          },
          { 
            name: 'Библиотека', 
            value: 'Полная библиотека элементов', 
            color: 'bg-purple-500',
            used: null,
            limit: null,
            unit: null
          },
          { 
            name: 'Аналитика', 
            value: 'Полная аналитика + AI инсайты', 
            color: 'bg-pink-500',
            used: null,
            limit: null,
            unit: null
          },
          { 
            name: 'Поддержка', 
            value: '24/7 поддержка', 
            color: 'bg-orange-500',
            used: null,
            limit: null,
            unit: null
          },
          { 
            name: 'Экспорт', 
            value: 'Экспорт в любые форматы', 
            color: 'bg-indigo-500',
            used: null,
            limit: null,
            unit: null
          },
          { 
            name: 'Интеграции', 
            value: 'Все интеграции', 
            color: 'bg-teal-500',
            used: null,
            limit: null,
            unit: null
          }
        ];
      default:
        return [
          { 
            name: 'Собеседования', 
            value: `${mockUsage.interviews}/1 в неделю`, 
            color: 'bg-blue-500',
            used: mockUsage.interviews,
            limit: 1,
            unit: 'в неделю'
          },
          { 
            name: 'Запись', 
            value: `${mockUsage.recordingMinutes}/20 минут`, 
            color: 'bg-green-500',
            used: mockUsage.recordingMinutes,
            limit: 20,
            unit: 'минут'
          },
          { 
            name: 'Макеты', 
            value: `${mockUsage.pages}/1 страница`, 
            color: 'bg-yellow-500',
            used: mockUsage.pages,
            limit: 1,
            unit: 'страниц'
          }
        ];
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
          account={user ? { name: user.name, email: user.email } : mockAccount}
          isDark={isDark}
          onThemeToggle={toggleTheme}
          showBackButton={false}
        />

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <div className="mb-8">
            <div className="pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.history.pushState({}, "", "/app");
                  window.dispatchEvent(new Event("popstate"));
                }}
                className={`mb-4 ${isDark ? 'text-white border-white/30 bg-white/5 hover:bg-white hover:text-black hover:border-white' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад к проектам
              </Button>
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Личный кабинет
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Управление настройками аккаунта
            </p>
          </div>

          {error && (
            <div className={`p-4 rounded-lg border ${
              isDark 
                ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <div className="flex items-center">
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className={`p-4 rounded-lg border ${
              isDark 
                ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                : 'bg-green-50 border-green-200 text-green-600'
            }`}>
              <div className="flex items-center">
                <span className="text-sm">{success}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Профиль */}
            <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={`text-xl flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <User className="w-5 h-5" />
                  Информация профиля
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  Обновите информацию о себе
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Загрузка данных пользователя...
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Имя</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          className={isDark ? 'bg-white/5 border-white/10 text-white' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className={`${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 text-gray-500'} cursor-not-allowed`}
                        />
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Email нельзя изменить
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Компания</Label>
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                          className={isDark ? 'bg-white/5 border-white/10 text-white' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Должность</Label>
                        <Input
                          id="position"
                          value={profileData.position}
                          onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                          className={isDark ? 'bg-white/5 border-white/10 text-white' : ''}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Смена пароля */}
            <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={`text-xl flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Lock className="w-5 h-5" />
                  Смена пароля
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  Обновите пароль для безопасности
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Текущий пароль</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className={isDark ? 'bg-white/5 border-white/10 text-white' : ''}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Новый пароль</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className={isDark ? 'bg-white/5 border-white/10 text-white' : ''}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className={isDark ? 'bg-white/5 border-white/10 text-white' : ''}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                  >
                    {isLoading ? 'Изменение...' : 'Изменить пароль'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Тариф - отдельный блок */}
          <div className="mt-8">
            <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={`text-xl flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <CreditCard className="w-5 h-5" />
                  Текущий тариф
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  Информация о вашем плане и лимитах
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Информация о тарифе */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg ${getPlanColor(user?.plan || 'basic')} flex items-center justify-center`}>
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {getPlanName(user?.plan || 'basic')}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Текущий план подписки
                      </p>
                    </div>
                  </div>
                </div>

                {/* Лимиты тарифа */}
                <div className="space-y-4">
                  <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Лимиты вашего плана
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getPlanLimits(user?.plan || 'basic').map((limit, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${limit.color}`}></div>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {limit.name}
                          </span>
                        </div>
                        
                        {/* Показываем прогресс-бар для лимитов с числовыми значениями */}
                        {limit.used !== null && limit.limit !== null && limit.limit !== Infinity ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {limit.used} / {limit.limit} {limit.unit}
                              </span>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {Math.round((limit.used / limit.limit) * 100)}%
                              </span>
                            </div>
                            <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  (limit.used / limit.limit) >= 0.9 
                                    ? 'bg-red-500' 
                                    : (limit.used / limit.limit) >= 0.7 
                                    ? 'bg-yellow-500' 
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min((limit.used / limit.limit) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : limit.limit === Infinity ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {limit.used} / ∞ {limit.unit}
                              </span>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Неограниченно
                              </span>
                            </div>
                            <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div 
                                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                                style={{ width: '100%' }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {limit.value}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Кнопка изменения тарифа */}
                <Button
                  onClick={() => {
                    window.history.pushState({}, "", "/pricing");
                    window.dispatchEvent(new Event("popstate"));
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Изменить тариф
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
