/*
 * Each application event has a name and a collection of callbacks
 */
export interface ApplicationEventItem {
    name: string;
    callbacks: ((data: any) => void)[];
}
