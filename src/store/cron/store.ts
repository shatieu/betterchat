import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { type StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { createDevtools } from '../middleware/createDevtools';
import { flattenActions } from '../utils/flattenActions';
import { type CronAction } from './action';
import { createCronActionSlice } from './action';
import { type CronStoreState } from './initialState';
import { initialCronState } from './initialState';

//  ===============  Aggregate createStoreFn ============ //

export interface CronStore extends CronAction, CronStoreState {}

const createStore: StateCreator<CronStore, [['zustand/devtools', never]]> = (
  ...parameters: Parameters<StateCreator<CronStore, [['zustand/devtools', never]]>>
) => ({
  ...initialCronState,
  ...flattenActions<CronAction>([createCronActionSlice(...parameters)]),
});

//  ===============  Implement useStore ============ //
const devtools = createDevtools('cron');

export const useCronStore = createWithEqualityFn<CronStore>()(
  subscribeWithSelector(
    devtools(createStore, {
      name: 'LobeChat_Cron' + (isDev ? '_DEV' : ''),
    }),
  ),
  shallow,
);

export const getCronStoreState = () => useCronStore.getState();
