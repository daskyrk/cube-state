export declare namespace CubeState {
  export interface StoreItem {
    name: string;
    useStore: Function;
    effects: Record<string, Function>;
    reducers: Record<string, Function>;
    getState: Function;
  }

  export type StoreMap = Record<string, StoreItem>;

  export interface effectMetaConfig {
    storeMap: StoreMap;
    update(newState: any): any;
    select(selector: (state: any) => any): any;
  }

  export interface InitOpt {
    pureChecker(fnName: string): boolean;
    effectMeta?(config: effectMetaConfig): object;
  }

  export interface Opt<S, R, E> {
    name: string;
    state: S;
    reducers?: R extends undefined ? undefined : R;
    effects?: E extends undefined ? undefined : E;
    [k: string]: any;
  }

  export type StateSelector<S, P> = (state: S) => P;

  export interface EnhanceReducers<S> {
    [key: string]: EnhanceReducerFn<S>;
  }
  export type EnhanceReducerFn<S> = (state: S, ...payload: any) => any;

  export type Reducers<R> = {
    [K in keyof R]: ReducerFn<R[K]>;
  };
  export type ReducerFn<F> = F extends (state: infer S, ...args: infer A) => any
    ? (...args: A) => any
    : unknown;

  export interface EnhanceEffects<S> {
    [key: string]: EnhanceEffectFn<S>;
  }
  export type EnhanceEffectFn<S> = (
    meta: EffectMeta<S>,
    ...args: any
  ) => Promise<any>;

  export interface EffectMeta<S> {
    call<A, R>(fn: () => R, ...extra: any): Promise<R>;
    call<A, R>(fn: CalledFn<A, R>, payload: A, ...extra: any): Promise<R>;
    update(newState: Partial<S>): any;
    select<P>(selector: StateSelector<S, P>): P;
    [k: string]: any;
  }

  export type CalledFn<A, R> = (payload: A) => R;

  export type Effects<E> = {
    [K in keyof E]: EffectFn<E[K]>;
  };
  export type EffectFn<F> = F extends (
    meta: infer U,
    ...args: infer A
  ) => Promise<any>
    ? (...args: A) => ReturnType<F>
    : unknown;

  export type Updater<S> = (oldState: S, nextState: S) => any;

  export type ErrorFn = (e: Error, meta: object) => any;
  export type ReducerHook = (result: any, reducerName: string) => any;
  export type BeforeEffectHook = (payload: any, meta: object) => any;
  export type AfterEffectHook = (result: any, meta: object) => any;
  export interface Plugin {
    onError?: ErrorFn;
    beforeReducer?: ReducerHook;
    afterReducer?: ReducerHook;
    beforeEffect?: BeforeEffectHook;
    afterEffect?: AfterEffectHook;
    extraReducers?: Function;
  }
  export type HookMap = {
    [K in keyof Plugin]: Function[];
  };
}
