import { type SWRResponse } from 'swr';

import { type AgentCronJob } from '@/database/schemas/agentCronJob';
import { useClientDataSWR } from '@/libs/swr';
import { agentCronJobService } from '@/services/agentCronJob';
import { type StoreSetter } from '@/store/types';
import { setNamespace } from '@/utils/storeDebug';

import { type CronStore } from './store';

const n = setNamespace('cron');

const FETCH_CRON_JOBS_KEY = 'fetchGlobalCronJobs';
const FETCH_CRON_STATS_KEY = 'fetchGlobalCronStats';

type Setter = StoreSetter<CronStore>;
export const createCronActionSlice = (set: Setter, get: () => CronStore, _api?: unknown) =>
  new CronActionImpl(set, get, _api);

export interface CronStats {
  activeJobs: number;
  pausedJobs: number;
  totalExecutions: number;
  totalJobs: number;
}

export class CronActionImpl {
  readonly #get: () => CronStore;
  readonly #set: Setter;

  constructor(set: Setter, get: () => CronStore, _api?: unknown) {
    void _api;
    this.#set = set;
    this.#get = get;
  }

  setFilter = (key: string, value: any) => {
    this.#set(
      (state) => ({
        filters: { ...state.filters, [key]: value },
        pagination: { ...state.pagination, offset: 0 },
      }),
      false,
      n('setFilter'),
    );
  };

  clearFilters = () => {
    this.#set({ filters: {}, pagination: { limit: 20, offset: 0 } }, false, n('clearFilters'));
  };

  setPage = (offset: number) => {
    this.#set(
      (state) => ({
        pagination: { ...state.pagination, offset },
      }),
      false,
      n('setPage'),
    );
  };

  toggleSelection = (id: string) => {
    this.#set(
      (state) => {
        const isSelected = state.selectedIds.includes(id);
        return {
          selectedIds: isSelected
            ? state.selectedIds.filter((sid) => sid !== id)
            : [...state.selectedIds, id],
        };
      },
      false,
      n('toggleSelection'),
    );
  };

  selectAll = (ids: string[]) => {
    this.#set({ selectedIds: ids }, false, n('selectAll'));
  };

  clearSelection = () => {
    this.#set({ selectedIds: [] }, false, n('clearSelection'));
  };

  useFetchCronJobs = (): SWRResponse<{
    data: AgentCronJob[];
    pagination: { hasMore: boolean; limit: number; offset: number; total: number };
  }> => {
    const { filters, pagination } = this.#get();
    return useClientDataSWR(
      [FETCH_CRON_JOBS_KEY, filters, pagination],
      async () => {
        const result = await agentCronJobService.list({
          agentId: filters.agentId,
          enabled: filters.enabled,
          limit: pagination.limit,
          offset: pagination.offset,
        });
        return result;
      },
      { revalidateOnFocus: false },
    );
  };

  useFetchCronStats = (): SWRResponse<CronStats> => {
    return useClientDataSWR(
      [FETCH_CRON_STATS_KEY],
      async () => {
        const result = await agentCronJobService.getStats();
        return result.data;
      },
      { revalidateOnFocus: false },
    );
  };
}

export type CronAction = Pick<CronActionImpl, keyof CronActionImpl>;
