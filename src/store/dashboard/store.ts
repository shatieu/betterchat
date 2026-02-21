import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { type DashboardStoreState, initialDashboardState } from './initialState';

export interface DashboardStore extends DashboardStoreState {
  toggleWidget: (widgetId: string) => void;
  updateNotes: (content: string) => void;
}

export const useDashboardStore = createWithEqualityFn<DashboardStore>()(
  persist(
    (set) => ({
      ...initialDashboardState,
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
    }),
    {
      name: 'LOBE_DASHBOARD',
      partialize: (state) => ({
        notes: state.notes,
        widgetOrder: state.widgetOrder,
        widgetVisibility: state.widgetVisibility,
      }),
    },
  ),
  shallow,
);

export const getDashboardStoreState = () => useDashboardStore.getState();
