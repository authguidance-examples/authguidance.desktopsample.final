import {ApplicationEventItem} from './applicationEventItem';

/*
 * A simple event emitter class for the UI
 */
export class ApplicationEvents {

    /*
     * Subscribe to a named event
     */
    public static subscribe(name: string, callback: (data: any) => void): void {

        let item = ApplicationEvents._events.find((e) => e.name === name);
        if (!item) {

            item = {
                name,
                callbacks: [],
            };
            ApplicationEvents._events.push(item);
        }

        item.callbacks.push(callback);
    }

    /*
     * Unsubscribe and remove storage
     */
    public static unsubscribe(name: string, callback: (data: any) => void): void {

        const item = ApplicationEvents._events.find((e) => e.name === name);
        if (item) {
            item.callbacks = item.callbacks.filter((c) => c !== callback);
            if (item.callbacks.length === 0) {
                ApplicationEvents._events = ApplicationEvents._events.filter((e) => e.name !== name);
            }
        }
    }

    /*
     * Dispatch named event messages
     */
    public static publish(name: string, data: any): void {

        const item = ApplicationEvents._events.find((e) => e.name === name);
        if (item) {
            item.callbacks.forEach((callback) => callback(data));
        }
    }

    private static _events: ApplicationEventItem[] = [];
}
