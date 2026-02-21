type EventHandler = (payload: any) => void;

class WidgetEventBus {
  private listeners = new Map<string, Set<EventHandler>>();

  emit(event: string, payload?: any): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (error) {
          console.error(`[WidgetEventBus] Error in handler for "${event}":`, error);
        }
      }
    }
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  on(event: string, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}

export const widgetEventBus = new WidgetEventBus();
