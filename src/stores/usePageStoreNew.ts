// Store для управления состоянием страницы
// Использует PageModel из page-engine и новые API клиенты

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { PageModel, Block, EditorMode, ComponentCatalogItem, DropZone } from '../page-engine/types';
import { webClient } from '../api/web';
import { mod3Client } from '../api/mod3';
import { mod2Client } from '../api/mod2';
import { mod1Client } from '../api/mod1';
import { fetchJson, SessionManager } from '../api/config';
import { debounce } from '../hooks/useDebounce';

// Интерфейсы для результатов генерации
interface Mod1Result {
  session_id: string;
  chunk_id: string;
  text: string;
  confidence: number;
  language: string;
}

interface Mod2Result {
  entities: string[];
  keyphrases: string[];
  chunks_processed: number;
}

interface Mod3Result {
  matches: Array<{
    term: string;
    component: string;
    confidence?: number;
    match_type?: string;
  }>;
  layout: {
    template: string;
    sections: {
      hero: any[];
      main: any[];
      footer: any[];
    };
    count: number;
  };
}

interface GenerationStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number;
  result?: Mod1Result | Mod2Result | Mod3Result | any;
  error?: string;
  retryable?: boolean;
}

interface PageStoreState {
  // Состояние страницы
  pageModel: PageModel | null;
  sessionId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSaved: string | null;
  
  // Состояние редактирования
  editorMode: EditorMode;
  selectedBlockId: string | null;
  isDirty: boolean;
  
  // Каталог компонентов
  componentCatalog: ComponentCatalogItem[];
  catalogLoading: boolean;
  
  // Состояние генерации (новая структура)
  isGenerating: boolean;
  generationStages: GenerationStage[];
  currentStageIndex: number;
  generationComplete: boolean;
  lastGeneratedLayout: PageModel | null;
  
  // Действия базовые
  setSessionId: (sessionId: string) => void;
  setPageModel: (pageModel: PageModel) => void;
  setEditorMode: (mode: EditorMode) => void;
  loadLayout: (sessionId: string) => Promise<void>;
  saveLayout: () => Promise<void>;
  loadComponentCatalog: () => Promise<void>;
  
  // Новые экшены генерации согласно спецификации
  generateFromVoice: (audioFile: File) => Promise<void>;
  generateFromText: (text: string) => Promise<void>;
  generateMixedMode: (audioFile: File, text: string) => Promise<void>;
  
  // Управление стадиями генерации
  updateStage: (stageId: string, updates: Partial<GenerationStage>) => void;
  retryStage: (stageId: string) => Promise<void>;
  resetGeneration: () => void;
  
  // Контекстные действия
  loadExisting: (sessionId: string) => Promise<void>;
  refreshMod3Layout: (sessionId: string) => Promise<void>;
  saveDebounced: () => void;
  
  // Управление блоками
  addBlock: (component: string, dropZone: DropZone, props?: Record<string, any>) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  removeBlock: (blockId: string) => void;
  moveBlock: (blockId: string, newLayout: DropZone) => void;
  resizeBlock: (blockId: string, newColSpan: number) => void;
  selectBlock: (blockId: string | null) => void;
  
  // Утилиты
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  markDirty: () => void;
  markSaved: () => void;
  reset: () => void;
}

// Утилиты для создания стадий генерации
const createStages = (mode: 'voice' | 'text' | 'mixed'): GenerationStage[] => {
  const stages: GenerationStage[] = [
    {
      id: 'mod1-transcribe',
      name: 'Транскрипция аудио',
      description: 'Mod1 распознает речь и извлекает текст',
      status: 'pending',
      progress: 0,
      retryable: true
    },
    {
      id: 'mod2-nlp',
      name: 'NLP обработка',
      description: 'Mod2 анализирует текст и извлекает сущности',
      status: 'pending',
      progress: 0,
      retryable: true
    },
    {
      id: 'mod2-entities',
      name: 'Извлечение сущностей',
      description: 'Получение ключевых сущностей и фраз',
      status: 'pending',
      progress: 0,
      retryable: true
    },
    {
      id: 'mod3-mapping',
      name: 'Визуальное сопоставление',
      description: 'Mod3 сопоставляет сущности с UI компонентами',
      status: 'pending',
      progress: 0,
      retryable: true
    },
    {
      id: 'save-layout',
      name: 'Сохранение layout',
      description: 'Сохранение сгенерированного layout в базе данных',
      status: 'pending',
      progress: 0,
      retryable: true
    }
  ];

  // Для текстового режима пропускаем Mod1
  if (mode === 'text') {
    return stages.filter(stage => stage.id !== 'mod1-transcribe');
  }

  return stages;
};

export const usePageStore = create<PageStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // Начальное состояние
        pageModel: null,
        sessionId: null,
        isLoading: false,
        isSaving: false,
        error: null,
        lastSaved: null,
        editorMode: 'view' as EditorMode,
        selectedBlockId: null,
        isDirty: false,
        componentCatalog: [],
        catalogLoading: false,
        isGenerating: false,
        generationStages: [],
        currentStageIndex: -1,
        generationComplete: false,
        lastGeneratedLayout: null,

        // Действия
        setSessionId: (sessionId: string) => {
          set({ sessionId }, false, 'setSessionId');
        },

        setPageModel: (pageModel: PageModel) => {
          set({ pageModel, isDirty: false }, false, 'setPageModel');
        },

        setEditorMode: (mode: EditorMode) => {
          set({ editorMode: mode }, false, 'setEditorMode');
        },

        loadLayout: async (sessionId: string) => {
          const { setLoading, setError } = get();
          setLoading(true);
          setError(null);

          try {
            const layout = await webClient.loadLayout(sessionId);
            if (layout.status === 'ok' && layout.layout_data) {
              set({
                pageModel: layout.layout_data,
                sessionId,
                isLoading: false,
                error: null
              }, false, 'loadLayout');
            } else {
              set({
                isLoading: false,
                error: layout.error || 'Layout не найден'
              }, false, 'loadLayout');
            }
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Ошибка загрузки layout'
            }, false, 'loadLayout');
          }
        },

        saveLayout: async () => {
          const { pageModel, sessionId, setSaving, setError } = get();
          
          if (!pageModel || !sessionId) {
            console.warn('Нет данных для сохранения');
            return;
          }

          setSaving(true);

          try {
            await webClient.saveLayout(sessionId, pageModel);
            set({ 
              isSaving: false, 
              lastSaved: new Date().toISOString(),
              isDirty: false 
            }, false, 'saveLayout');
          } catch (error) {
            set({
              isSaving: false,
              error: error instanceof Error ? error.message : 'Ошибка сохранения'
            }, false, 'saveLayout');
          }
        },

        loadComponentCatalog: async () => {
          const { catalogLoading, setLoading } = get();
          
          if (catalogLoading) return;
          
          setLoading(true);

          try {
            const catalog = await mod3Client.getComponents();
            if (catalog.status === 'ok') {
              const componentCatalog: ComponentCatalogItem[] = catalog.components.map(comp => ({
                name: comp.name,
                displayName: comp.description || comp.name,
                description: comp.description,
                category: (comp as any).category || 'UI',
                tags: (comp as any).tags || [],
                example_props: comp.example_props || {}
              }));
              
              set({ 
                componentCatalog, 
                catalogLoading: false 
              }, false, 'loadComponentCatalog');
            }
          } catch (error) {
            set({ 
              catalogLoading: false, 
              error: error instanceof Error ? error.message : 'Ошибка загрузки каталога' 
            }, false, 'loadComponentCatalog');
          }
        },

        // ===== НОВЫЕ ЭКШЕНЫ ГЕНЕРАЦИИ =====

        generateFromVoice: async (audioFile: File) => {
          const stages = createStages('voice');
          const sessionId = get().sessionId || SessionManager.ensureSessionId();
          
          set({
            isGenerating: true,
            generationStages: stages,
            currentStageIndex: 0,
            generationComplete: false,
            error: null
          }, false, 'generateFromVoice');

          try {
            // Шаг 1: Транскрипция аудио (Mod1)
            await get().updateStage('mod1-transcribe', { 
              status: 'in-progress', 
              progress: 10 
            });

            const formData = new FormData();
            formData.append('file', audioFile, 'audio.webm');
            formData.append('session_id', sessionId);
            formData.append('lang', 'ru-RU');

            const mod1Response = await fetchJson<Mod1Result>(
              `${import.meta.env.VITE_MOD1_BASE_URL}/v1/transcribe`,
              {
                method: 'POST',
                body: formData,
                isMultipart: true,
                timeout: 10000,
                retries: 2
              },
              { source: 'mod1', sessionId }
            );

            if (mod1Response.status === 'error') {
              throw new Error(mod1Response.error);
            }

            const mod1Result: Mod1Result = mod1Response.data!;
            
            await get().updateStage('mod1-transcribe', {
              status: 'completed',
              progress: 100,
              result: mod1Result
            });

            // Шаг 2: NLP обработка (Mod2)
            await get().updateStage('mod2-nlp', { 
              status: 'in-progress', 
              progress: 20 
            });

            await mod2Client.ingestChunk({
              session_id: sessionId,
              chunk_id: mod1Result.chunk_id,
              seq: 1,
              text: mod1Result.text,
              lang: 'ru-RU',
              timestamp: Date.now()
            });

            await get().updateStage('mod2-nlp', {
              status: 'completed',
              progress: 100
            });

            // Шаг 3: Извлечение сущностей (Mod2)
            await get().updateStage('mod2-entities', { 
              status: 'in-progress', 
              progress: 50 });

            const entitiesResponse = await mod2Client.getEntities(sessionId);
            
            const mod2Result: Mod2Result = {
              entities: entitiesResponse.entities,
              keyphrases: entitiesResponse.keyphrases,
              chunks_processed: entitiesResponse.chunks_processed
            };

            await get().updateStage('mod2-entities', {
              status: 'completed',
              progress: 100,
              result: mod2Result
            });

            // Шаг 4: Визуальное сопоставление (Mod3)
            await get().updateStage('mod3-mapping', { 
              status: 'in-progress', 
              progress: 75 
            });

            const mod3Response = await mod3Client.mapEntities({
              session_id: sessionId,
              entities: mod2Result.entities,
              keyphrases: mod2Result.keyphrases,
              template: 'hero-main-footer'
            });

            const mod3Result: Mod3Result = {
              matches: mod3Response.matches,
              layout: mod3Response.layout
            };

            await get().updateStage('mod3-mapping', {
              status: 'completed',
              progress: 100,
              result: mod3Result
            });

            // Шаг 5: Сохранение layout
            await get().updateStage('save-layout', { 
              status: 'in-progress', 
              progress: 90 
            });

            // Конвертируем Mod3 layout в PageModel
            const layoutData: PageModel = {
              template: layout.template,
              blocks: layout.sections.main?.map((comp: any, index: number) => ({
                id: `block-${Date.now()}-${index}`,
                component: comp.component,
                props: comp.props || {},
                layout: { 
                  colStart: 1, 
                  colSpan: 12, 
                  row: index + 1 
                },
                metadata: {
                  matchType: comp.match_type || 'generated',
                  confidence: comp.confidence || 1.0,
                  usingDefaults: false
                }

              })) || [],
              metadata: {
                sessionId: sessionId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            };

            await webClient.saveLayout(sessionId, layoutData);

            await get().updateStage('save-layout', {
              status: 'completed',
              progress: 100,
              result: { layoutData }
            });

            // Завершение генерации
            set({
              isGenerating: false,
              generationComplete: true,
              pageModel: layoutData,
              sessionId: sessionId,
              lastGeneratedLayout: layoutData,
              isDirty: true
            }, false, 'generateFromVoice');

          } catch (error) {
            console.error('Ошибка генерации из голоса:', error);
            set({
              isGenerating: false,
              error: error instanceof Error ? error.message : 'Ошибка генерации из голоса'
            }, false, 'generateFromVoice');
          }
        },

        generateFromText: async (text: string) => {
          const stages = createStages('text');
          const sessionId = get().sessionId || SessionManager.ensureSessionId();
          
          set({
            isGenerating: true,
            generationStages: stages,
            currentStageIndex: 0,
            generationComplete: false,
            error: null
          }, false, 'generateFromText');

          try {
            // Шаг 1: NLP обработка (Mod2)
            await get().updateStage('mod2-nlp', { 
              status: 'in-progress', 
              progress: 25 
            });

            await mod2Client.ingestChunk({
              session_id: sessionId,
              chunk_id: `text-chunk-${Date.now()}`,
              seq: 1,
              text: text,
              lang: 'ru-RU',
              timestamp: Date.now()
            });

            await get().updateStage('mod2-nlp', {
              status: 'completed',
              progress: 100
            });

            // Шаг 2: Извлечение сущностей (Mod2)
            await get().updateStage('mod2-entities', { 
              status: 'in-progress', 
              progress: 50 
            });

            const entitiesResponse = await mod2Client.getEntities(sessionId);
            
            const mod2Result: Mod2Result = {
              entities: entitiesResponse.entities,
              keyphrases: entitiesResponse.keyphrases,
              chunks_processed: entitiesResponse.chunks_processed
            };

            await get().updateStage('mod2-entities', {
              status: 'completed',
              progress: 100,
              result: mod2Result
            });

            // Шаг 3: Визуальное сопоставление (Mod3)
            await get().updateStage('mod3-mapping', { 
              status: 'in-progress', 
              progress: 75 
            });

            const mod3Response = await mod3Client.mapEntities({
              session_id: sessionId,
              entities: mod2Result.entities,
              keyphrases: mod2Result.keyphrases,
              template: 'hero-main-footer'
            });

            const mod3Result: Mod3Result = {
              matches: mod3Response.matches,
              layout: mod3Response.layout
            };

            await get().updateStage('mod3-mapping', {
              status: 'completed',
              progress: 100,
              result: mod3Result
            });

            // Шаг 4: Сохранение layout
            await get().updateStage('save-layout', { 
              status: 'in-progress', 
              progress: 90 
            });

            // Конвертируем Mod3 layout в PageModel
            const layoutData: PageModel = {
              template: mod3Result.layout.template,
              blocks: mod3Result.layout.sections.main?.map((comp: any, index: number) => ({
                id: `block-${Date.now()}-${index}`,
                component: comp.component,
                props: comp.props || {},
                layout: { 
                  colStart: 1, 
                  colSpan: 12, 
                  row: index + 1 
                },
                metadata: {
                  matchType: comp.match_type || 'generated',
                  confidence: comp.confidence || 1.0,
                  usingDefaults: false
                }
              })) || [],
              metadata: {
                sessionId: sessionId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            };

            await webClient.saveLayout(sessionId, layoutData);

            await get().updateStage('save-layout', {
              status: 'completed',
              progress: 100,
              result: { layoutData }
            });

            // Завершение генерации
            set({
              isGenerating: false,
              generationComplete: true,
              pageModel: layoutData,
              sessionId: sessionId,
              lastGeneratedLayout: layoutData,
              isDirty: true
            }, false, 'generateFromText');

          } catch (error) {
            console.error('Ошибка генерации из текста:', error);
            set({
              isGenerating: false,
              error: error instanceof Error ? error.message : 'Ошибка генерации из текста'
            }, false, 'generateFromText');
          }
        },

        generateMixedMode: async (audioFile: File, text: string) => {
          // Приоритет у текста - используем текст для генерации
          await get().generateFromText(text);
        },

        // Управление стадиями генерации
        updateStage: (stageId: string, updates: Partial<GenerationStage>) => {
          const { generationStages } = get();
          const newStages = generationStages.map(stage => 
            stage.id === stageId ? { ...stage, ...updates } : stage
          );
          
          const currentIndex = newStages.findIndex(stage => stage.id === stageId);
          
          set({ 
            generationStages: newStages,
            currentStageIndex: currentIndex 
          }, false, 'updateStage');
        },

        retryStage: async (stageId: string) => {
          const { updateStage } = get();
          updateStage(stageId, { status: 'pending', progress: 0, error: undefined });
          // Здесь можно реализовать повторную попытку выполнения стадии
        },

        resetGeneration: () => {
          set({
            isGenerating: false,
            generationStages: [],
            currentStageIndex: -1,
            generationComplete: false,
            error: null
          }, false, 'resetGeneration');
        },

        // Контекстные действия
        loadExisting: async (sessionId: string) => {
          await get().loadLayout(sessionId);
        },

        refreshMod3Layout: async (sessionId: string) => {
          set({ isLoading: true, error: null }, false, 'refreshMod3Layout');
          try {
            const layout = await mod3Client.getLayout(sessionId);
            if (layout.status === 'ok') {
              // Конвертируем Mod3 layout в PageModel формат
              const layoutData: PageModel = {
                template: layout.layout.template,
                blocks: layout.layout.sections.main?.map((comp: any, index: number) => ({
                  id: `block-${Date.now()}-${index}`,
                  component: comp.component,
                  props: comp.props || {},
                  layout: { 
                    colStart: 1, 
                    colSpan: 12, 
                    row: index + 1 
                  },
                  metadata: {
                    matchType: comp.match_type || 'generated',
                    confidence: comp.confidence || 1.0,
                    usingDefaults: false
                  }
                })) || [],
                metadata: {
                  sessionId: sessionId,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              };
              
              set({
                pageModel: layoutData,
                sessionId,
                isLoading: false,
                error: null
              }, false, 'refreshMod3Layout');
            } else {
              set({
                isLoading: false,
                error: layout.error || 'Ошибка обновления layout от Mod3'
              }, false, 'refreshMod3Layout');
            }
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Ошибка обновления layout'
            }, false, 'refreshMod3Layout');
          }
        },

        saveDebounced: debounce(() => {
          get().saveLayout();
        }, 500),

        // Управление блоками
        addBlock: (component: string, dropZone: DropZone, props?: Record<string, any>) => {
          const { pageModel, componentCatalog } = get();
          if (!pageModel) return;

          // Найти компонент в каталоге для получения example_props
          const catalogItem = componentCatalog.find(item => item.name === component);
          const finalProps = props || catalogItem?.example_props || {};
          const usingDefaults = !props && !!catalogItem?.example_props;

          const newBlock: Block = {
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            component,
            props: finalProps,
            layout: dropZone,
            metadata: {
              matchType: 'manual',
              usingDefaults
            }
          };

          const newPageModel: PageModel = {
            ...pageModel,
            blocks: [...pageModel.blocks, newBlock]
          };

          set({ pageModel: newPageModel, isDirty: true }, false, 'addBlock');
        },

        updateBlock: (blockId: string, updates: Partial<Block>) => {
          const { pageModel } = get();
          if (!pageModel) return;

          const newBlocks = pageModel.blocks.map(block => 
            block.id === blockId ? { ...block, ...updates } : block
          );

          set({ 
            pageModel: { ...pageModel, blocks: newBlocks }, 
            isDirty: true 
          }, false, 'updateBlock');
        },

        removeBlock: (blockId: string) => {
          const { pageModel } = get();
          if (!pageModel) return;

          const newBlocks = pageModel.blocks.filter(block => block.id !== blockId);
          
          set({ 
            pageModel: { ...pageModel, blocks: newBlocks },
            isDirty: true, 
            selectedBlockId: get().selectedBlockId === blockId ? null : get().selectedBlockId 
          }, false, 'removeBlock');
        },

        moveBlock: (blockId: string, newLayout: DropZone) => {
          const { pageModel } = get();
          if (!pageModel) return;

          const newBlocks = pageModel.blocks.map(block => 
            block.id === blockId ? { ...block, layout: newLayout } : block
          );

          set({ 
            pageModel: { ...pageModel, blocks: newBlocks }, 
            isDirty: true 
          }, false, 'moveBlock');
        },

        resizeBlock: (blockId: string, newColSpan: number) => {
          const { pageModel } = get();
          if (!pageModel) return;

          const newBlocks = pageModel.blocks.map(block => 
            block.id === blockId 
              ? { ...block, layout: { ...block.layout, colSpan: newColSpan } }
              : block
          );

          set({ 
            pageModel: { ...pageModel, blocks: newBlocks }, 
            isDirty: true 
          }, false, 'resizeBlock');
        },

        selectBlock: (blockId: string | null) => {
          set({ selectedBlockId: blockId }, false, 'selectBlock');
        },

        // Утилиты
        setLoading: (loading: boolean) => {
          set({ isLoading: loading }, false, 'setLoading');
        },

        setSaving: (saving: boolean) => {
          set({ isSaving: saving }, false, 'setSaving');
        },

        setError: (error: string | null) => {
          set({ error }, false, 'setError');
        },

        markDirty: () => {
          set({ isDirty: true }, false, 'markDirty');
        },

        markSaved: () => {
          set({ isDirty: false, lastSaved: new Date().toISOString() }, false, 'markSaved');
        },

        reset: () => {
          set({
            pageModel: null,
            sessionId: null,
            isLoading: false,
            isSaving: false,
            error: null,
            lastSaved: null,
            editorMode: 'view' as EditorMode,
            selectedBlockId: null,
            isDirty: false,
            componentCatalog: [],
            catalogLoading: false,
            isGenerating: false,
            generationStages: [],
            currentStageIndex: -1,
            generationComplete: false,
            lastGeneratedLayout: null
          }, false, 'reset');
        }
      }),
      {
        name: 'page-store',
        partialize: (state) => ({
          pageModel: state.pageModel,
          lastSaved: state.lastSaved,
          sessionId: state.sessionId
        })
      }
    ),
    {
      name: 'page-store'
    }
  )
);
