import React from 'react';

// Пустой registry компонентов для исправления ошибок импорта
// TODO: Реализовать полный registry компонентов

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export interface ComponentRegistryItem {
  component: React.ComponentType<ComponentProps>;
  name: string;
  description?: string;
}

export const ComponentRegistry: Record<string, ComponentRegistryItem> = {
  // Пока пустой - добавим компоненты позже
};

export function getComponent(name: string): React.ComponentType<ComponentProps> | null {
  return ComponentRegistry[name]?.component || null;
}

