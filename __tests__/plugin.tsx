import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import {
  cleanup,
  fireEvent,
  render,
  waitForElement
} from "@testing-library/react";
import init from "../src/index";
// import { devtools, redux } from '../src/middleware'

const consoleError = console.error;
afterEach(() => {
  cleanup();
  console.error = consoleError;
});

// it('can update the equality checker', async () => {
//   const [useStore, { setState }] = create(() => ({ value: 0 }))
//   const selector = s => s.value

//   let renderCount = 0
//   function Component({ equalityFn }) {
//     const value = useStore(selector, equalityFn)
//     return (
//       <div>
//         renderCount: {++renderCount}, value: {value}
//       </div>
//     )
//   }

//   // Set an equality checker that always returns false to always re-render.
//   const { getByText, rerender } = render(<Component equalityFn={() => false} />)

//   // This will cause a re-render due to the equality checker.
//   act(() => setState({ value: 0 }))
//   await waitForElement(() => getByText('renderCount: 2, value: 0'))

//   // Set an equality checker that always returns true to never re-render.
//   rerender(<Component equalityFn={() => true} />)

//   // This will NOT cause a re-render due to the equality checker.
//   act(() => setState({ value: 1 }))
//   await waitForElement(() => getByText('renderCount: 3, value: 0'))
// })

// it('can call useStore with progressively more arguments', async () => {
//   const [useStore, { setState }] = create(() => ({ value: 0 }))

//   let renderCount = 0
//   function Component({ selector, equalityFn }: any) {
//     const value = useStore(selector, equalityFn)
//     return (
//       <div>
//         renderCount: {++renderCount}, value: {JSON.stringify(value)}
//       </div>
//     )
//   }

//   // Render with no args.
//   const { getByText, rerender } = render(<Component />)
//   await waitForElement(() => getByText('renderCount: 1, value: {"value":0}'))

//   // Render with selector.
//   rerender(<Component selector={s => s.value} />)
//   await waitForElement(() => getByText('renderCount: 2, value: 0'))

//   // Render with selector and equality checker.
//   rerender(
//     <Component
//       selector={s => s.value}
//       equalityFn={(oldV, newV) => oldV > newV}
//     />
//   )

//   // Should not cause a re-render because new value is less than previous.
//   act(() => setState({ value: -1 }))
//   await waitForElement(() => getByText('renderCount: 3, value: 0'))

//   act(() => setState({ value: 1 }))
//   await waitForElement(() => getByText('renderCount: 4, value: 1'))
// })

// it('can throw an error in selector', async () => {
//   console.error = jest.fn()

//   const initialState = { value: 'foo' }
//   const [useStore, { setState }] = create(() => initialState)
//   const selector = s => s.value.toUpperCase()

//   class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
//     constructor(props) {
//       super(props)
//       this.state = { hasError: false }
//     }
//     static getDerivedStateFromError() {
//       return { hasError: true }
//     }
//     render() {
//       return this.state.hasError ? <div>errored</div> : this.props.children
//     }
//   }

//   function Component() {
//     useStore(selector)
//     return <div>no error</div>
//   }

//   const { getByText } = render(
//     <ErrorBoundary>
//       <Component />
//     </ErrorBoundary>
//   )
//   await waitForElement(() => getByText('no error'))

//   delete initialState.value
//   act(() => {
//     setState({})
//   })
//   await waitForElement(() => getByText('errored'))
// })

// it('can throw an error in equality checker', async () => {
//   console.error = jest.fn()

//   const initialState = { value: 'foo' }
//   const [useStore, { setState }] = create(() => initialState)
//   const selector = s => s
//   const equalityFn = (a, b) => a.value.trim() === b.value.trim()

//   class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
//     constructor(props) {
//       super(props)
//       this.state = { hasError: false }
//     }
//     static getDerivedStateFromError() {
//       return { hasError: true }
//     }
//     render() {
//       return this.state.hasError ? <div>errored</div> : this.props.children
//     }
//   }

//   function Component() {
//     useStore(selector, equalityFn)
//     return <div>no error</div>
//   }

//   const { getByText } = render(
//     <ErrorBoundary>
//       <Component />
//     </ErrorBoundary>
//   )
//   await waitForElement(() => getByText('no error'))

//   delete initialState.value
//   act(() => {
//     setState({})
//   })
//   await waitForElement(() => getByText('errored'))
// })

// it('can subscribe to the store', () => {
//   const initialState = { value: 1, other: 'a' }
//   const [, { setState, getState, subscribe }] = create(() => initialState)

//   // Should not be called if new state identity is the same
//   let unsub = subscribe(() => {
//     throw new Error('subscriber called when new state identity is the same')
//   })
//   setState(initialState)
//   unsub()

//   // Should be called if new state identity is different
//   unsub = subscribe((newState: { value: number; other: string } | null) => {
//     expect(newState && newState.value).toBe(1)
//   })
//   setState({ ...getState() })
//   unsub()

//   // Should not be called when state slice is the same
//   unsub = subscribe(
//     () => {
//       throw new Error('subscriber called when new state is the same')
//     },
//     s => s.value
//   )
//   setState({ other: 'b' })
//   unsub()

//   // Should be called when state slice changes
//   unsub = subscribe(
//     (value: number | null) => {
//       expect(value).toBe(initialState.value + 1)
//     },
//     s => s.value
//   )
//   setState({ value: initialState.value + 1 })
//   unsub()

//   // Should not be called when equality checker returns true
//   unsub = subscribe(
//     () => {
//       throw new Error('subscriber called when equality checker returned true')
//     },
//     undefined,
//     () => true
//   )
//   setState({ value: initialState.value + 2 })
//   unsub()

//   // Should be called when equality checker returns false
//   unsub = subscribe(
//     (value: number | null) => {
//       expect(value).toBe(initialState.value + 2)
//     },
//     s => s.value,
//     () => false
//   )
//   setState(getState())
//   unsub()
// })

// it('can destroy the store', () => {
//   const [, { destroy, getState, setState, subscribe }] = create(() => ({
//     value: 1,
//   }))

//   subscribe(() => {
//     throw new Error('did not clear listener on destroy')
//   })
//   destroy()

//   setState({ value: 2 })
//   expect(getState().value).toEqual(2)
// })

// it('only calls selectors when necessary', async () => {
//   const [useStore, { setState }] = create(() => ({ a: 0, b: 0 }))
//   let inlineSelectorCallCount = 0
//   let staticSelectorCallCount = 0

//   function staticSelector(s) {
//     staticSelectorCallCount++
//     return s.a
//   }

//   function Component() {
//     useStore(s => (inlineSelectorCallCount++ , s.b))
//     useStore(staticSelector)
//     return (
//       <>
//         <div>inline: {inlineSelectorCallCount}</div>
//         <div>static: {staticSelectorCallCount}</div>
//       </>
//     )
//   }

//   const { rerender, getByText } = render(<Component />)
//   await waitForElement(() => getByText('inline: 1'))
//   await waitForElement(() => getByText('static: 1'))

//   rerender(<Component />)
//   await waitForElement(() => getByText('inline: 2'))
//   await waitForElement(() => getByText('static: 1'))

//   act(() => setState({ a: 1, b: 1 }))
//   await waitForElement(() => getByText('inline: 4'))
//   await waitForElement(() => getByText('static: 2'))
// })

// it('ensures parent components subscribe before children', async () => {
//   const [useStore, api] = create<any>(() => ({
//     children: {
//       '1': { text: 'child 1' },
//       '2': { text: 'child 2' },
//     },
//   }))

//   function changeState() {
//     api.setState({
//       children: {
//         '3': { text: 'child 3' },
//       },
//     })
//   }

//   function Child({ id }) {
//     const text = useStore(s => s.children[id].text)
//     return <div>{text}</div>
//   }

//   function Parent() {
//     const childStates = useStore(s => s.children)
//     return (
//       <>
//         <button onClick={changeState}>change state</button>
//         {Object.keys(childStates).map(id => (
//           <Child id={id} key={id} />
//         ))}
//       </>
//     )
//   }

//   const { getByText } = render(<Parent />)

//   fireEvent.click(getByText('change state'))

//   await waitForElement(() => getByText('child 3'))
// })

// // https://github.com/react-spring/zustand/issues/84
// it('ensures the correct subscriber is removed on unmount', async () => {
//   const [useStore, api] = create(() => ({ count: 0 }))

//   function increment() {
//     api.setState(({ count }) => ({ count: count + 1 }))
//   }

//   function Count() {
//     const c = useStore(s => s.count)
//     return <div>count: {c}</div>
//   }

//   function CountWithInitialIncrement() {
//     React.useLayoutEffect(increment, [])
//     return <Count />
//   }

//   function Component() {
//     const [Counter, setCounter] = React.useState(
//       () => CountWithInitialIncrement
//     )
//     React.useLayoutEffect(() => {
//       setCounter(() => Count)
//     }, [])
//     return (
//       <>
//         <Counter />
//         <Count />
//       </>
//     )
//   }

//   const { findAllByText } = render(<Component />)

//   expect((await findAllByText('count: 1')).length).toBe(2)

//   act(increment)

//   expect((await findAllByText('count: 2')).length).toBe(2)
// })

// // https://github.com/react-spring/zustand/issues/86
// it('ensures a subscriber is not mistakenly overwritten', async () => {
//   const [useStore, { setState }] = create(() => ({ count: 0 }))

//   function Count1() {
//     const c = useStore(s => s.count)
//     return <div>count1: {c}</div>
//   }

//   function Count2() {
//     const c = useStore(s => s.count)
//     return <div>count2: {c}</div>
//   }

//   // Add 1st subscriber.
//   const { findAllByText, rerender } = render(<Count1 />)

//   // Replace 1st subscriber with another.
//   rerender(<Count2 />)

//   // Add 2 additional subscribers.
//   rerender(
//     <>
//       <Count2 />
//       <Count1 />
//       <Count1 />
//     </>
//   )

//   // Call all subscribers
//   act(() => setState({ count: 1 }))

//   expect((await findAllByText('count1: 1')).length).toBe(2)
//   expect((await findAllByText('count2: 1')).length).toBe(1)
// })

// it('can use exposed types', () => {
//   interface ExampleState extends State {
//     num: number
//     numGet: () => number
//     numGetState: () => number
//     numSet: (v: number) => void
//     numSetState: (v: number) => void
//   }

//   const listener: StateListener<ExampleState> = state => {
//     if (state) {
//       const value = state.num * state.numGet() * state.numGetState()
//       state.numSet(value)
//       state.numSetState(value)
//     }
//   }
//   const selector: StateSelector<ExampleState, number> = state => state.num
//   const partial: PartialState<ExampleState> = { num: 2, numGet: () => 2 }
//   const partialFn: PartialState<ExampleState> = state => ({ num: 2, ...state })
//   const equlaityFn: EqualityChecker<ExampleState> = (state, newState) =>
//     state !== newState

//   const [useStore, storeApi] = create<ExampleState>((set, get) => ({
//     num: 1,
//     numGet: () => get().num,
//     numGetState: () => {
//       // TypeScript can't get the type of storeApi when it trys to enforce the signature of numGetState.
//       // Need to explicitly state the type of storeApi.getState().num or storeApi type will be type 'any'.
//       const result: number = storeApi.getState().num
//       return result
//     },
//     numSet: v => {
//       set({ num: v })
//     },
//     numSetState: v => {
//       storeApi.setState({ num: v })
//     },
//   }))

//   const stateCreator: StateCreator<ExampleState> = (set, get) => ({
//     num: 1,
//     numGet: () => get().num,
//     numGetState: () => get().num,
//     numSet: v => {
//       set({ num: v })
//     },
//     numSetState: v => {
//       set({ num: v })
//     },
//   })

//   const subscriber: Subscriber<ExampleState, number> = {
//     currentSlice: 1,
//     equalityFn: Object.is,
//     errored: false,
//     listener(n: number | null) { },
//     selector,
//     unsubscribe: () => { },
//   }

//   function checkAllTypes(
//     getState: GetState<ExampleState>,
//     partialState: PartialState<ExampleState>,
//     setState: SetState<ExampleState>,
//     state: State,
//     stateListener: StateListener<ExampleState>,
//     stateSelector: StateSelector<ExampleState, number>,
//     storeApi: StoreApi<ExampleState>,
//     subscribe: ApiSubscribe<ExampleState>,
//     destroy: Destroy,
//     equalityFn: EqualityChecker<ExampleState>,
//     stateCreator: StateCreator<ExampleState>,
//     useStore: UseStore<ExampleState>,
//     subscribeOptions: Subscriber<ExampleState, number>
//   ) {
//     expect(true).toBeTruthy()
//   }

//   checkAllTypes(
//     storeApi.getState,
//     Math.random() > 0.5 ? partial : partialFn,
//     storeApi.setState,
//     storeApi.getState(),
//     listener,
//     selector,
//     storeApi,
//     storeApi.subscribe,
//     storeApi.destroy,
//     equlaityFn,
//     stateCreator,
//     useStore,
//     subscriber
//   )
// })
