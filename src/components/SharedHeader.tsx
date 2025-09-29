import React, { useState } from "react";
import { Eye, Sun, Moon, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useTheme } from "../contexts/ThemeContext";

type Account = { name: string; email: string };

interface SharedHeaderProps {
  account: Account;
  isDark: boolean;
  onThemeToggle: () => void;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
}

export default function SharedHeader({ 
  account, 
  isDark, 
  onThemeToggle, 
  showBackButton = false,
  backButtonText = "Назад",
  backButtonHref = "/app"
}: SharedHeaderProps) {
  const initial = (account.name?.trim()?.[0] || "U").toUpperCase();

  return (
    <header className={`sticky top-0 z-20 backdrop-blur-md border-b ${isDark ? 'bg-black/80 border-purple-500/20' : 'bg-white/90 border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.history.pushState({}, "", backButtonHref);
              window.dispatchEvent(new Event("popstate"));
            }}
            className={`${isDark ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backButtonText}
          </Button>
        )}
        
        <a href="/app" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <span className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Inter<span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">View</span>
          </span>
        </a>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Меню аккаунта"
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition ${
                  isDark
                    ? 'border-white/10 bg-white/10 text-white hover:bg-white/15'
                    : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="font-medium">{initial}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={`min-w-64 p-2 pl-4 ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'} shadow-xl rounded-xl border-t-2 ${isDark ? 'border-t-purple-500' : 'border-t-purple-300'}`}>
              <DropdownMenuItem asChild>
                <a href="/account" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <span className="text-sm font-bold text-purple-500">{initial}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-base">{account.name}</span>
                    <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-500'}`}>{account.email}</span>
                  </div>
                </a>
              </DropdownMenuItem>
              <div className={`mx-2 h-px ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`} />
              <DropdownMenuItem
                onClick={onThemeToggle}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
                  {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-base">{isDark ? "Светлая тема" : "Тёмная тема"}</span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Переключить оформление</span>
                </div>
              </DropdownMenuItem>
              <div className={`mx-2 h-px ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`} />
              <DropdownMenuItem asChild>
                <a href="/login" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-base">Выход</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

