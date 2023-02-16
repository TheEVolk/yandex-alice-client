/// <reference types="node" />
import { IAliceActiveRequest, IAliceClientOptions } from "./types";
export default class Store {
    private readonly opts;
    store: {
        get: (key: string) => IAliceActiveRequest;
        set: (key: string, value: Partial<IAliceActiveRequest>) => Map<any, any>;
        delete: (key: string) => boolean;
        add: (key: string, value: Partial<IAliceActiveRequest>) => void;
        push: <VT>(key: string, index: string, value: VT) => void;
        resolve: (key: string) => void;
    };
    stream: {
        get: (key: string) => {
            i: string;
            b: Buffer[];
        };
        set: (key: string, value: Partial<{
            i: string;
            b: Buffer[];
        }>) => Map<any, any>;
        delete: (key: string) => boolean;
        add: (key: string, value: Partial<{
            i: string;
            b: Buffer[];
        }>) => void;
        push: <VT>(key: string, index: string, value: VT) => void;
        resolve: (key: string) => void;
    };
    private resolvers;
    private timeouters;
    constructor(opts: IAliceClientOptions);
    private onStoreChanged;
    request(request: (...args: any) => string): Promise<IAliceActiveRequest>;
}
//# sourceMappingURL=store.d.ts.map