export type EventCallback = (...args: any[]) => void;

export class EventEmitter {
  private events: { [key: string]: EventCallback[] } = {};

  public on(event: string, listener: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  public off(event: string, listener: EventCallback): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  public emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
}