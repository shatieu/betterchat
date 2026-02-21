// ---- Widget Size System ----

export type WidgetSize = 'small' | 'medium' | 'large' | 'wide' | 'full';

// Grid span mapping for each size (columns × rows)
export const WIDGET_SIZE_GRID_SPAN: Record<WidgetSize, { cols: number; rows: number }> = {
  full: { cols: 4, rows: 1 },
  large: { cols: 2, rows: 2 },
  medium: { cols: 2, rows: 1 },
  small: { cols: 1, rows: 1 },
  wide: { cols: 3, rows: 1 },
};

// ---- Trust Levels ----

export type WidgetTrustLevel = 'builtin' | 'trusted' | 'community';

// ---- Data Sources ----

export interface WidgetDataSourceOrchestrator {
  prompt: string;
  refreshInterval: number;
  type: 'orchestrator';
}

export interface WidgetDataSourceEndpoint {
  method?: string;
  params?: Record<string, string>;
  refreshInterval: number;
  type: 'endpoint';
  url: string;
}

export interface WidgetDataSourceNone {
  type: 'none';
}

export type WidgetDataSource =
  | WidgetDataSourceEndpoint
  | WidgetDataSourceNone
  | WidgetDataSourceOrchestrator;

// ---- Events ----

export interface WidgetEventDeclaration {
  name: string;
  payload: Record<string, string>;
}

export interface WidgetEventsConfig {
  emits: WidgetEventDeclaration[];
  listens: Array<{ description: string; name: string }>;
}

// ---- Widget Manifest ----

export interface WidgetManifest {
  author?: string;
  dataSchema?: Record<string, any>;
  dataSource: WidgetDataSource;
  description: string;
  events?: WidgetEventsConfig;
  id: string;
  name: string;
  permissions?: string[];
  sizes: {
    default: WidgetSize;
    supported: WidgetSize[];
  };
  trust: WidgetTrustLevel;
  version: string;
}

// ---- Widget Props (passed to every widget component) ----

export interface WidgetSharedState {
  get: (key: string) => any;
}

export interface WidgetSharedStateWritable extends WidgetSharedState {
  set: (key: string, value: any) => void;
}

export interface WidgetProps<T = any> {
  data: T;
  emit: (event: string, payload?: any) => void;
  loading: boolean;
  sharedState: WidgetSharedState;
  size: WidgetSize;
  theme: 'light' | 'dark';
}

// ---- Widget Instance (placed on dashboard) ----

export interface WidgetInstanceConfig {
  dataSourceOverride?: {
    prompt?: string;
  };
  params?: Record<string, string>;
}

export interface WidgetInstance {
  config?: WidgetInstanceConfig;
  instanceId: string;
  position: { col: number; row: number };
  size: WidgetSize;
  widgetId: string;
}

// ---- Dashboard Layout ----

export interface DashboardLayout {
  columns: number;
  widgets: WidgetInstance[];
}

// ---- Widget Data State (runtime) ----

export interface WidgetDataState {
  data: any;
  error: string | null;
  lastFetched: number;
  loading: boolean;
}

// ---- Widget Registration ----

export type WidgetComponent = React.ComponentType<WidgetProps<any>>;

export interface WidgetRegistration {
  component: React.LazyExoticComponent<{ default: WidgetComponent }> | WidgetComponent;
  manifest: WidgetManifest;
}
