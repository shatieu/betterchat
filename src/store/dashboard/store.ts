import { nanoid } from 'nanoid';
import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import type { WidgetInstance, WidgetInstanceConfig, WidgetSize } from '@/types/widget';

import { type DashboardStoreState, initialDashboardState } from './initialState';

export interface DashboardStore extends DashboardStoreState {
  // Widget instance management
  addWidget: (widgetId: string, config?: Partial<WidgetInstance>) => string;
  moveWidget: (instanceId: string, position: { col: number; row: number }) => void;
  removeWidget: (instanceId: string) => void;
  resizeWidget: (instanceId: string, size: WidgetSize) => void;
  // Legacy actions (kept for backward compat)
  toggleWidget: (widgetId: string) => void;
  updateNotes: (content: string) => void;
  updateWidgetConfig: (instanceId: string, config: Partial<WidgetInstanceConfig>) => void;
  // Widget data state
  setWidgetData: (instanceId: string, data: any) => void;
  setWidgetError: (instanceId: string, error: string | null) => void;
  setWidgetLoading: (instanceId: string, loading: boolean) => void;
}

export const useDashboardStore = createWithEqualityFn<DashboardStore>()(
  persist(
    (set, get) => ({
      ...initialDashboardState,

      addWidget: (widgetId: string, config?: Partial<WidgetInstance>) => {
        const instanceId = config?.instanceId || `${widgetId}-${nanoid(6)}`;
        const layout = get().layout;

        // Find next available row
        const maxRow = layout.widgets.reduce(
          (max, w) => Math.max(max, w.position.row + 1),
          0,
        );

        const newWidget: WidgetInstance = {
          config: config?.config,
          instanceId,
          position: config?.position || { col: 0, row: maxRow },
          size: config?.size || 'medium',
          widgetId,
        };

        set({
          layout: {
            ...layout,
            widgets: [...layout.widgets, newWidget],
          },
        });

        return instanceId;
      },

      moveWidget: (instanceId: string, position: { col: number; row: number }) => {
        const layout = get().layout;
        set({
          layout: {
            ...layout,
            widgets: layout.widgets.map((w) =>
              w.instanceId === instanceId ? { ...w, position } : w,
            ),
          },
        });
      },

      removeWidget: (instanceId: string) => {
        const layout = get().layout;
        set({
          layout: {
            ...layout,
            widgets: layout.widgets.filter((w) => w.instanceId !== instanceId),
          },
        });
      },

      resizeWidget: (instanceId: string, size: WidgetSize) => {
        const layout = get().layout;
        set({
          layout: {
            ...layout,
            widgets: layout.widgets.map((w) =>
              w.instanceId === instanceId ? { ...w, size } : w,
            ),
          },
        });
      },

      setWidgetData: (instanceId: string, data: any) => {
        set((state) => ({
          widgetData: {
            ...state.widgetData,
            [instanceId]: {
              ...state.widgetData[instanceId],
              data,
              error: null,
              lastFetched: Date.now(),
              loading: false,
            },
          },
        }));
      },

      setWidgetError: (instanceId: string, error: string | null) => {
        set((state) => ({
          widgetData: {
            ...state.widgetData,
            [instanceId]: {
              ...state.widgetData[instanceId],
              data: state.widgetData[instanceId]?.data ?? null,
              error,
              lastFetched: state.widgetData[instanceId]?.lastFetched ?? 0,
              loading: false,
            },
          },
        }));
      },

      setWidgetLoading: (instanceId: string, loading: boolean) => {
        set((state) => ({
          widgetData: {
            ...state.widgetData,
            [instanceId]: {
              ...state.widgetData[instanceId],
              data: state.widgetData[instanceId]?.data ?? null,
              error: state.widgetData[instanceId]?.error ?? null,
              lastFetched: state.widgetData[instanceId]?.lastFetched ?? 0,
              loading,
            },
          },
        }));
      },

      toggleWidget: (widgetId: string) => {
        set((state) => ({
          widgetVisibility: {
            ...state.widgetVisibility,
            [widgetId]: !state.widgetVisibility[widgetId],
          },
        }));
      },

      updateNotes: (content: string) => {
        set({ notes: content });
      },

      updateWidgetConfig: (instanceId: string, config: Partial<WidgetInstanceConfig>) => {
        const layout = get().layout;
        set({
          layout: {
            ...layout,
            widgets: layout.widgets.map((w) =>
              w.instanceId === instanceId
                ? { ...w, config: { ...w.config, ...config } }
                : w,
            ),
          },
        });
      },
    }),
    {
      name: 'LOBE_DASHBOARD',
      partialize: (state) => ({
        layout: state.layout,
        notes: state.notes,
        widgetOrder: state.widgetOrder,
        widgetVisibility: state.widgetVisibility,
      }),
    },
  ),
  shallow,
);

export const getDashboardStoreState = () => useDashboardStore.getState();
