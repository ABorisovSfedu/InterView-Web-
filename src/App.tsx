import React, { useState } from "react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import {
  Mic,
  Brain,
  Eye,
  Users,
  Mail,
  Phone,
  CheckCircle,
  User,
  Menu,
  X,
  Zap,
  Target,
  Rocket,
  Star,
  ArrowRight,
  Play,
  Sparkles,
  Info,
  Shield,
  Globe,
  Edit3,
  Layers,
  Clock,
  Settings,
} from "lucide-react";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Состояние формы обратной связи
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle' as 'idle' | 'success' | 'error');
  const [submitMessage, setSubmitMessage] = useState('');

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };

  // Обработка изменений в форме
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Отправка формы
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const response = await fetch('http://localhost:5001/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(data.message);
        setContactForm({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
        // Показываем детали ошибок валидации, если они есть
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((detail: any) => detail.msg).join(', ');
          setSubmitMessage(`Ошибка валидации: ${errorMessages}`);
        } else {
          setSubmitMessage(data.error || 'Произошла ошибка при отправке сообщения');
        }
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Ошибка сети. Проверьте подключение к интернету.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#hero"
              className="flex items-center gap-3"
              aria-label="InterView — на главную"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Eye
                    className="w-6 h-6 text-white"
                    aria-hidden
                  />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl blur opacity-30 animate-pulse" />
              </div>
              <span className="text-2xl text-white">
                Inter
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  View
                </span>
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex items-center gap-8"
              aria-label="Главная навигация"
            >
              <button
                onClick={() => scrollTo("about")}
                className="text-gray-300 hover:text-cyan-400 transition-colors"
              >
                О проекте
              </button>
              <button
                onClick={() => scrollTo("features")}
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                Функционал
              </button>
              <button
                onClick={() => scrollTo("pricing")}
                className="text-gray-300 hover:text-purple-400 transition-colors"
              >
                Подписки
              </button>
              <button
                onClick={() => scrollTo("fund")}
                className="text-gray-300 hover:text-amber-400 transition-colors"
              >
                Поддержка фонда
              </button>
              <button
                onClick={() => scrollTo("faq")}
                className="text-gray-300 hover:text-emerald-400 transition-colors"
              >
                FAQ
              </button>
              <button
                onClick={() => scrollTo("contact")}
                className="text-gray-300 hover:text-pink-400 transition-colors"
              >
                Контакты
              </button>
            </nav>

            {/* Desktop CTA Button */}
            <Button
              asChild
              className="hidden md:flex bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/25"
            >
              <a
                href="/auth"
                aria-label="Перейти в личный кабинет"
              >
                <User className="w-4 h-4 mr-2" />
                Личный кабинет
              </a>
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white"
              aria-label="Открыть меню"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-purple-500/20">
              <nav
                className="flex flex-col gap-4 pt-4"
                aria-label="Мобильная навигация"
              >
                {[
                  ["О проекте", "about"],
                  ["Функционал", "features"],
                  ["Подписки", "pricing"],
                  ["Поддержка фонда", "fund"],
                  ["FAQ", "faq"],
                  ["Контакты", "contact"],
                ].map(([label, id]) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className="text-left text-gray-300 hover:text-cyan-400 transition-colors"
                  >
                    {label}
                  </button>
                ))}
                <Button
                  asChild
                  className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                >
                  <a href="/auth" aria-label="Личный кабинет">
                    <User className="w-4 h-4 mr-2" />
                    Личный кабинет
                  </a>
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen bg-black overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-purple-900/20 to-black" />
        </div>

        {/* Floating Particles */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden
        >
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

        <div className="relative z-10 flex items-center min-h-screen">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border-cyan-500/30 text-sm px-4 py-2">
                    <Sparkles
                      className="w-4 h-4 mr-2"
                      aria-hidden
                    />
                    AI-Powered Platform
                  </Badge>

                  <h1 className="text-5xl md:text-7xl lg:text-8xl leading-tight">
                    <span className="text-white">Inter</span>
                    <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      View
                    </span>
                  </h1>

                  <h2 className="text-2xl md:text-3xl text-gray-300 leading-relaxed">
                    Веб-платформа{" "}
                    <span className="text-cyan-400">
                      визуализации
                    </span>{" "}
                    требований
                  </h2>

                  <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                    Превращаем устные требования клиента в
                    макеты сайтов в реальном времени с помощью
                    ИИ.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-cyan-500/25 group"
                  >
                    <a
                      href="/auth?intent=register"
                      aria-label="Попробовать бесплатно"
                    >
                      <Play
                        className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform"
                        aria-hidden
                      />
                      Попробовать бесплатно
                      <ArrowRight
                        className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                        aria-hidden
                      />
                    </a>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400"
                  >
                    <a
                      href="#about"
                      aria-label="Узнать больше о проекте"
                    >
                      <Info
                        className="w-5 h-5 mr-2"
                        aria-hidden
                      />
                      Узнать больше
                    </a>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl" />
                <ImageWithFallback
                  src="/hero-image.jpg"
                  alt="Современное рабочее место веб-дизайнера"
                  className="relative object-cover rounded-3xl shadow-2xl shadow-purple-500/25"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Project Section */}
      <section
        id="about"
        className="py-32 px-6 bg-gradient-to-b from-black to-gray-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30 text-sm px-4 py-2 mb-6">
              Наша миссия
            </Badge>
            <h2 className="text-4xl md:text-6xl mb-8 text-white">
              О{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                проекте
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Повышаем конкурентоспособность малых IT-компаний
              за счёт{" "}
              <span className="text-cyan-400">
                онлайн-визуализации требований
              </span>
              .
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {[
              {
                icon: (
                  <Mic
                    className="w-10 h-10 text-white"
                    aria-hidden
                  />
                ),
                title: "Распознавание речи",
                desc: "Преобразование голоса в текст с поддержкой русского языка и доменных терминов.",
              },
              {
                icon: (
                  <Brain
                    className="w-10 h-10 text-white"
                    aria-hidden
                  />
                ),
                title: "Извлечение требований",
                desc: "AI-анализ текста: выделение сущностей и соотнесение с онтологией.",
              },
              {
                icon: (
                  <Eye
                    className="w-10 h-10 text-white"
                    aria-hidden
                  />
                ),
                title: "Визуализация",
                desc: "Автогенерация макетов и редактирование в реальном времени.",
              },
            ].map((c, i) => (
              <Card
                key={i}
                className="bg-white/5 border-white/10 backdrop-blur-sm"
              >
                <CardHeader className="text-center">
                  <div className="relative mx-auto mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                      {c.icon}
                    </div>
                  </div>
                  <CardTitle className="text-white text-2xl">
                    {c.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-center text-lg">
                    {c.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Functionality Section */}
      <section id="features" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 text-sm px-4 py-2 mb-6">
              Технологии
            </Badge>
            <h2 className="text-4xl md:text-6xl mb-6">
              Уникальный{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                функционал
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Всё, что нужно для быстрой и удобной работы с
              требованиями заказчиков
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {[
              {
                icon: <Edit3 className="w-7 h-7" />,
                title: "Редактирование макета",
                text: "Легко настраивайте содержание и внешний вид сайта.",
              },
              {
                icon: <Layers className="w-7 h-7" />,
                title: "Библиотека элементов",
                text: "Используйте готовые блоки и компоненты, чтобы ускорить создание сайта.",
              },
              {
                icon: <Zap className="w-7 h-7" />,
                title: "Скорость результата",
                text: "Получайте рабочий макет за минуты, а не дни.",
              },
              {
                icon: <Eye className="w-7 h-7" />,
                title: "Прозрачность для клиента",
                text: "Заказчик сразу видит, как будет выглядеть сайт, без долгих итераций согласования.",
              },
              {
                icon: <Clock className="w-7 h-7" />,
                title: "Экономия времени",
                text: "Сократите количество встреч и доработок — все изменения вносятся сразу.",
              },
              {
                icon: <Settings className="w-7 h-7" />,
                title: "Персонализация",
                text: "Настраивайте платформу под свои проекты и сохраняйте шаблоны.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="flex gap-4 p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    {f.title}
                  </h3>
                  <p className="text-gray-600">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans Section — aligned with договор/ТЗ */}
      <section
        id="pricing"
        className="py-32 px-6 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700 border-green-200 text-sm px-4 py-2 mb-6">
              Тарифы
            </Badge>
            <h2 className="text-4xl md:text-6xl mb-4">
              Планы{" "}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                подписки
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Выберите тариф под ваши задачи
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Basic */}
            <Card className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50"
                aria-hidden
              />
              <div className="relative">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Target
                      className="w-8 h-8 text-white"
                      aria-hidden
                    />
                  </div>
                  <CardTitle className="text-3xl mb-1">
                    Базовый
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Для первых пилотов
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl">1500₽</span>
                    <span className="text-gray-500">/мес</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "1 собеседование в неделю",
                    "До 20 минут записи",
                    "1 страница макета",
                    "Базовая библиотека элементов",
                  ].map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle
                        className="w-5 h-5 text-green-600"
                        aria-hidden
                      />
                      <span className="text-lg">{t}</span>
                    </div>
                  ))}
                  <p className="text-sm text-gray-500 mt-2">
                    Доп. собеседование: +1500₽
                  </p>
                  <Button
                    asChild
                    className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-lg py-6"
                  >
                    <a href="/auth?intent=register&plan=basic">Начать бесплатно</a>
                  </Button>
                </CardContent>
              </div>
            </Card>

            {/* Extended */}
            <Card className="border-2 border-purple-500 hover:border-purple-600 hover:shadow-2xl transition-all duration-300 relative overflow-hidden scale-105">
              <div
                className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50"
                aria-hidden
              />
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 text-sm z-10">
                <Star className="w-4 h-4 mr-1" aria-hidden />{" "}
                Популярный
              </Badge>
              <div className="relative">
                <CardHeader className="text-center pb-6 pt-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
                    <Zap
                      className="w-8 h-8 text-white"
                      aria-hidden
                    />
                  </div>
                  <CardTitle className="text-3xl mb-1">
                    Расширенный
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Для растущих команд
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl">5000₽</span>
                    <span className="text-gray-500">/мес</span>
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
                    <div
                      key={i}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle
                        className="w-5 h-5 text-green-600"
                        aria-hidden
                      />
                      <span className="text-lg">{t}</span>
                    </div>
                  ))}
                  <p className="text-sm text-gray-500 mt-2">
                    Доп. собеседование: +3000₽
                  </p>
                  <Button
                    asChild
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6 shadow-lg shadow-purple-500/25"
                  >
                    <a href="/auth?intent=register&plan=pro">Выбрать план</a>
                  </Button>
                </CardContent>
              </div>
            </Card>

            {/* Premium */}
            <Card className="border-2 border-orange-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-br from-orange-50 to-yellow-50 opacity-50"
                aria-hidden
              />
              <div className="relative">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Rocket
                      className="w-8 h-8 text-white"
                      aria-hidden
                    />
                  </div>
                  <CardTitle className="text-3xl mb-1 bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                    Премиум
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Для максимальной гибкости
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl">15000₽</span>
                    <span className="text-gray-500">/мес</span>
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
                    <div
                      key={i}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle
                        className="w-5 h-5 text-green-600"
                        aria-hidden
                      />
                      <span className="text-lg">{t}</span>
                    </div>
                  ))}
                  <Button
                    asChild
                    className="w-full mt-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-lg py-6"
                  >
                    <a href="/auth?intent=register&plan=premium">Выбрать план</a>
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Ограничения и состав функций соответствуют условиям
            гранта и функциональным требованиям проекта.
          </p>
        </div>
      </section>

      {/* Fund Support Section */}
      <section
        id="fund"
        className="py-32 px-6 bg-gradient-to-b from-black to-gray-900"
      >
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30 text-sm px-4 py-2 mb-8">
            Грантовая поддержка
          </Badge>
          <h2 className="text-3xl md:text-5xl mb-6 max-w-4xl mx-auto leading-relaxed text-white">
            Проект реализуется при поддержке
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {" "}
              Фонда содействия инновациям
            </span>
          </h2>
          <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">
            Программа{" "}
            <a
              href="https://fasie.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              «Студенческий стартап»
            </a>
            федерального проекта{" "}
            <a
              href="https://univertechpred.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              «Платформа университетского технологического
              предпринимательства»
            </a>
            .
          </p>

          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r rounded-3xl blur-xl" />
              <div className="relative bg-white/10 backdrop-blur-sm p-12 rounded-3xl border border-white/20">
                <img
                  src="https://www.unipack.ru/light_editor_img/images/2020-10-28/file1603787323.jpg"
                  alt="Логотип Фонда содействия инновациям"
                  className="w-40 h-auto mx-auto"
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-10 flex items-center justify-center gap-2">
            Указание грантовой поддержки размещено в
            соответствии с условиями договора.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2">
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl mt-4">
              Частые вопросы
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "Как работает платформа?",
                a: "Вы говорите требования вслух, система преобразует их в текст и сразу создаёт макет сайта.",
              },
              {
                q: "Нужны ли специальные навыки?",
                a: "Нет. Интерфейс простой и понятный — работать могут менеджеры, аналитики и клиенты без технической подготовки.",
              },
              {
                q: "Можно ли редактировать макет?",
                a: "Да. После автоматической генерации вы можете менять текст, цвета, блоки и структуру.",
              },
              {
                q: "Какие есть тарифы?",
                a: "Три уровня подписки: базовый, расширенный и премиум. Выбирайте план в зависимости от задач вашей команды.",
              },
            ].map((item, i) => (
              <Card key={i} className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {item.q}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-700">
                    {item.a}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 border-indigo-200 text-sm px-4 py-2 mb-6">
              Связаться с нами
            </Badge>
            <h2 className="text-4xl md:text-6xl mb-4">
              Готовы{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                начать?
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Оставьте заявку — поможем подобрать подходящий
              тариф и сценарий внедрения.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-12">
              <div>
                <h3 className="text-2xl mb-8 text-gray-900">
                  Контактная информация
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Mail
                        className="w-8 h-8 text-white"
                        aria-hidden
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
                        Email для связи
                      </p>
                      <p className="text-xl text-gray-900">
                        aborisov@sfedu.ru
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Users
                        className="w-8 h-8 text-white"
                        aria-hidden
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
                        Организация
                      </p>
                      <p className="text-xl text-gray-900">
                        ООО «ТЕХНОЛЕММА»
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl mb-6 text-gray-900">
                  Социальные сети и сообщества
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700 h-14 text-lg"
                    asChild
                  >
                    <a
                      href="https://t.me/BorisovAr"
                      aria-label="Telegram канал"
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">
                          T
                        </span>
                      </div>
                      Telegram
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700 h-14 text-lg"
                    asChild
                  >
                    <a
                      href="https://vk.com/ar_borisov"
                      aria-label="VK сообщество"
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">
                          VK
                        </span>
                      </div>
                      VKontakte
                    </a>
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Подписывайтесь на наши обновления и участвуйте
                  в обсуждениях
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="relative">
              <div
                className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl blur-xl opacity-50"
                aria-hidden
              />
              <Card className="relative border-0 shadow-2xl overflow-hidden">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-white to-gray-50"
                  aria-hidden
                />
                <div className="relative">
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-3xl">
                      Форма обратной связи
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600">
                      Заполните форму — мы свяжемся с вами в
                      ближайшее время.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label
                            htmlFor="name"
                            className="text-lg"
                          >
                            Имя
                          </label>
                          <Input
                            id="name"
                            name="name"
                            value={contactForm.name}
                            onChange={handleInputChange}
                            placeholder="Ваше имя"
                            className="h-12 text-lg"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="email"
                            className="text-lg"
                          >
                            Email
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={contactForm.email}
                            onChange={handleInputChange}
                            placeholder="your@email.com"
                            className="h-12 text-lg"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="message"
                          className="text-lg"
                        >
                          Сообщение
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          value={contactForm.message}
                          onChange={handleInputChange}
                          placeholder="Опишите ваши задачи и ожидания..."
                          rows={6}
                          className="text-lg"
                          required
                        />
                      </div>
                      
                      {/* Статус отправки */}
                      {submitStatus === 'success' && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 text-center">{submitMessage}</p>
                        </div>
                      )}
                      
                      {submitStatus === 'error' && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800 text-center">{submitMessage}</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-6 text-lg shadow-lg disabled:opacity-50"
                      >
                        {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
                        <ArrowRight
                          className="w-5 h-5 ml-2"
                          aria-hidden
                        />
                      </Button>
                    </form>
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <a
                href="#hero"
                className="flex items-center gap-3 mb-6"
                aria-label="InterView — на главную"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Eye
                      className="w-6 h-6 text-white"
                      aria-hidden
                    />
                  </div>
                  <div
                    className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl blur opacity-30"
                    aria-hidden
                  />
                </div>
                <span className="text-2xl">
                  Inter
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    View
                  </span>
                </span>
              </a>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                Веб-платформа визуализации требований для
                IT-компаний. Превращаем устные требования в
                макеты с помощью ИИ.
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25"
              >
                <a href="/auth" aria-label="Личный кабинет">
                  <User className="w-4 h-4 mr-2" />
                  Личный кабинет
                </a>
              </Button>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl mb-6">Разделы</h4>
              <div className="space-y-3">
                {[
                  ["О проекте", "about"],
                  ["Функционал", "features"],
                  ["Подписки", "pricing"],
                  ["Поддержка фонда", "fund"],
                  ["FAQ", "faq"],
                  ["Контакты", "contact"],
                ].map(([label, id]) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className="block text-left text-gray-400 hover:text-cyan-400 transition-colors text-lg"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-xl mb-6">Документы</h4>
              <div className="space-y-3">
                <a
                  href="/privacy"
                  className="block text-gray-400 hover:text-cyan-400 transition-colors text-lg"
                >
                  Политика конфиденциальности
                </a>
                <a
                  href="/terms"
                  className="block text-gray-400 hover:text-purple-400 transition-colors text-lg"
                >
                  Условия использования
                </a>
                <a
                  href="/offer"
                  className="block text-gray-400 hover:text-pink-400 transition-colors text-lg"
                >
                  Публичная оферта
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-12 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-lg">
              © {new Date().getFullYear()} InterView. Все права
              защищены.
            </p>
          </div>
        </div>
      </footer>

      </div>
    </ThemeProvider>
  );
}