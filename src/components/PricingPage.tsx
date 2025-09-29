import React, { useState } from "react";
import { ArrowLeft, Target, Zap, Rocket, CheckCircle, Star, Crown } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import SharedHeader from "./SharedHeader";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../api/client";

const mockAccount = { name: "Иван Иванов", email: "ivan@example.com" };

type Plan = "basic" | "pro" | "premium";

export default function PricingPage() {
  const { isDark, toggleTheme } = useTheme();
  const { user, refreshUser } = useAuth();
  const [isChanging, setIsChanging] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePlanChange = async (newPlan: Plan) => {
    if (!user) return;
    
    setIsChanging(newPlan);
    setError(null);
    
    try {
      // Здесь должен быть API вызов для смены плана
      // await apiClient.changePlan(newPlan);
      
      // Пока что просто обновляем локально
      console.log(`Changing plan to ${newPlan}`);
      
      // Обновляем пользователя
      if (refreshUser) {
        await refreshUser();
      }
      
      // Показываем уведомление об успехе
      alert(`План успешно изменен на ${getPlanName(newPlan)}`);
      
    } catch (err) {
      console.error('Ошибка смены плана:', err);
      setError(err instanceof Error ? err.message : 'Ошибка смены плана');
    } finally {
      setIsChanging(null);
    }
  };

  const getPlanName = (plan: Plan) => {
    switch (plan) {
      case 'basic': return 'Базовый';
      case 'pro': return 'Расширенный';
      case 'premium': return 'Премиум';
      default: return plan;
    }
  };

  const isCurrentPlan = (plan: Plan) => {
    return user?.plan === plan;
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
              Тарифы
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Выберите тариф под ваши задачи
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Basic */}
            <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} transition-all duration-300 relative overflow-hidden ${
              isCurrentPlan('basic') ? (isDark ? 'border-blue-400 ring-2 ring-blue-400/20' : 'border-blue-500 ring-2 ring-blue-500/20') : ''
            }`}>
              <div className="relative">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Target className="w-8 h-8 text-white" aria-hidden />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CardTitle className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Базовый
                    </CardTitle>
                    {isCurrentPlan('basic') && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Текущий
                      </Badge>
                    )}
                  </div>
                  <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    Для первых пилотов
                  </CardDescription>
                  <div className="mt-4">
                    <span className={`text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>1500₽</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>/мес</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "1 собеседование в неделю",
                    "До 20 минут записи",
                    "1 страница макета",
                    "Базовая библиотека элементов",
                    "Доп. собеседование: +1500₽",
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" aria-hidden />
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{t}</span>
                    </div>
                  ))}
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Доп. собеседование: +1500₽
                  </p>
                  <Button
                    onClick={() => handlePlanChange('basic')}
                    disabled={isCurrentPlan('basic') || isChanging === 'basic'}
                    className={`w-full mt-4 ${
                      isCurrentPlan('basic')
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                    } text-white py-3`}
                  >
                    {isChanging === 'basic' ? 'Изменение...' : isCurrentPlan('basic') ? 'Текущий план' : 'Выбрать план'}
                  </Button>
                </CardContent>
              </div>
            </Card>

            {/* Extended */}
            <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} transition-all duration-300 relative overflow-hidden ${
              isCurrentPlan('pro') ? (isDark ? 'border-purple-400 ring-2 ring-purple-400/20' : 'border-purple-500 ring-2 ring-purple-500/20') : ''
            }`}>
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 text-sm z-10">
                <Star className="w-4 h-4 mr-1" aria-hidden />
                Популярный
              </Badge>
              <div className="relative">
                <CardHeader className="text-center pb-6 pt-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
                    <Zap className="w-8 h-8 text-white" aria-hidden />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CardTitle className={`text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Расширенный
                    </CardTitle>
                    {isCurrentPlan('pro') && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Текущий
                      </Badge>
                    )}
                  </div>
                  <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    Для растущих команд
                  </CardDescription>
                  <div className="mt-4">
                    <span className={`text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>5000₽</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>/мес</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "2 собеседования в неделю",
                    "До 45 минут записи",
                    "До 3 страниц макета",
                    "Расширенная библиотека",
                    "Техподдержка",
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" aria-hidden />
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{t}</span>
                    </div>
                  ))}
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Доп. собеседование: +3000₽
                  </p>
                  <Button
                    onClick={() => handlePlanChange('pro')}
                    disabled={isCurrentPlan('pro') || isChanging === 'pro'}
                    className={`w-full mt-4 ${
                      isCurrentPlan('pro')
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    } text-white py-3 shadow-lg shadow-purple-500/25`}
                  >
                    {isChanging === 'pro' ? 'Изменение...' : isCurrentPlan('pro') ? 'Текущий план' : 'Выбрать план'}
                  </Button>
                </CardContent>
              </div>
            </Card>

            {/* Premium */}
            <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} transition-all duration-300 relative overflow-hidden ${
              isCurrentPlan('premium') ? (isDark ? 'border-orange-400 ring-2 ring-orange-400/20' : 'border-orange-500 ring-2 ring-orange-500/20') : ''
            }`}>
              <div className="relative">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Rocket className="w-8 h-8 text-white" aria-hidden />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CardTitle className={`text-2xl bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent ${isDark ? 'text-white' : ''}`}>
                      Премиум
                    </CardTitle>
                    {isCurrentPlan('premium') && (
                      <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Текущий
                      </Badge>
                    )}
                  </div>
                  <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    Для максимальной гибкости
                  </CardDescription>
                  <div className="mt-4">
                    <span className={`text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>15000₽</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>/мес</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Без ограничений по собеседованиям",
                    "До 60 минут на сессию",
                    "Без ограничений по страницам",
                    "Полная библиотека элементов",
                    "Приоритетная поддержка",
                    "Собственные библиотеки/шаблоны",
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" aria-hidden />
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{t}</span>
                    </div>
                  ))}
                  <Button
                    onClick={() => handlePlanChange('premium')}
                    disabled={isCurrentPlan('premium') || isChanging === 'premium'}
                    className={`w-full mt-4 ${
                      isCurrentPlan('premium')
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600'
                    } text-white py-3`}
                  >
                    {isChanging === 'premium' ? 'Изменение...' : isCurrentPlan('premium') ? 'Текущий план' : 'Выбрать план'}
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
