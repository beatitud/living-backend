
export interface IKeyValueStore {
    save(key: string, value: string): Promise<any>;
}

export class KeyValueStore implements IKeyValueStore {
    public save(key: string, value: string): Promise<any> {
        return null;
    }
}
