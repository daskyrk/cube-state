export interface StoreItem {
  name: string;
  useStore: Function;
  effects: Record<string, Function>;
  reducers: Record<string, Function>;
  getState: Function;
  updateState: Function;
}

export type StoreMap = Record<string, StoreItem>;

export interface InitOpt {
  effectMeta?(config: { storeMap: StoreMap }): object;
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
  call<A, R>(fn: calledFn<A, R>, payload: A, ...extra: any): Promise<R>;
  update(newState: Partial<S>): any;
  select<P>(selector: StateSelector<S, P>): P;
}

// export type callFn<F, A, R> = F extends () => R
//   ? (fn: F, ...extra: any) => Promise<R>
//   : (fn: calledFn<A, R>, payload: A, ...extra: any) => Promise<R>
export type calledFn<A, R> = (payload: A) => R;

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
