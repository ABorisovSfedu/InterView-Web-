import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  Upload, 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Trash2, 
  FileText,
  File,
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  Wifi,
  WifiOff,
  X,
  Send
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import SharedHeader from "./SharedHeader";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../api/client";
import mod1Client, { WebSocketMessage, ChunkData, TranscribeResponse } from "../api/mod1Client";
import mod2Client, { LayoutResponse, EntitiesResponse } from "../api/mod2Client";
import mod3Client, { MapResponse, ComponentMatch } from "../api/mod3Client";
import PageBuilder from "./visual/PageBuilder";

type FileType = "pdf" | "docx";

type UploadedFile = {
  id: string;
  name: string;
  type: FileType;
  size: string;
  uploadedAt: string;
  status: "uploading" | "processing" | "completed" | "error";
};

type VoiceMessage = {
  id: string;
  sessionId: string;
  duration: number;
  recordedAt: string;
  status: "recording" | "processing" | "completed" | "error";
  url?: string;
  transcript?: string;
  chunks?: ChunkData[];
  finalResult?: TranscribeResponse;
  entities?: EntitiesResponse;
  layout?: LayoutResponse;
  mod3Mapping?: MapResponse;
};

const mockAccount = { name: "Иван Иванов", email: "ivan@example.com" };

function SessionPage() {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([] as UploadedFile[]);
  const [voiceMessages, setVoiceMessages] = useState([] as VoiceMessage[]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);
  
  // Mod1 интеграция состояния
  const [isMod1Connected, setIsMod1Connected] = useState(false);
  const [mod1Status, setMod1Status] = useState('disconnected' as 'disconnected' | 'connecting' | 'connected' | 'error');
  const [currentSessionId, setCurrentSessionId] = useState('');
  
  // Mod2 интеграция состояния
  const [isMod2Connected, setIsMod2Connected] = useState(false);
  const [mod2Status, setMod2Status] = useState('disconnected' as 'disconnected' | 'connecting' | 'connected' | 'error');
  const [vocabData, setVocabData] = useState(null as any);
  const [showVocab, setShowVocab] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [showTextForm, setShowTextForm] = useState(true);
  const [showVoiceForm, setShowVoiceForm] = useState(true);
  
  // Mod3 интеграция состояния
  const [isMod3Connected, setIsMod3Connected] = useState(false);
  const [mod3Status, setMod3Status] = useState('disconnected' as 'disconnected' | 'connecting' | 'connected' | 'error');
  const [mod3VocabData, setMod3VocabData] = useState(null as any);
  const [showMod3Vocab, setShowMod3Vocab] = useState(false);
  
  // PageBuilder состояние
  const [showPageBuilder, setShowPageBuilder] = useState(false);
  const [currentPageLayout, setCurrentPageLayout] = useState(null as any);
  const [autoShowPageBuilder, setAutoShowPageBuilder] = useState(true);
  
  // Последовательный показ результатов
  const [currentStep, setCurrentStep] = useState('recording' as 'recording' | 'mod1' | 'mod2' | 'mod3' | 'complete');
  const [showSequentialResults, setShowSequentialResults] = useState(false);
  
  // Получаем projectId и sessionId из URL
  const pathParts = window.location.pathname.split('/');
  const projectId = pathParts[2]; // /projects/{projectId}/sessions/{sessionId}
  const sessionId = pathParts[4]; // /projects/{projectId}/sessions/{sessionId}
  
  console.log('🔍 SessionPage URL parts:', pathParts);
  console.log('📁 ProjectId:', projectId);
  console.log('🆔 SessionId:', sessionId);
  
  const mediaRecorderRef = useRef(null as MediaRecorder | null);
  const recordingIntervalRef = useRef(null as NodeJS.Timeout | null);
  const audioChunksRef = useRef([] as Blob[]);
  const audioContextRef = useRef(null as AudioContext | null);
  const analyserRef = useRef(null as AnalyserNode | null);
  const animationFrameRef = useRef(null as number | null);

  // Инициализация Mod1 и Mod2 подключений
  useEffect(() => {
    const initializeModules = async () => {
      // Инициализация Mod1
      try {
        setMod1Status('connecting');
        const isMod1Healthy = await mod1Client.healthCheck();
        
        if (isMod1Healthy) {
          setMod1Status('connected');
          setIsMod1Connected(true);
          console.log('✅ Mod1 сервис подключен');
        } else {
          setMod1Status('error');
          setIsMod1Connected(false);
          console.warn('⚠️ Mod1 сервис недоступен');
        }
      } catch (error) {
        console.error('Failed to connect to Mod1:', error);
        setMod1Status('error');
        setIsMod1Connected(false);
      }

      // Инициализация Mod2
      try {
        setMod2Status('connecting');
        const isMod2Healthy = await mod2Client.healthCheck();
        
        if (isMod2Healthy) {
          setMod2Status('connected');
          setIsMod2Connected(true);
          console.log('✅ Mod2 сервис подключен');
        } else {
          setMod2Status('error');
          setIsMod2Connected(false);
          console.warn('⚠️ Mod2 сервис недоступен');
        }
      } catch (error) {
        console.error('Failed to connect to Mod2:', error);
        setMod2Status('error');
        setIsMod2Connected(false);
      }

      // Инициализация Mod3
      try {
        setMod3Status('connecting');
        const isMod3Healthy = await mod3Client.healthCheck();
        
        if (isMod3Healthy) {
          setMod3Status('connected');
          setIsMod3Connected(true);
          console.log('✅ Mod3 сервис подключен');
        } else {
          setMod3Status('error');
          setIsMod3Connected(false);
          console.warn('⚠️ Mod3 сервис недоступен');
        }
      } catch (error) {
        console.error('Failed to connect to Mod3:', error);
        setMod3Status('error');
        setIsMod3Connected(false);
      }
    };

    initializeModules();
  }, []);

  // Генерация уникального session ID
  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Загрузка словаря терминов
  const loadVocab = async () => {
    if (!isMod2Connected) return;
    
    try {
      const vocab = await mod2Client.getVocab();
      setVocabData(vocab);
      setShowVocab(true);
      console.log('✅ Словарь терминов загружен:', vocab);
    } catch (error) {
      console.error('❌ Ошибка загрузки словаря:', error);
      setError('Не удалось загрузить словарь терминов');
    }
  };

  // Загрузка словаря терминов Mod3
  const loadMod3Vocab = async () => {
    if (!isMod3Connected) return;
    
    try {
      const vocab = await mod3Client.getVocab();
      setMod3VocabData(vocab);
      setShowMod3Vocab(true);
      console.log('✅ Словарь терминов Mod3 загружен:', vocab);
    } catch (error) {
      console.error('❌ Ошибка загрузки словаря Mod3:', error);
      setError('Не удалось загрузить словарь терминов Mod3');
    }
  };

  // Обработка сообщений от Mod1 WebSocket
  const handleMod1Message = async (message: any) => {
    console.log('🔍 Received Mod1 message:', message);
    console.log('🔍 Message type:', message.type);
    console.log('🔍 Message data:', message.data);
    
    // Обработка приветственного сообщения
    if (message.type === 'hello') {
      console.log('👋 Mod1 WebSocket hello received');
      return;
    }
    
    // Обработка прогресса
    if (message.type === 'progress') {
      console.log('📊 Mod1 progress:', message.data);
      // Обновляем статус на processing если еще не completed
      setVoiceMessages(prev => 
        prev.map(vm => 
          vm.sessionId === currentSessionId && vm.status !== 'completed'
            ? { ...vm, status: 'processing' }
            : vm
        )
      );
      return;
    }
    
    // Обработка чанков
    if (message.type === 'chunk' && message.data && 'session_id' in message.data) {
      const chunk = message.data as ChunkData;
      console.log('📝 Processing chunk:', chunk);
      
      // Отправляем чанк в Mod2 для NLP обработки (временно отключено из-за проблем с подписью)
      if (isMod2Connected) {
        try {
          console.log('🔄 Sending chunk to Mod2...');
          // await mod2Client.ingestChunk(chunk); // Временно отключено
          console.log('⚠️ Mod2 ingest временно отключен из-за проблем с подписью');
        } catch (error) {
          console.error('❌ Ошибка отправки чанка в Mod2:', error);
          console.error('❌ Error details:', error);
        }
      } else {
        console.warn('⚠️ Mod2 не подключен, пропускаем отправку чанка');
      }
      
      setVoiceMessages(prev => 
        prev.map(vm => 
          vm.sessionId === chunk.session_id 
            ? { 
                ...vm, 
                chunks: [...(vm.chunks || []), chunk],
                transcript: (vm.transcript || '') + chunk.text + ' '
              }
            : vm
        )
      );
    } 
    // Обработка финального результата
    else if (message.type === 'final' && message.data && 'session_id' in message.data) {
      const finalResult = message.data as TranscribeResponse;
      console.log('✅ Processing final result:', finalResult);
      
      // Отправляем финальный результат в Mod2
      if (isMod2Connected) {
        try {
          console.log('🔄 Sending final result to Mod2...');
          await mod2Client.ingestFull({
            session_id: finalResult.session_id,
            text_full: (finalResult as any).text_full || '',
            lang: 'ru-RU',
            duration_sec: (finalResult as any).duration_sec || 0,
            total_chunks: (finalResult as any).total_chunks || 0,
            chunks: (finalResult as any).chunks || []
          });
          console.log('✅ Final result sent to Mod2');
          
          // Небольшая задержка для обработки в Mod2
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Получаем layout от Mod2
          console.log('🔄 Getting layout from Mod2...');
          const layout = await mod2Client.getSessionLayout(finalResult.session_id);
          console.log('✅ Layout получен от Mod2:', layout);
          
          // Получаем mapping от Mod3
          let mod3Mapping: MapResponse | null = null;
          if (isMod3Connected && layout && layout.layout) {
            try {
              console.log('🔄 Getting mapping from Mod3...');
              // Извлекаем entities и keyphrases из layout для отправки в Mod3
              const entities: string[] = [];
              const keyphrases: string[] = [];
              
              // Простой парсинг компонентов для извлечения терминов
              Object.values(layout.layout.sections).forEach((section: any) => {
                if (Array.isArray(section)) {
                  section.forEach((comp: any) => {
                    if (typeof comp === 'object' && comp.component) {
                      const componentName = comp.component.replace('ui.', '').replace('ui-', '');
                      entities.push(componentName);
                    }
                  });
                }
              });
              
              // Добавляем ключевые фразы из транскрипции
              if ((finalResult as any).text_full) {
                keyphrases.push((finalResult as any).text_full);
              }
              
              mod3Mapping = await mod3Client.mapEntities({
                session_id: finalResult.session_id,
                entities,
                keyphrases,
                template: layout.layout.template || 'hero-main-footer'
              });
              console.log('✅ Mapping получен от Mod3:', mod3Mapping);
              
              // Запускаем последовательный показ результатов
              setShowSequentialResults(true);
              setCurrentStep('mod1');
              console.log('🎯 Запускаем последовательный показ результатов');
            } catch (error) {
              console.error('❌ Ошибка получения mapping от Mod3:', error);
            }
          }
          
          setVoiceMessages(prev => 
            prev.map(vm => 
              vm.sessionId === finalResult.session_id 
                ? { 
                    ...vm, 
                    status: 'completed',
                    finalResult,
                    transcript: (finalResult as any).text_full,
                    layout,
                    mod3Mapping
                  }
                : vm
            )
          );
        } catch (error) {
          console.error('❌ Ошибка обработки в Mod2:', error);
          console.error('❌ Error details:', error);
          // Обновляем статус без layout
          setVoiceMessages(prev => 
            prev.map(vm => 
              vm.sessionId === finalResult.session_id 
                ? { 
                    ...vm, 
                    status: 'completed',
                    finalResult,
                    transcript: (finalResult as any).text_full
                  }
                : vm
            )
          );
        }
      } else {
        console.warn('⚠️ Mod2 не подключен, обновляем только с результатом Mod1');
        // Mod2 недоступен, обновляем только с результатом Mod1
        setVoiceMessages(prev => 
          prev.map(vm => 
            vm.sessionId === finalResult.session_id 
              ? { 
                  ...vm, 
                  status: 'completed',
                  finalResult,
                  transcript: (finalResult as any).text_full
                }
              : vm
          )
        );
      }
    } 
    // Обработка ошибок
    else if (message.type === 'error') {
      console.error('❌ Mod1 error:', message.data);
      setError(`Ошибка обработки аудио: ${(message.data as any).error}`);
    } 
    // Неизвестные типы сообщений
    else {
      console.warn('⚠️ Unknown message type:', message.type, 'Data:', message.data);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    // Получаем ID проекта и сессии из URL
    const pathParts = window.location.pathname.split('/');
    const projectId = pathParts[2];
    const sessionId = pathParts[4];
    
    if (!projectId || !sessionId) {
      setError('Неверный URL сессии');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      for (const file of Array.from(files)) {
        const fileType = getFileType(file.name);
        const newFile: UploadedFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: fileType,
          size: formatFileSize(file.size),
          uploadedAt: new Date().toLocaleString(),
          status: "uploading"
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
        
        try {
          await apiClient.uploadSessionFiles(Number(sessionId), [file]);
          
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === newFile.id 
                ? { ...f, status: "completed" as const }
                : f
            )
          );
        } catch (err) {
          console.error('Ошибка загрузки файла:', err);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === newFile.id 
                ? { ...f, status: "error" as const }
                : f
            )
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (filename: string): FileType => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'pdf' ? 'pdf' : 'docx';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: FileType) => {
    return <FileText className="w-5 h-5 text-blue-500" />;
  };

  const startRecording = async () => {
    console.log('🎤 Starting recording...');
    console.log('🔍 Mod1 connected:', isMod1Connected);
    console.log('🔍 Mod2 connected:', isMod2Connected);
    
    if (!isMod1Connected) {
      setError('Mod1 сервис недоступен. Проверьте подключение.');
      return;
    }

    try {
      console.log('🔄 Getting user media...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      // Настраиваем анализ аудио для индикатора громкости
      try {
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);
        
        // Функция для обновления уровня громкости
        const updateAudioLevel = () => {
          if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            
            // Вычисляем средний уровень
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(average);
            
            // Продолжаем обновление только если запись активна
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
            }
          }
        };
        
        // Запускаем обновление после установки isRecording
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            updateAudioLevel();
          }
        }, 100);
      } catch (error) {
        console.warn('⚠️ Audio analysis setup failed:', error);
      }
      
      // Генерируем новый session ID для этой записи
      const sessionId = generateSessionId();
      console.log('🆔 Generated session ID:', sessionId);
      setCurrentSessionId(sessionId);
      
      // Очищаем предыдущие чанки
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('🎵 Audio data available, size:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          
          // Проверяем, что это не пустые данные
          if (event.data.size < 100) {
            console.warn('⚠️ Very small audio chunk detected:', event.data.size, 'bytes - possible silence');
          }
          
          // Аудио данные будут обработаны после остановки записи через REST API
          console.log('📊 Audio chunk received, size:', event.data.size, 'bytes');
        } else {
          console.warn('⚠️ Empty audio chunk received');
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log('🛑 Recording stopped, processing audio...');
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        console.log('📊 Final audio blob:', {
          size: blob.size,
          type: blob.type,
          chunks: audioChunksRef.current.length
        });
        
        // Проверяем, что у нас есть достаточно аудио данных
        if (blob.size < 5000) {
          console.warn('⚠️ Very small audio file detected:', blob.size, 'bytes - possible silence or no audio');
          setError(`Аудио файл слишком маленький (${blob.size} байт). Возможно, микрофон не работает или записывается тишина. Проверьте разрешения на микрофон и попробуйте записать дольше.`);
        }
        
        // Проверяем длительность записи
        if (recordingTime < 2) {
          console.warn('⚠️ Very short recording detected:', recordingTime, 'seconds');
          setError(`Запись слишком короткая (${recordingTime} секунд). Попробуйте записать минимум 2-3 секунды.`);
        }
        
        const newVoiceMessage: VoiceMessage = {
          id: Date.now().toString(),
          sessionId,
          duration: recordingTime,
          recordedAt: new Date().toLocaleString(),
          status: "processing",
          url
        };
        
        setVoiceMessages(prev => [...prev, newVoiceMessage]);
        
        // Скрываем обе формы сразу после создания сообщения
        setShowTextForm(false);
        setShowVoiceForm(false);
        
        // Сразу показываем пошаговые результаты
        setShowSequentialResults(true);
        setCurrentStep('mod1');
        console.log('🎯 Показываем пошаговые результаты сразу после остановки записи');
        
        // Используем REST API для получения результатов
        try {
          console.log('🔄 Sending audio file to Mod1 via REST API...');
          console.log('📊 Blob size:', blob.size, 'bytes, type:', blob.type);
          console.log('🆔 Session ID:', sessionId);
          console.log('🕐 Recording time:', recordingTime, 'seconds');
          console.log('📅 Recorded at:', new Date().toLocaleString());
          
          // Используем blob напрямую для совместимости
          const file = blob as any;
            file.name = `recording_${sessionId}.webm`;
          console.log('✅ Using blob as file for compatibility');
          
          console.log('📁 Created file:', file.name, 'size:', file.size);
          
          const result = await mod1Client.transcribeFile({
            session_id: sessionId,
            lang: 'ru-RU',
            emit_partial: true,
            audio_file: file
          });
          
          console.log('✅ REST API transcription completed:', result);
          
          // Проверяем, есть ли реальный результат транскрипции
          if (!(result as any).text_full || (result as any).text_full.trim() === '') {
            console.warn('⚠️ Empty transcription result - possible silence or very short audio');
            setError('Транскрипция пустая. Возможно, запись слишком короткая или микрофон не работает. Попробуйте записать дольше и громче.');
          }
          
          setVoiceMessages(prev => 
            prev.map(vm => 
              vm.sessionId === sessionId 
                ? { 
                    ...vm, 
                    status: "completed",
                    transcript: (result as any).text_full || 'Транскрипция пустая',
                    finalResult: {
                      session_id: result.session_id,
                      text_full: (result as any).text_full,
                      lang: result.language,
                      duration_sec: recordingTime,
                      total_chunks: 1
                    }
                  }
                : vm
            )
          );
          
          // Обновляем шаг на Mod2 сразу после получения результатов Mod1
          setCurrentStep('mod2');
          console.log('🎯 Mod1 завершен, переходим к Mod2');
          
          // Отправляем данные в Mod2 и получаем layout
          if (isMod2Connected) {
            try {
              console.log('🔄 Sending final result to Mod2...');
              await mod2Client.ingestFull({
                session_id: sessionId,
                text_full: (result as any).text_full,
                lang: result.language || 'ru-RU',
                duration_sec: recordingTime,
                total_chunks: 1,
                chunks: (result as any).chunks || []
              });
              console.log('✅ Final result sent to Mod2');
              
              // Небольшая задержка для обработки в Mod2
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              console.log('🔄 Getting entities from Mod2...');
              const entitiesResult = await mod2Client.getSessionEntities(sessionId);
              console.log('✅ Entities получены от Mod2:', entitiesResult);
              
              // Получаем mapping от Mod3
              let mod3Mapping: MapResponse | undefined = undefined;
              if (isMod3Connected && entitiesResult && entitiesResult.entities) {
                try {
                  console.log('🔄 Generating layout in Mod3...');
                  mod3Mapping = await mod3Client.mapEntities({
                    session_id: sessionId,
                    entities: entitiesResult.entities,
                    keyphrases: entitiesResult.keyphrases || entitiesResult.entities,
                    template: 'hero-main-footer'
                  });
                  console.log('✅ Layout сгенерирован в Mod3:', mod3Mapping);
                  
                  // Не переходим автоматически на завершение - пользователь может выбрать шаг
                  console.log('🎯 Mod3 завершен, пользователь может выбрать шаг');
                } catch (error) {
                  console.error('❌ Ошибка получения mapping от Mod3:', error);
                }
              }
              
              // Обновляем сообщение с результатами Mod2 (сущности)
              setVoiceMessages(prev => 
                prev.map(vm => 
                  vm.sessionId === sessionId 
                    ? { ...vm, entities: entitiesResult }
                    : vm
                )
              );
          
              // Обновляем шаг на Mod3 сразу после получения сущностей от Mod2
              setCurrentStep('mod3');
              console.log('🎯 Mod2 завершен, переходим к Mod3');
          
              // Обновляем сообщение с результатами Mod3 (layout)
              if (mod3Mapping) {
            setVoiceMessages(prev => 
              prev.map(vm => 
                vm.sessionId === sessionId 
                      ? { ...vm, mod3Mapping }
                  : vm
              )
            );
                
                // Не переходим автоматически на завершение - пользователь может выбрать шаг
                console.log('🎯 Mod3 завершен, пользователь может выбрать шаг');
              }
              
            } catch (error) {
              console.error('❌ Ошибка получения entities от Mod2:', error);
            }
          }
          
        } catch (error) {
          console.error('❌ Failed to transcribe audio via REST API:', error);
            setVoiceMessages(prev => 
              prev.map(vm => 
                vm.sessionId === sessionId 
                  ? { ...vm, status: "error" }
                  : vm
              )
            );
        }
      };
      
      // Mod1 не поддерживает WebSocket, используем только REST API
      console.log('✅ Recording started, will use REST API for transcription');
      
        mediaRecorder.start(1000); // Отправляем данные каждую секунду
        setIsRecording(true);
        setRecordingTime(0);
        
        recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Не удалось начать запись. Проверьте разрешения на микрофон.');
    }
  };

  const stopRecording = () => {
    console.log('🛑 Stop recording called');
    if (mediaRecorderRef.current && isRecording) {
      console.log('🔄 Stopping media recorder...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      // Останавливаем анализ аудио
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
          audioContextRef.current.close();
      }
      setAudioLevel(0);
      
      // Очищаем ресурсы после остановки записи
      console.log('✅ Recording stopped, resources cleaned up');
    } else {
      console.warn('⚠️ Cannot stop recording - no media recorder or not recording');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const handleTextSubmit = async () => {
    if (!textInput.trim() || !isMod2Connected) {
      setError('Введите текст и убедитесь, что Mod2 подключен');
      return;
    }

    try {
      setError(null);
      
      // Получаем ID проекта и сессии из URL
      const pathParts = window.location.pathname.split('/');
      const projectId = pathParts[2];
      const sessionId = pathParts[4];
      
      if (!projectId || !sessionId) {
        setError('Неверный URL сессии');
        return;
      }

      console.log('🔄 Отправка текста в Mod2:', textInput);
      
      // Отправляем текст в Mod2
      const chunkResult = await mod2Client.ingestChunk({
        session_id: sessionId,
        chunk_id: `text-chunk-${Date.now()}`,
        seq: 1,
        lang: 'ru-RU',
        text: textInput.trim(),
        overlap_prefix: ''
      });

      console.log('✅ Mod2 обработал текст:', chunkResult);

      // Получаем entities (используем правильный метод)
      const entitiesResult = await mod2Client.getSessionEntities(sessionId);
      console.log('✅ Получены entities:', entitiesResult);

      // Генерируем layout в Mod3 на основе сущностей
      let mod3Mapping: MapResponse | undefined = undefined;
      if (isMod3Connected && entitiesResult && entitiesResult.entities) {
        try {
          mod3Mapping = await mod3Client.mapEntities({
            session_id: sessionId,
            entities: entitiesResult.entities,
            keyphrases: entitiesResult.keyphrases || entitiesResult.entities,
            template: 'hero-main-footer'
          });
          console.log('✅ Layout сгенерирован в Mod3:', mod3Mapping);
        } catch (error) {
          console.error('❌ Ошибка генерации layout в Mod3:', error);
        }
      }

      // Создаем голосовое сообщение с результатами
      const textMessage: VoiceMessage = {
        id: Date.now().toString(),
        sessionId,
        duration: 0,
        recordedAt: new Date().toLocaleString(),
        status: "completed",
        transcript: textInput.trim(),
        finalResult: {
          session_id: sessionId,
          text_full: textInput.trim(),
          chunk_id: `text-chunk-${Date.now()}`,
          confidence: 1.0,
          language: 'ru-RU',
          status: 'ok',
          chunks: []
        },
        entities: entitiesResult,
        mod3Mapping: mod3Mapping
      };

      setVoiceMessages(prev => [...prev, textMessage]);
      setShowSequentialResults(true);
      setCurrentStep('mod1');
      
      // Очищаем поле ввода и скрываем обе формы
      setTextInput('');
      setShowTextForm(false);
      setShowVoiceForm(false);
      
    } catch (error: any) {
      console.error('❌ Ошибка при отправке текста в Mod2:', error);
      setError(`Ошибка при обработке текста: ${error.message}`);
    }
  };

  return (
    <div className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full animate-float ${isDark ? 'bg-gradient-to-r from-cyan-400 to-purple-500' : 'bg-gradient-to-r from-blue-300 to-purple-300'}`}
            style={{
              left: `${(i * 45) % 100}%`,
              top: `${(i * 60) % 100}%`,
              animationDelay: `${(i % 4) * 0.5}s`,
              animationDuration: `${3 + (i % 3)}s`,
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className={`mb-6 p-4 rounded-lg border ${
            isDark 
              ? 'bg-red-500/10 border-red-500/30 text-red-300' 
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        
        <div className="mb-8">
          <div className="pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Получаем ID проекта из URL
                const pathParts = window.location.pathname.split('/');
                const projectId = pathParts[2]; // /projects/{projectId}/sessions/{sessionId}
                window.history.pushState({}, "", `/projects/${projectId}`);
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              className={`mb-4 ${isDark ? 'text-white border-white/30 bg-white/5 hover:bg-white hover:text-black hover:border-white' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к проектам
            </Button>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Новая сессия
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Загружайте файлы и записывайте голосовые сообщения
          </p>
        </div>
            
          </div>
        </div>

        {/* Vocab Display */}
        {showVocab && vocabData && (
          <div className={`mb-6 p-4 rounded-lg border ${
            isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                📚 Словарь терминов Mod2
              </h3>
              <Button
                onClick={() => setShowVocab(false)}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                ✕
              </Button>
            </div>
            <div className="space-y-2">
              <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>
                <strong>Версия:</strong> {vocabData.vocab_version}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {vocabData.terms.map((term: any, index: number) => (
                  <div key={index} className={`p-3 rounded border ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                  }`}>
                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {term.lemma}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Элемент:</strong> {term.element}
                    </p>
                    {term.aliases && term.aliases.length > 0 && (
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <strong>Синонимы:</strong> {term.aliases.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mod3 Vocab Display */}
        {showMod3Vocab && mod3VocabData && (
          <div className={`mb-6 p-4 rounded-lg border ${
            isDark ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                📚 Словарь терминов Mod3
              </h3>
              <Button
                onClick={() => setShowMod3Vocab(false)}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                ✕
              </Button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mod3VocabData.terms.map((term: any, index: number) => (
                  <div key={index} className={`p-3 rounded border ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                  }`}>
                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {term.term}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Категория:</strong> {term.category}
                    </p>
                    {term.synonyms && term.synonyms.length > 0 && (
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <strong>Синонимы:</strong> {term.synonyms.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Real-time Recording Status */}
        {isRecording && (
          <Card className={`mb-6 ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <Mic className="w-5 h-5 text-red-500" />
                  <span className={`font-medium ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    Идет запись...
                  </span>
                </div>
                <div className={`text-2xl font-mono ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                  {formatTime(recordingTime)}
                </div>
                <div className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  Session: {currentSessionId}
                </div>
              </div>
            </CardContent>
          </Card>
        )}




        {/* Последовательный показ результатов */}
        {showSequentialResults && voiceMessages.length > 0 && (
          <Card className={`mb-8 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                        <div>
              <CardTitle className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    🎯 Пошаговые результаты обработки
              </CardTitle>
              <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    Последовательный просмотр результатов каждого модуля
              </CardDescription>
                        </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowTextForm(true);
                      setShowVoiceForm(true);
                      setVoiceMessages([]);
                      setShowSequentialResults(false);
                      setCurrentStep('recording');
                      setTextInput('');
                    }}
                                        variant="outline" 
                    size="sm"
                    className={`${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Начать заново
                  </Button>
                                    </div>
                                  </div>
            </CardHeader>
            <CardContent>
              {/* Индикатор прогресса */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  {['mod1', 'mod2', 'mod3', 'complete'].map((step, index) => (
                    <div key={step} className="flex items-center">
                      <button
                        onClick={() => setCurrentStep(step as any)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200 ${
                        currentStep === step 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                          : ['mod1', 'mod2', 'mod3', 'complete'].indexOf(currentStep) > index
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                        }`}
                      >
                        {index + 1}
                      </button>
                      {index < 3 && (
                        <div className={`w-16 h-1 mx-2 ${
                          ['mod1', 'mod2', 'mod3', 'complete'].indexOf(currentStep) > index
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Mod1: Транскрипция</span>
                  <span>Mod2: NLP анализ</span>
                  <span>Mod3: Visual Mapping</span>
                  <span>Готово</span>
                </div>
              </div>

              {/* Контент текущего шага */}
              <div className="min-h-[400px]">
                {currentStep === 'mod1' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">1</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Модуль 1: Транскрипция речи</h3>
                        <p className="text-sm text-gray-600">Преобразование голоса в текст</p>
                      </div>
                    </div>
                    
                    {voiceMessages.map((message) => (
                      <div key={message.id} className={`p-4 rounded-lg border ${
                        message.finalResult 
                          ? isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
                          : message.status === 'processing'
                          ? isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
                          : isDark ? 'bg-gray-500/10 border-gray-500/30' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="space-y-3">
                          {message.finalResult ? (
                            <>
                          <div>
                            <h4 className="font-medium text-green-800">Транскрипция:</h4>
                            <p className="text-gray-700 mt-1">{message.transcript}</p>
                          </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                  <span className="font-medium">Длительность:</span>
                                  <p>{message.finalResult.duration_sec} сек</p>
                              </div>
                          <div>
                                  <span className="font-medium">Чанков:</span>
                                  <p>{message.finalResult.total_chunks}</p>
                          </div>
                        </div>
                            </>
                          ) : message.status === 'processing' ? (
                          <div className="flex items-center gap-3">
                              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <div>
                                <h4 className="font-medium text-blue-800">Обработка аудио...</h4>
                                <p className="text-sm text-gray-600">Отправка в Mod1 для транскрипции</p>
                        </div>
                      </div>
                    ) : (
                        <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                              <div>
                                <h4 className="font-medium text-gray-800">Ожидание...</h4>
                                <p className="text-sm text-gray-600">Подготовка к обработке</p>
                        </div>
                      </div>
                    )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => setCurrentStep('mod2')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Продолжить к Mod2 →
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 'mod2' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">2</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Модуль 2: NLP анализ</h3>
                        <p className="text-sm text-gray-600">Извлечение сущностей и генерация layout</p>
                      </div>
                    </div>
                    
                    {voiceMessages.map((message) => (
                      <div key={message.id} className={`p-4 rounded-lg border ${
                        message.entities 
                          ? isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'
                          : message.finalResult && !message.entities
                          ? isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
                          : isDark ? 'bg-gray-500/10 border-gray-500/30' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="space-y-3">
                          {message.entities ? (
                            <>
                          <div>
                                <h4 className={`font-semibold text-lg ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                                  Ключевые фразы:
                                </h4>
                                <div className="mt-3 space-y-2">
                                  {message.entities?.keyphrases?.map((phrase: string, index: number) => (
                                    <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border ${
                                      isDark 
                                        ? 'bg-purple-500/10 border-purple-400/30 hover:bg-purple-500/20' 
                                        : 'bg-purple-50 border-purple-200 hover:bg-purple-100'
                                    } transition-colors duration-200`}>
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                        isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-200 text-purple-700'
                                      }`}>
                                        {index + 1}
                          </div>
                                      <span className={`font-medium ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
                                        {phrase}
                                      </span>
                                </div>
                              ))}
                            </div>
                          </div>
                            </>
                          ) : message.finalResult && !message.entities ? (
                        <div className="flex items-center gap-3">
                              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <div>
                                <h4 className="font-medium text-blue-800">Обработка NLP...</h4>
                                <p className="text-sm text-gray-600">Отправка в Mod2 для анализа текста</p>
                        </div>
                      </div>
                    ) : (
                        <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                              <div>
                                <h4 className="font-medium text-gray-800">Ожидание...</h4>
                                <p className="text-sm text-gray-600">Ожидание завершения транскрипции</p>
                        </div>
                      </div>
                    )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-between">
                      <Button 
                        onClick={() => setCurrentStep('mod1')}
                        variant="outline"
                      >
                        ← Назад к Mod1
                      </Button>
                      <Button 
                        onClick={() => setCurrentStep('mod3')}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        Продолжить к Mod3 →
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 'mod3' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">3</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Модуль 3: Visual Mapping</h3>
                        <p className="text-sm text-gray-600">Сопоставление с визуальными элементами</p>
                      </div>
                    </div>
                    
                    {voiceMessages.map((message) => (
                      <div key={message.id} className={`p-4 rounded-lg border ${
                        message.mod3Mapping 
                          ? isDark ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'
                          : message.entities && !message.mod3Mapping
                          ? isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
                          : isDark ? 'bg-gray-500/10 border-gray-500/30' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="space-y-3">
                          {message.mod3Mapping ? (
                            <>
                          <div>
                                <h4 className={`font-semibold text-lg ${isDark ? 'text-orange-300' : 'text-orange-800'}`}>
                                  Сопоставления:
                                </h4>
                                <div className="mt-3 space-y-2">
                              {message.mod3Mapping?.matches?.map((match: ComponentMatch, index: number) => (
                                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                                      isDark 
                                        ? 'bg-orange-500/10 border-orange-400/30 hover:bg-orange-500/20' 
                                        : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                                    } transition-colors duration-200`}>
                                      <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                          isDark ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-200 text-orange-700'
                                        }`}>
                                          {index + 1}
                                        </div>
                                        <span className={`font-medium ${isDark ? 'text-orange-200' : 'text-orange-800'}`}>
                                          {match.term}
                                        </span>
                                        <span className={`text-lg ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>→</span>
                                        <span className={`font-mono text-sm ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                                          {match.component}
                                        </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant="outline"
                                      className={`text-xs ${
                                            match.match_type === 'exact' 
                                              ? isDark ? 'border-green-400 text-green-300' : 'border-green-500 text-green-600'
                                              : match.match_type === 'fuzzy' 
                                              ? isDark ? 'border-yellow-400 text-yellow-300' : 'border-yellow-500 text-yellow-600'
                                              : isDark ? 'border-gray-400 text-gray-300' : 'border-gray-500 text-gray-600'
                                      }`}
                                    >
                                      {match.match_type}
                                    </Badge>
                                        <span className={`text-xs ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
                                      {(match.confidence * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                            </>
                          ) : message.entities && !message.mod3Mapping ? (
                        <div className="flex items-center gap-3">
                              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                          <div>
                                <h4 className={`font-medium ${isDark ? 'text-orange-300' : 'text-orange-800'}`}>Визуальный маппинг...</h4>
                                <p className={`text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Отправка в Mod3 для сопоставления компонентов</p>
                        </div>
                      </div>
                    ) : (
                        <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
                              <div>
                                <h4 className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>Ожидание...</h4>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ожидание завершения NLP анализа</p>
                        </div>
                      </div>
                    )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-between">
                      <Button 
                        onClick={() => setCurrentStep('mod2')}
                        variant="outline"
                      >
                        ← Назад к Mod2
                      </Button>
                      <Button 
                        onClick={() => setCurrentStep('complete')}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Завершить →
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 'complete' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Обработка завершена!</h3>
                        <p className="text-sm text-gray-600">Все модули успешно обработали ваше сообщение</p>
                      </div>
                    </div>
                    
                    <div className={`p-6 rounded-lg border ${
                      isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
                    }`}>
                      <div className="text-center space-y-4">
                        <div className="text-4xl">🎉</div>
                        <h4 className="text-lg font-semibold text-green-800">Готово!</h4>
                        <p className="text-gray-700">
                          Ваше голосовое сообщение было успешно обработано всеми модулями. 
                          Теперь вы можете открыть конструктор страниц для просмотра результата.
                        </p>
                        <div className="flex justify-center gap-4">
                          <Button 
                            onClick={() => {
                              console.log('🎨 Кнопка "Открыть конструктор страниц" нажата');
                              console.log('🆔 SessionId для перехода:', sessionId);
                              
                              if (!sessionId) {
                                console.error('❌ SessionId не определен!');
                                alert('Ошибка: не удалось определить ID сессии');
                                return;
                              }
                              
                              // Сохраняем данные Mod3 в localStorage для передачи в редактор
                              const currentMessage = voiceMessages.find(vm => vm.sessionId === sessionId);
                              if (currentMessage?.mod3Mapping) {
                                localStorage.setItem(`mod3_layout_${sessionId}`, JSON.stringify(currentMessage.mod3Mapping));
                                console.log('💾 Данные Mod3 сохранены в localStorage');
                              }
                              
                              // Переходим на отдельную страницу конструктора
                              const builderUrl = `/builder/${projectId}/${sessionId}`;
                              console.log('🔗 Переходим на:', builderUrl);
                              window.location.href = builderUrl;
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            🎨 Открыть конструктор страниц
                          </Button>
                          <Button 
                            onClick={() => {
                              setShowSequentialResults(false);
                              setCurrentStep('recording');
                            }}
                            variant="outline"
                          >
                            Закрыть
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* PageBuilder Modal */}
        {showPageBuilder && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full h-full max-w-7xl">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold">Конструктор страниц</h2>
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    🎯 Автоматически сгенерировано
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSequentialResults(!showSequentialResults)}
                  >
                    {showSequentialResults ? '🎯' : '📋'} Пошаговый показ
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPageBuilder(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="h-full">
                <PageBuilder
                  mod3Data={voiceMessages.find(msg => msg.mod3Mapping)?.mod3Mapping}
                  onPageChange={setCurrentPageLayout}
                  onSave={(layout) => {
                    console.log('Сохранение страницы:', layout);
                    // Здесь можно добавить логику сохранения
                  }}
                  className="h-full"
                />
                        </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Text Input Section */}
          {showTextForm && (
          <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Текстовый анализ
              </CardTitle>
              <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Отправляйте текст для NLP обработки в Mod2
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                {/* Большой круглый элемент как в голосовых записях */}
                <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
                  isMod2Connected
                    ? isDark
                      ? 'bg-white/10 border-2 border-white/20'
                      : 'bg-gray-100 border-2 border-gray-300'
                    : isDark
                    ? 'bg-red-500/20 border-2 border-red-500'
                    : 'bg-red-100 border-2 border-red-300'
                }`}>
                  <FileText className="w-8 h-8 text-purple-500" />
                </div>
                
                <div className="space-y-4">
                  {/* Textarea */}
                  <div className="max-w-md mx-auto">
                    <textarea
                      placeholder="Введите текст для тестирования Mod2 (например: 'сделай заголовок и кнопку отправки формы')"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className={`w-full p-3 border rounded-md ${
                        isDark ? 'bg-white/5 border-white/20 text-white placeholder-gray-400' : 
                        'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                      } min-h-[100px] resize-none`}
                      disabled={!isMod2Connected}
                    />
              </div>

                  {/* Инструкция */}
                  <div className={`text-sm p-3 rounded ${
                    isDark ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300' : 
                    'bg-purple-50 border border-purple-200 text-purple-600'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">Инструкция по использованию:</span>
                        </div>
                    <ul className="text-xs space-y-1 ml-6">
                      <li>• Опишите желаемый интерфейс текстом</li>
                      <li>• Используйте русский язык</li>
                      <li>• Будьте конкретными в описании</li>
                      <li>• Mod2 извлечет сущности и ключевые фразы</li>
                    </ul>
                      </div>
                  
                  {/* Кнопка отправки */}
                  <div className="flex justify-center">
                        <Button
                      onClick={handleTextSubmit}
                      disabled={!isMod2Connected || !textInput.trim()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isMod2Connected ? 'Отправить в Mod2' : 'Mod2 недоступен'}
                        </Button>
                      </div>
                    </div>
                </div>
            </CardContent>
          </Card>
          )}

          {/* Voice Recording Section */}
          {showVoiceForm && (
          <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Голосовые записи
              </CardTitle>
              <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Записывайте голосовые сообщения
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
                  isRecording
                    ? isDark
                      ? 'bg-red-500/20 border-2 border-red-500 animate-pulse'
                      : 'bg-red-100 border-2 border-red-300 animate-pulse'
                    : isDark
                    ? 'bg-white/10 border-2 border-white/20'
                    : 'bg-gray-100 border-2 border-gray-300'
                }`}>
                  {isRecording ? (
                    <MicOff className="w-8 h-8 text-red-500" />
                  ) : (
                    <Mic className="w-8 h-8 text-blue-500" />
                  )}
                </div>
                
                <div className="space-y-4">
                  <p className={`text-2xl font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatTime(recordingTime)}
                  </p>
                  
                  {/* Индикатор громкости */}
                  {isRecording && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Громкость:
                        </span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-100 ${
                              audioLevel > 50 ? 'bg-green-500' : 
                              audioLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {Math.round(audioLevel)}
                        </span>
                      </div>
                      
                      {/* Предупреждение о низкой громкости */}
                      {audioLevel < 20 && (
                        <div className={`text-xs p-2 rounded ${
                          isDark ? 'bg-red-500/10 border border-red-500/30 text-red-300' : 
                          'bg-red-50 border border-red-200 text-red-600'
                        }`}>
                          ⚠️ Говорите громче! Микрофон почти не слышит вас.
                        </div>
                      )}
                      
                      {/* Инструкция */}
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        💡 Говорите четко и громко в микрофон. Записывайте минимум 3-5 секунд.
                      </div>
                    </div>
                  )}
                  
                  {/* Инструкция перед записью */}
                  {!isRecording && (
                    <div className={`text-sm p-3 rounded ${
                      isDark ? 'bg-blue-500/10 border border-blue-500/30 text-blue-300' : 
                      'bg-blue-50 border border-blue-200 text-blue-600'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Mic className="w-4 h-4" />
                        <span className="font-medium">Инструкция по записи:</span>
                      </div>
                      <ul className="text-xs space-y-1 ml-6">
                        <li>• Говорите четко и громко в микрофон</li>
                        <li>• Записывайте минимум 3-5 секунд</li>
                        <li>• Следите за индикатором громкости</li>
                        <li>• Убедитесь, что микрофон работает</li>
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-4">
                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        disabled={!isMod1Connected}
                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        {isMod1Connected ? 'Начать запись' : 'Mod1 недоступен'}
                      </Button>
                    ) : (
                      <Button
                        onClick={stopRecording}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Остановить
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {voiceMessages.length > 0 && (
                <div className="mt-8 space-y-3">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Записи
                  </h3>
                  {voiceMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg border ${
                        isDark
                          ? 'bg-white/5 border-white/10 hover:border-white/20'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Mic className="w-5 h-5 text-purple-500" />
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatTime(message.duration)}
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            • {message.recordedAt}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              message.status === 'completed'
                                ? isDark 
                                  ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                  : 'bg-green-100 text-green-700 border-green-200'
                                : message.status === 'error'
                                ? isDark
                                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                  : 'bg-red-100 text-red-700 border-red-200'
                                : isDark
                                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                  : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }
                          >
                            {message.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {message.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {message.status === 'recording' && <Mic className="w-3 h-3 mr-1" />}
                            {message.status === 'processing' && <RotateCcw className="w-3 h-3 mr-1 animate-spin" />}
                            {message.status === 'completed' ? 'Готово' : 
                             message.status === 'error' ? 'Ошибка' :
                             message.status === 'recording' ? 'Запись' : 'Обработка'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className={`${isDark ? 'border-white/30 text-white hover:bg-white/15' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={`${isDark ? 'border-red-400/50 text-red-300 hover:bg-red-500/10' : 'border-red-300 text-red-600 hover:bg-red-50'}`}
                            onClick={() => setVoiceMessages(prev => prev.filter(m => m.id !== message.id))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {message.transcript && (
                        <div className="space-y-2">
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <strong>Транскрипт:</strong> {message.transcript}
                          </p>
                          
                          {message.chunks && message.chunks.length > 0 && (
                            <div className="space-y-1">
                              <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                📝 Чанки Mod1 ({message.chunks.length}):
                              </p>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {message.chunks.map((chunk, index) => (
                                  <div key={chunk.chunk_id} className={`text-xs p-2 rounded ${
                                    isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'
                                  }`}>
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono text-blue-500">#{chunk.seq}</span>
                                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {chunk.lang}
                                      </span>
                                    </div>
                                    <p className="mt-1">{chunk.text}</p>
                                    {chunk.overlap_prefix && (
                                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <strong>Overlap:</strong> {chunk.overlap_prefix}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {message.finalResult && (
                            <div className={`text-xs p-3 rounded ${
                              isDark ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'
                            }`}>
                              <p className={`font-medium mb-2 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                                ✅ Результат Mod1 (ASR + Chunk)
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                <p><strong>Длительность:</strong> {message.finalResult.duration_sec?.toFixed(1) || 'N/A'}с</p>
                                <p><strong>Язык:</strong> {message.finalResult.lang || 'N/A'}</p>
                                <p><strong>Всего чанков:</strong> {message.finalResult.total_chunks || 'N/A'}</p>
                                <p><strong>Session ID:</strong> {message.finalResult.session_id || 'N/A'}</p>
                              </div>
                            </div>
                          )}
                          
                          {message.layout && (
                            <div className={`text-xs p-3 rounded ${
                              isDark ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'
                            }`}>
                              <p className={`font-medium mb-2 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                                🎨 Layout Mod2 (NLP + Layout)
                              </p>
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <p><strong>Шаблон:</strong> {message.layout.layout.template}</p>
                                  <p><strong>Секций:</strong> {message.layout.layout.count}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className={`font-medium ${isDark ? 'text-purple-200' : 'text-purple-600'}`}>
                                    Компоненты по секциям:
                                  </p>
                                  {message.layout?.layout?.sections && Object.entries(message.layout.layout.sections).map(([section, components]) => (
                                    <div key={section} className={`text-xs p-2 rounded ${
                                      isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'
                                    }`}>
                                      <span className="font-medium capitalize">{section}:</span> 
                                      {Array.isArray(components) ? components.length : 0} компонентов
                                      {Array.isArray(components) && components.length > 0 && (
                                        <div className="mt-1 space-y-1">
                                          {components.map((comp: any, idx: number) => (
                                            <div key={idx} className={`text-xs px-2 py-1 rounded ${
                                              isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                                            }`}>
                                              {typeof comp === 'object' && comp.component ? comp.component : comp}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          )}
            </div>
      </div>
    </div>
  );
}

export default SessionPage;
