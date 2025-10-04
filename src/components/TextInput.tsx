import React, { useState } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/solid';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

interface TextInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ 
  onSubmit, 
  disabled = false 
}) => {
  const [text, setText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const placeholderTexts = [
    "Сделай сайт с заголовком и кнопкой отправки формы",
    "Создай страницу авторизации с полями логин и пароль", 
    "Сделай лендинг с hero-блоком, описанием услуг и контактами",
    "Создайте форму заказа с полями имени, email и телефон",
    "Сделай блог с заголовками статей и кратким описанием"
  ];

  const samplePrompt = placeholderTexts[Math.floor(Math.random() * placeholderTexts.length)];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        ✏️ Текстовое описание
      </h3>
      
      <div className="space-y-4">
        {/* Текстовое поле */}
        <div className="space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder={`Например: ${samplePrompt}`}
            disabled={disabled}
            className="min-h-[120px] bg-gray-900 border-gray-600 text-white placeholder-gray-400 resize-none"
            onKeyPress={handleKeyPress}
          />
          
          {/* Счетчик символов */}
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>{text.length} символов</span>
            <span>Ctrl + Enter для отправки</span>
          </div>
        </div>

        {/* Кнопка отправки */}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={disabled || !text.trim()}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Отправить на генерацию
          </Button>
        </div>

        {/* Советы */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            💡 Советы для лучших результатов:
          </h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Называйте конкретные элементы: "кнопка", "заголовок", "форма"</li>
            <li>• Указывайте расположение: "сверху", "посередине", "внизу"</li>
            <li>• Описывайте функции: "страница входа", "меню навигации"</li>
            <li>• Используйте простые и понятные предложения</li>
          </ul>
        </div>

        {/* Примеры */}
        {!isExpanded && (
          <div className="text-xs text-gray-500">
            Примеры: "{samplePrompt}"
          </div>
        )}
      </div>
    </div>
  );
};

export default TextInput;
