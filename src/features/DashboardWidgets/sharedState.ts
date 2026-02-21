type StateChangeHandler = (value: any) => void;

class WidgetSharedState {
  private state = new Map<string, any>();
  private subscribers = new Map<string, Set<StateChangeHandler>>();

  get(key: string): any {
    return this.state.get(key);
  }

  getAll(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of this.state) {
      result[key] = value;
    }
    return result;
  }

  set(key: string, value: any): void {
    this.state.set(key, value);
    const handlers = this.subscribers.get(key);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(value);
        } catch (error) {
          console.error(`[WidgetSharedState] Error in subscriber for "${key}":`, error);
        }
      }
    }
  }

  subscribe(key: string, handler: StateChangeHandler): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(handler);
    return () => {
      const handlers = this.subscribers.get(key);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }
}

export const widgetSharedState = new WidgetSharedState();
