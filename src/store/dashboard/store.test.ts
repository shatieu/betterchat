import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useDashboardStore } from '@/store/dashboard';

afterEach(() => {
  act(() => {
    useDashboardStore.setState({
      notes: '',
      widgetOrder: ['notes', 'agentOutput', 'calendar', 'cronStats', 'recentConversations'],
      widgetVisibility: {
        agentOutput: true,
        calendar: true,
        cronStats: true,
        notes: true,
        recentConversations: true,
      },
    });
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
  });
});
