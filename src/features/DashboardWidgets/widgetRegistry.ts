import type { WidgetComponent, WidgetManifest, WidgetRegistration } from '@/types/widget';

const registry = new Map<string, WidgetRegistration>();

export const registerWidget = (
  manifest: WidgetManifest,
  component: WidgetComponent | React.LazyExoticComponent<{ default: WidgetComponent }>,
) => {
  registry.set(manifest.id, { component, manifest });
};

export const getWidget = (id: string): WidgetRegistration | undefined => {
  return registry.get(id);
};

export const getAllWidgets = (): WidgetRegistration[] => {
  return Array.from(registry.values());
};

export const getWidgetManifest = (id: string): WidgetManifest | undefined => {
  return registry.get(id)?.manifest;
};
