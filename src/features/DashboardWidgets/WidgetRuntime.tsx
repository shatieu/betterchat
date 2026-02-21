'use client';

import { Skeleton } from 'antd';
import { memo, Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import type { WidgetInstance, WidgetProps } from '@/types/widget';

import { widgetEventBus } from './eventBus';
import { widgetSharedState } from './sharedState';
import WidgetErrorBoundary from './WidgetErrorBoundary';
import { getWidget } from './widgetRegistry';

interface WidgetRuntimeProps {
  instance: WidgetInstance;
  theme: 'light' | 'dark';
}

const WidgetRuntime = memo<WidgetRuntimeProps>(({ instance, theme }) => {
  const registration = getWidget(instance.widgetId);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data based on data source type
  useEffect(() => {
    if (!registration) return;

    const { dataSource } = registration.manifest;

    if (dataSource.type === 'none') {
      setData({});
      setLoading(false);
      return;
    }

    if (dataSource.type === 'endpoint') {
      const fetchData = async () => {
        setLoading(true);
        try {
          const params = {
            ...dataSource.params,
            ...instance.config?.params,
          };
          const query = new URLSearchParams(params).toString();
          const url = query ? `${dataSource.url}?${query}` : dataSource.url;
          const response = await fetch(url, { method: dataSource.method || 'GET' });
          const json = await response.json();
          setData(json);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
          setLoading(false);
        }
      };

      fetchData();

      if (dataSource.refreshInterval > 0) {
        const interval = setInterval(fetchData, dataSource.refreshInterval * 1000);
        return () => clearInterval(interval);
      }
      return;
    }

    // Orchestrator mode: set loading false with empty data for now
    // The orchestrator LLM integration will be plugged in here
    if (dataSource.type === 'orchestrator') {
      setData({});
      setLoading(false);
    }
  }, [registration, instance.config?.params]);

  // Listen for refresh requests on event bus
  useEffect(() => {
    const unsubscribe = widgetEventBus.on(`refresh:${instance.instanceId}`, () => {
      setLoading(true);
      // Re-trigger fetch by toggling a state (handled by the data source effect)
    });
    return unsubscribe;
  }, [instance.instanceId]);

  // Create emit function scoped to this widget
  const emit = useCallback(
    (event: string, payload?: any) => {
      widgetEventBus.emit(event, {
        ...payload,
        _source: instance.instanceId,
        _widgetId: instance.widgetId,
      });
    },
    [instance.instanceId, instance.widgetId],
  );

  // Create read-only shared state accessor
  const sharedStateAccessor = useMemo(
    () => ({
      get: (key: string) => widgetSharedState.get(key),
    }),
    [],
  );

  if (!registration) {
    return (
      <div style={{ opacity: 0.45, padding: 16, textAlign: 'center' }}>
        Widget &quot;{instance.widgetId}&quot; not found
      </div>
    );
  }

  const WidgetComponent = registration.component as React.ComponentType<WidgetProps>;

  const widgetProps: WidgetProps = {
    data: data ?? {},
    emit,
    loading,
    sharedState: sharedStateAccessor,
    size: instance.size,
    theme,
  };

  return (
    <WidgetErrorBoundary widgetName={registration.manifest.name}>
      <Suspense fallback={<Skeleton active paragraph={{ rows: 3 }} />}>
        <WidgetComponent {...widgetProps} />
      </Suspense>
    </WidgetErrorBoundary>
  );
});

WidgetRuntime.displayName = 'WidgetRuntime';

export default WidgetRuntime;
