import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { agentCronJobService } from '@/services/agentCronJob';
import { useCronStore } from '@/store/cron';

// Mock dependencies
vi.mock('@/services/agentCronJob', () => ({
  agentCronJobService: {
    batchUpdateStatus: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    getById: vi.fn(),
    getNearDepletion: vi.fn(),
    getStats: vi.fn(),
    list: vi.fn(),
    resetExecutions: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/libs/trpc/client/lambda', () => ({
  lambdaClient: {},
}));

afterEach(() => {
  vi.restoreAllMocks();
  // Reset store state between tests
  act(() => {
    useCronStore.setState({
      filters: {},
      pagination: { limit: 20, offset: 0 },
      selectedIds: [],
    });
  });
});

describe('CronStore', () => {
  describe('setFilter', () => {
    it('should set a filter and reset pagination offset', () => {
      const { result } = renderHook(() => useCronStore());

      // First set offset to something non-zero
      act(() => {
        result.current.setPage(40);
      });
      expect(result.current.pagination.offset).toBe(40);

      // Setting a filter should reset offset
      act(() => {
        result.current.setFilter('agentId', 'agent-123');
      });

      expect(result.current.filters.agentId).toBe('agent-123');
      expect(result.current.pagination.offset).toBe(0);
    });

    it('should set enabled filter', () => {
      const { result } = renderHook(() => useCronStore());

      act(() => {
        result.current.setFilter('enabled', true);
      });

      expect(result.current.filters.enabled).toBe(true);
    });

    it('should set search filter', () => {
      const { result } = renderHook(() => useCronStore());

      act(() => {
        result.current.setFilter('search', 'daily report');
      });

      expect(result.current.filters.search).toBe('daily report');
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters and pagination', () => {
      const { result } = renderHook(() => useCronStore());

      act(() => {
        result.current.setFilter('agentId', 'agent-123');
        result.current.setFilter('enabled', true);
        result.current.setPage(40);
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({});
      expect(result.current.pagination).toEqual({ limit: 20, offset: 0 });
    });
  });

  describe('setPage', () => {
    it('should set pagination offset', () => {
      const { result } = renderHook(() => useCronStore());

      act(() => {
        result.current.setPage(20);
      });

      expect(result.current.pagination.offset).toBe(20);
    });
  });

  describe('selection', () => {
    it('should toggle selection - add', () => {
      const { result } = renderHook(() => useCronStore());

      act(() => {
        result.current.toggleSelection('job-1');
      });

      expect(result.current.selectedIds).toEqual(['job-1']);
    });

    it('should toggle selection - remove', () => {
      const { result } = renderHook(() => useCronStore());

      act(() => {
        result.current.toggleSelection('job-1');
      });
      act(() => {
        result.current.toggleSelection('job-1');
      });

      expect(result.current.selectedIds).toEqual([]);
    });

    it('should select all', () => {
      const { result } = renderHook(() => useCronStore());

      act(() => {
        result.current.selectAll(['job-1', 'job-2', 'job-3']);
      });

      expect(result.current.selectedIds).toEqual(['job-1', 'job-2', 'job-3']);
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useCronStore());

      act(() => {
        result.current.selectAll(['job-1', 'job-2']);
      });
      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedIds).toEqual([]);
    });
  });
});
