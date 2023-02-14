import { IAliceActiveRequest, IAliceClientOptions } from "./types";

function MapWatch<Key, Value>(onSet?: (...args: any) => void) {
  const map = new Map();

  return {
    get: (key: Key): Value => map.get(key),
    set: (key: Key, value: Partial<Value>) => map.set(key, value),
    delete: (key: Key) => map.delete(key),
    add: (key: Key, value: Partial<Value>) => {
      let obj = map.get(key);

      if (!obj) {
        map.set(key, {});
        obj = {};
      }

      Object.assign(obj, value);
      map.set(key, obj);
    },
    push: <VT>(key: Key, index: string, value: VT) => {
      let obj = map.get(key);
      let objKeyVal = obj[index] ?? [];

      if (!obj) {
        map.set(key, {});
        obj = {};
      }

      objKeyVal.push(value);
      obj[index] = objKeyVal;
      map.set(key, obj);
    },
    resolve: (key: Key) => {
      const obj = map.get(key);
      if (obj && onSet) onSet(key, obj);
    },
  };
}

export default class Store {
  public store = MapWatch<string, IAliceActiveRequest>(
    this.onStoreChanged.bind(this)
  );
  public stream = MapWatch<string, { i: string; b: Buffer[] }>();
  private resolvers = new Map<string, (...args: any) => void>();
  private timeouters = new Map<string, NodeJS.Timeout>();

  constructor(private readonly opts: IAliceClientOptions) {}

  private onStoreChanged(key: string, value: IAliceActiveRequest) {
    const resolver = this.resolvers.get(key);
    if (resolver) resolver(value);
  }

  public async request(
    request: (...args: any) => string
  ): Promise<IAliceActiveRequest> {
    // Send a request
    const reqId = request();

    // Wait for response
    const response: IAliceActiveRequest = await new Promise(
      (resolve, reject): void => {
        this.timeouters.set(
          reqId,
          setTimeout(() => {
            this.store.delete(reqId);
            this.resolvers.delete(reqId);
            this.timeouters.delete(reqId);
            reject(new Error("REQUEST_TIMEOUT"));
          }, this.opts.reqTimeout)
        );
        this.resolvers.set(reqId, (result) => {
          this.store.delete(reqId);
          this.resolvers.delete(reqId);
          this.timeouters.delete(reqId);
          resolve(result);
        });
      }
    );

    // Return response
    return response;
  }
}
