import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Home, 
  ArrowLeft, 
  Search, 
  AlertTriangle,
  Eye,
  Sparkles
} from "lucide-react";
import { ThemeProvider } from "../contexts/ThemeContext";

export default function NotFoundPage() {
  const goHome = () => {
    window.location.href = '/';
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating orbs */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${20 + Math.random() * 60}px`,
                height: `${20 + Math.random() * 60}px`,
                background: `linear-gradient(45deg, ${
                  ['#06b6d4', '#8b5cf6', '#ec4899', '#3b82f6'][Math.floor(Math.random() * 4)]
                }, transparent)`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
          
          {/* Twinkling stars */}
          {[...Array(30)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-purple-900/20 to-black" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 animate-pulse" />
            </div>
            <span className="text-4xl font-bold text-white drop-shadow-lg">
              Inter
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                View
              </span>
            </span>
          </div>

          {/* 404 Section */}
          <div className="mb-12">
            <Badge className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border-cyan-500/30 text-lg px-6 py-3 mb-6 shadow-lg">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Ошибка 404
            </Badge>
            
            <div className="mb-8">
              <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
                404
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Страница не найдена
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                К сожалению, запрашиваемая страница не существует или была перемещена. 
                Возможно, вы перешли по устаревшей ссылке или ввели неправильный адрес.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={goHome}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-xl shadow-cyan-500/25 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Home className="w-5 h-5 mr-2" />
              На главную
            </Button>
            
            <Button
              onClick={goBack}
              variant="outline"
              className="border-2 border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-400 text-purple-400 hover:text-white px-8 py-4 text-lg transition-all duration-300 backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Назад
            </Button>
          </div>

          {/* Helpful Links Card */}
          <Card className="bg-black/50 border-purple-500/20 backdrop-blur-md max-w-2xl mx-auto shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                <Search className="w-6 h-6 text-cyan-400" />
                Полезные ссылки
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Возможно, вы искали одну из этих страниц
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="ghost"
                  className="h-auto p-4 text-left hover:bg-purple-500/10 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300"
                  onClick={() => window.location.href = '/#about'}
                >
                  <div>
                    <div className="font-semibold text-white mb-1">О проекте</div>
                    <div className="text-sm text-gray-300">Узнайте больше о InterView</div>
                  </div>
                </Button>
                
                <Button
                  variant="ghost"
                  className="h-auto p-4 text-left hover:bg-purple-500/10 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300"
                  onClick={() => window.location.href = '/#features'}
                >
                  <div>
                    <div className="font-semibold text-white mb-1">Функционал</div>
                    <div className="text-sm text-gray-300">Возможности платформы</div>
                  </div>
                </Button>
                
                <Button
                  variant="ghost"
                  className="h-auto p-4 text-left hover:bg-purple-500/10 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300"
                  onClick={() => window.location.href = '/#pricing'}
                >
                  <div>
                    <div className="font-semibold text-white mb-1">Тарифы</div>
                    <div className="text-sm text-gray-300">Планы подписки</div>
                  </div>
                </Button>
                
                <Button
                  variant="ghost"
                  className="h-auto p-4 text-left hover:bg-purple-500/10 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300"
                  onClick={() => window.location.href = '/#contact'}
                >
                  <div>
                    <div className="font-semibold text-white mb-1">Контакты</div>
                    <div className="text-sm text-gray-300">Связаться с нами</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fun fact */}
          <div className="mt-12 p-6 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl border border-cyan-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-semibold">Интересный факт</span>
            </div>
            <p className="text-gray-300">
              Ошибка 404 получила свое название от комнаты 404 в CERN, где находился первый веб-сервер. 
              Когда файл не находился, говорили "404: файл не найден".
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
