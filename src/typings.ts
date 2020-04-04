export declare namespace CubeState {
  interface StoreItem {
    name: string;
    effects: Record<string, Function>;
    reducers: Record<string, Function>;
    useStore: Function;
    getState: Function;
    [k: string]: any;
  }

  type StoreMap = Record<string, StoreItem>;

  interface extendEffectConfig {
    update(newState: any): any;
    select(selector: (state: any) => any): any;
  }

  interface InitOpt {
    extendEffect?(config: extendEffectConfig): object;
    onCreate?(store: StoreItem): any;
    pureChecker?(fnName: string): boolean;
  }

  interface Opt<S, R, E> {
    name: string;
    state: S;
    reducers?: R extends undefined ? undefined : R;
    effects?: E extends undefined ? undefined : E;
    [k: string]: any;
  }

  type StateSelector<S, P> = (state: S) => P;

  interface EnhanceReducers<S> {
    [key: string]: EnhanceReducerFn<S>;
  }
  type EnhanceReducerFn<S> = (state: S, ...payload: any) => any;

  type Reducers<R> = {
    [K in keyof R]: ReducerFn<R[K]>;
  };
  type ReducerFn<F> = F extends (state: infer S, ...args: infer A) => any
    ? (...args: A) => any
    : unknown;

  interface EnhanceEffects<S> {
    [key: string]: EnhanceEffectFn<S>;
  }
  type EnhanceEffectFn<S> = (meta: EffectMeta<S>, ...args: any) => Promise<any>;

  interface EffectMeta<S> {
    call<A, R>(fn: () => R, ...extra: any): Promise<R>;
    call<A, R>(fn: CalledFn<A, R>, payload: A, ...extra: any): Promise<R>;
    update(newState: Partial<S>): any;
    select<P>(selector: StateSelector<S, P>): P;
    [k: string]: any;
  }

  type CalledFn<A, R> = (payload: A) => R;

  type Effects<E> = {
    [K in keyof E]: EffectFn<E[K]>;
  };
  type EffectFn<F> = F extends (meta: infer U, ...args: infer A) => Promise<any>
    ? (...args: A) => ReturnType<F>
    : unknown;

  interface Updater<S> {
    (oldState: S, nextState: S): any;
    dirty: boolean;
    ready: boolean;
  }

  type ErrorFn = (e: Error, meta: object) => any;

  interface ReducerParams {
    storeName: string;
    reducerName: string;
    payload: any;
  }
  type ReducerHook = (params: ReducerParams) => any;

  interface BeforeEffectParams<S> extends EffectMeta<S> {
    storeName: string;
    effectName: string;
    payload: any;
    extra?: any;
  }
  type BeforeEffectHook<S> = (params: BeforeEffectParams<S>) => any;

  interface AfterEffectParams<S> extends EffectMeta<S> {
    storeName: string;
    effectName: string;
    result: any;
    extra?: any;
  }
  type AfterEffectHook<S> = (params: BeforeEffectParams<S>) => any;

  interface Plugin {
    onError?: ErrorFn;
    beforeReducer?: ReducerHook;
    afterReducer?: ReducerHook;
    beforeEffect?: BeforeEffectHook<any>;
    afterEffect?: AfterEffectHook<any>;
  }

  type Fun = (...args: any) => any;
  type HookMap = {
    [K in keyof Plugin]: Fun[];
  };
}
