export interface CronStoreState {
  filters: {
    agentId?: string;
    enabled?: boolean;
    search?: string;
  };
  pagination: {
    limit: number;
    offset: number;
  };
  selectedIds: string[];
}

export const initialCronState: CronStoreState = {
  filters: {},
  pagination: {
    limit: 20,
    offset: 0,
  },
  selectedIds: [],
};
