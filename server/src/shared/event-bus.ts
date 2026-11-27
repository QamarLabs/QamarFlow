export interface DomainEvent { type: string; [key: string]: unknown }
type Handler<E extends DomainEvent> = (event: E) => void | Promise<void>;

/** In-process event bus. Handlers run after publish; failures are logged, never thrown to the publisher. */
export class EventBus {
  private handlers = new Map<string, Handler<any>[]>();
  subscribe<E extends DomainEvent>(type: E['type'], handler: Handler<E>): void {
    this.handlers.set(type, [...(this.handlers.get(type) ?? []), handler]);
  }
  async publish(event: DomainEvent): Promise<void> {
    for (const h of this.handlers.get(event.type) ?? []) {
      try { await h(event); } catch (err) { console.error(`[event-bus] handler for ${event.type} failed`, err); }
    }
  }
}
