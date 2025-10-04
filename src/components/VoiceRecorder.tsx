import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, StopIcon, PlayIcon } from '@heroicons/react/24/solid';
import { Button } from './ui/button';

interface VoiceRecorderProps {
  onRecordingComplete: (audioFile: File) => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete, 
  disabled = false 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioData, setAudioData] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Таймер записи
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        setAudioData(audioBlob);
        // Создаем File объект из Blob для совместимости с API
        const audioFile = new File([audioBlob], 'recording.webm', {
          type: 'audio/webm',
          lastModified: Date.now()
        });
        onRecordingComplete(audioFile);
        
        // Остановить все треки для освобождения микрофона
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Собираем данные каждые 100ms
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
      alert('Не удалось получить доступ к микрофону. Разрешите доступ в настройках браузера.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = () => {
    if (audioData) {
      // Создаем File объект из Blob для совместимости с API
      const audioFile = new File([audioData], 'recording.webm', {
        type: 'audio/webm',
        lastModified: Date.now()
      });
      onRecordingComplete(audioFile);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        🎤 Запись голоса
      </h3>
      
      <div className="space-y-4">
        {/* Время записи */}
        <div className="text-center">
          <div className={`text-3xl font-mono font-bold ${
            isRecording ? 'text-red-500' : 'text-gray-400'
          }`}>
            {formatTime(recordingTime)}
          </div>
          {isRecording && (
            <div className="flex items-center justify-center mt-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm text-red-400">Запись...</span>
            </div>
          )}
        </div>

        {/* Кнопки управления */}
        <div className="flex justify-center gap-4">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={disabled}
              className="bg-red-600 hover:bg-red-700 px-6 py-3"
            >
              <MicrophoneIcon className="h-6 w-6 mr-2" />
              Начать запись
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-3"
            >
              <StopIcon className="h-6 w-6 mr-2" />
              Остановить
            </Button>
          )}
        </div>

        {/* Информация о записи */}
        <div className="text-sm text-gray-400 space-y-1">
          <p>• Нажмите "Начать запись" для звукозаписи</p>
          <p>• Снимите с микрофона что бы услышать вас чётко</p>
          <p>• Формат: WebM (opus кодек)</p>
          {audioData && (
            <p className="text-green-400">
              ✅ Запись готова: {(audioData.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>

        {/* Предпросмотр записи */}
        {audioData && (
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">
                Готово к отправке на транскрипцию
              </span>
              <div className="flex gap-2">
                <audio 
                  controls 
                  src={URL.createObjectURL(audioData)}
                  className="text-sm"
                >
                  Ваш браузер не поддерживает воспроизведение аудио
                </audio>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
