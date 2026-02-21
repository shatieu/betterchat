import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useDashboardStore } from '@/store/dashboard';

import { DEFAULT_LAYOUT, initialDashboardState } from './initialState';

afterEach(() => {
  act(() => {
    useDashboardStore.setState(initialDashboardState);
  });
});

describe('DashboardStore', () => {
  describe('updateNotes', () => {
    it('should update notes content', () => {
      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.updateNotes('Hello world');
      });

      expect(result.current.notes).toBe('Hello world');
    });

    it('should handle empty notes', () => {
      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.updateNotes('Some content');
      });
      act(() => {
        result.current.updateNotes('');
      });

      expect(result.current.notes).toBe('');
    });
  });

  describe('toggleWidget', () => {
    it('should toggle widget visibility off', () => {
      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.toggleWidget('notes');
      });

      expect(result.current.widgetVisibility.notes).toBe(false);
    });

    it('should toggle widget visibility on', () => {
      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.toggleWidget('notes');
      });
      act(() => {
        result.current.toggleWidget('notes');
      });

      expect(result.current.widgetVisibility.notes).toBe(true);
    });

    it('should not affect other widgets', () => {
      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.toggleWidget('calendar');
      });

      expect(result.current.widgetVisibility.calendar).toBe(false);
      expect(result.current.widgetVisibility.notes).toBe(true);
      expect(result.current.widgetVisibility.cronStats).toBe(true);
    });
  });

  describe('initial state', () => {
    it('should have all widgets visible by default', () => {
      const { result } = renderHook(() => useDashboardStore());

      expect(result.current.widgetVisibility.notes).toBe(true);
      expect(result.current.widgetVisibility.agentOutput).toBe(true);
      expect(result.current.widgetVisibility.calendar).toBe(true);
      expect(result.current.widgetVisibility.cronStats).toBe(true);
      expect(result.current.widgetVisibility.recentConversations).toBe(true);
    });

    it('should have empty notes by default', () => {
      const { result } = renderHook(() => useDashboardStore());
      expect(result.current.notes).toBe('');
    });

    it('should have correct widget order', () => {
      const { result } = renderHook(() => useDashboardStore());
      expect(result.current.widgetOrder).toEqual([
        'notes',
        'agentOutput',
        'calendar',
        'cronStats',
        'recentConversations',
      ]);
    });

    it('should have default layout with 5 built-in widgets', () => {
      const { result } = renderHook(() => useDashboardStore());
      expect(result.current.layout).toEqual(DEFAULT_LAYOUT);
      expect(result.current.layout.widgets).toHaveLength(5);
      expect(result.current.layout.columns).toBe(4);
    });
  });

  describe('widget instance management', () => {
    it('should add a widget to the layout', () => {
      const { result } = renderHook(() => useDashboardStore());

      let instanceId: string = '';
      act(() => {
        instanceId = result.current.addWidget('clock');
      });

      expect(instanceId).toBeTruthy();
      expect(result.current.layout.widgets).toHaveLength(6);
      const added = result.current.layout.widgets.find((w) => w.instanceId === instanceId);
      expect(added).toBeDefined();
      expect(added!.widgetId).toBe('clock');
      expect(added!.size).toBe('medium');
    });

    it('should add a widget with custom config', () => {
      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.addWidget('clock', {
          instanceId: 'custom-clock',
          position: { col: 1, row: 1 },
          size: 'small',
        });
      });

      const widget = result.current.layout.widgets.find((w) => w.instanceId === 'custom-clock');
      expect(widget).toBeDefined();
      expect(widget!.size).toBe('small');
      expect(widget!.position).toEqual({ col: 1, row: 1 });
    });

    it('should remove a widget from the layout', () => {
      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.removeWidget('builtin-notes');
      });

      expect(result.current.layout.widgets).toHaveLength(4);
      expect(
        result.current.layout.widgets.find((w) => w.instanceId === 'builtin-notes'),
      ).toBeUndefined();
    });

    it('should resize a widget', () => {
      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.resizeWidget('builtin-notes', 'large');
      });

      const widget = result.current.layout.widgets.find(
        (w) => w.instanceId === 'builtin-notes',
      );
      expect(widget!.size).toBe('large');
    });

    it('should move a widget', () => {
      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.moveWidget('builtin-notes', { col: 3, row: 5 });
      });

      const widget = result.current.layout.widgets.find(
        (w) => w.instanceId === 'builtin-notes',
      );
      expect(widget!.position).toEqual({ col: 3, row: 5 });
    });

    it('should update widget config', () => {
      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.updateWidgetConfig('builtin-notes', {
          dataSourceOverride: { prompt: 'Custom prompt' },
        });
      });

      const widget = result.current.layout.widgets.find(
        (w) => w.instanceId === 'builtin-notes',
      );
      expect(widget!.config?.dataSourceOverride?.prompt).toBe('Custom prompt');
    });
  });

  describe('widget data state', () => {
    it('should set widget data', () => {
      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.setWidgetData('builtin-notes', { content: 'test' });
      });

      expect(result.current.widgetData['builtin-notes'].data).toEqual({ content: 'test' });
      expect(result.current.widgetData['builtin-notes'].loading).toBe(false);
      expect(result.current.widgetData['builtin-notes'].error).toBeNull();
    });

    it('should set widget loading state', () => {
      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.setWidgetLoading('builtin-notes', true);
      });

      expect(result.current.widgetData['builtin-notes'].loading).toBe(true);
    });

    it('should set widget error', () => {
      const { result } = renderHook(() => useDashboardStore());

      act(() => {
        result.current.setWidgetError('builtin-notes', 'Something went wrong');
      });

      expect(result.current.widgetData['builtin-notes'].error).toBe('Something went wrong');
      expect(result.current.widgetData['builtin-notes'].loading).toBe(false);
    });
  });
});
