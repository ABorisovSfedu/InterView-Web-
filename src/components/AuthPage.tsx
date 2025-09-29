import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import SharedHeader from "./SharedHeader";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

export default function AuthPage() {
  const defaultTab = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const intent = params.get("intent") || params.get("mode") || params.get("tab");
    return intent === "register" || intent === "signup" ? "register" : "login";
  }, []);
  const [tab, setTab] = useState<string>(defaultTab);
  const { isDark, toggleTheme } = useTheme();
  const { login, register, isLoading } = useAuth();
  
  // Состояние форм
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '', 
    name: '',
    plan: 'basic'
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Обработка входа
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      await login(loginData.email, loginData.password);
      // Перенаправление будет обработано в AuthProvider
      window.location.href = '/app';
    } catch (error: any) {
      setErrors({ login: error.message || 'Ошибка входа' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработка регистрации
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Валидация
    if (registerData.password !== registerData.confirmPassword) {
      setErrors({ register: 'Пароли не совпадают' });
      setIsSubmitting(false);
      return;
    }

    if (registerData.password.length < 6) {
      setErrors({ register: 'Пароль должен содержать минимум 6 символов' });
      setIsSubmitting(false);
      return;
    }

    try {
      await register(registerData.email, registerData.password, registerData.name, registerData.plan);
      // Перенаправление будет обработано в AuthProvider
      window.location.href = '/app';
    } catch (error: any) {
      setErrors({ register: error.message || 'Ошибка регистрации' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработка изменения полей
  const handleLoginChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    if (errors.login) setErrors(prev => ({ ...prev, login: '' }));
  };

  const handleRegisterChange = (field: string, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    if (errors.register) setErrors(prev => ({ ...prev, register: '' }));
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-purple-900/20 to-black" />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-float"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animationDelay: `${(i % 5) * 0.4}s`,
              animationDuration: `${4 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      <SharedHeader 
        account={{ name: "Гость", email: "guest@example.com" }}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        showBackButton={false}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div
          className="mx-auto"
          style={{
            width: tab === "register" ? 500 : 420,
            maxWidth: "100%",
            transition: "width 300ms ease",
          }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-2xl">Добро пожаловать в Inter<span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">View</span></CardTitle>
              <CardDescription className="text-gray-300">Войдите в аккаунт или создайте новый</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                {/* Tabs header hidden per request; toggle link below */}

                <TabsContent value="login" className="space-y-4 mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="login-email" className="text-white">Email</label>
                      <Input 
                        id="login-email" 
                        type="email" 
                        placeholder="you@example.com" 
                        className="bg-black/50 border-white/10 text-white placeholder:text-gray-400"
                        value={loginData.email}
                        onChange={(e) => handleLoginChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="login-password" className="text-white">Пароль</label>
                      <Input 
                        id="login-password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="bg-black/50 border-white/10 text-white placeholder:text-gray-400"
                        value={loginData.password}
                        onChange={(e) => handleLoginChange('password', e.target.value)}
                        required
                      />
                    </div>
                    {errors.login && (
                      <div className="text-red-400 text-sm">{errors.login}</div>
                    )}
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {isSubmitting ? 'Вход...' : 'Войти'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4 mt-6">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="reg-name" className="text-white">Имя</label>
                      <Input 
                        id="reg-name" 
                        type="text" 
                        placeholder="Иван Иванов" 
                        className="bg-black/50 border-white/10 text-white placeholder:text-gray-400"
                        value={registerData.name}
                        onChange={(e) => handleRegisterChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="reg-email" className="text-white">Email</label>
                      <Input 
                        id="reg-email" 
                        type="email" 
                        placeholder="you@example.com" 
                        className="bg-black/50 border-white/10 text-white placeholder:text-gray-400"
                        value={registerData.email}
                        onChange={(e) => handleRegisterChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="reg-password" className="text-white">Пароль</label>
                      <Input 
                        id="reg-password" 
                        type="password" 
                        placeholder="Минимум 6 символов" 
                        className="bg-black/50 border-white/10 text-white placeholder:text-gray-400"
                        value={registerData.password}
                        onChange={(e) => handleRegisterChange('password', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="reg-password-confirm" className="text-white">Подтверждение пароля</label>
                      <Input 
                        id="reg-password-confirm" 
                        type="password" 
                        placeholder="Повторите пароль" 
                        className="bg-black/50 border-white/10 text-white placeholder:text-gray-400"
                        value={registerData.confirmPassword}
                        onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
                        required
                      />
                    </div>
                    {errors.register && (
                      <div className="text-red-400 text-sm">{errors.register}</div>
                    )}
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
                    >
                      {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center">
                {tab === "login" ? (
                  <button type="button" onClick={() => setTab("register")} className="text-sm text-gray-300 hover:text-white underline">
                    Нет аккаунта? Зарегистрироваться
                  </button>
                ) : (
                  <button type="button" onClick={() => setTab("login")} className="text-sm text-gray-300 hover:text-white underline">
                    Уже есть аккаунт? Войти
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-gray-400 text-sm mt-6">
            Нажимая кнопки, вы подтверждаете согласие с {" "}
            <a href="/terms" className="underline">условиями использования</a> и {" "}
            <a href="/privacy" className="underline">политикой конфиденциальности</a>.
          </p>
        </div>
      </div>
    </div>
  );
}


