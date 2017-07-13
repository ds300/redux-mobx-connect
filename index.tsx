import * as React from "react"
import { observable } from "mobx"
import { observer } from "mobx-react/custom"

import { Store, Unsubscribe } from "redux"

/**
 * Provider takes a plain redux store and adds child context for an observable
 * version of the store
 */
export class Provider extends React.PureComponent<{
  store: Store<any>
  children: React.ReactElement<any> | null
}> {
  static childContextTypes = {
    observableStore: () => null,
  }

  observableStore: ObservableStore<any, any> = new ObservableStoreImpl()
  unsubscribe: Unsubscribe = () => void 0

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(nextProps: { store: Store<any> }) {
    this.unsubscribe()
    this.observableStore.state = nextProps.store.getState()
    this.observableStore.dispatch = nextProps.store.dispatch.bind(
      this.props.store,
    )
    this.unsubscribe = nextProps.store.subscribe(() => {
      this.observableStore.state = nextProps.store.getState()
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  getChildContext() {
    return { observableStore: this.observableStore }
  }

  render() {
    return this.props.children as React.ReactElement<any> | null
  }
}

export interface ObservableStore<State, Action = any> {
  state: State
  dispatch(a: Action): void
}
class ObservableStoreImpl<State, Action = any> {
  @observable.ref state: State = null as any
  @observable.ref dispatch: (a: Action) => void = null as any
}

function hasDisplayName(val: any): val is { displayName: string } {
  return val && "displayName" in val && typeof val.displayName === "string"
}

function getDisplayName(
  nameOrComponent: string | { name: string } | { displayName: string },
) {
  return typeof nameOrComponent === "string"
    ? nameOrComponent
    : hasDisplayName(nameOrComponent)
      ? nameOrComponent.displayName
      : nameOrComponent ? nameOrComponent.name : "Connected"
}

export function connect<State, OwnProps, Action = any>(
  factory: (
    store: ObservableStore<State, Action>,
  ) => React.ComponentClass<OwnProps> | React.StatelessComponent<OwnProps>,
  displayName?: string | { name: string } | { displayName: string },
): React.ComponentClass<OwnProps> {
  const storeBox = observable.shallowBox(
    new ObservableStoreImpl<State, Action>(),
  )
  const storeProxy = observable({
    get state() {
      return storeBox.get().state
    },
    get dispatch() {
      return storeBox.get().dispatch
    },
  })
  const Component = observer(factory(storeProxy))

  const name = getDisplayName(displayName || Component) || "Connected"

  class Wrapper extends React.PureComponent<OwnProps> {
    static displayName = name
    static contextTypes = {
      observableStore: () => null,
    }

    context: {
      observableStore: ObservableStore<State, Action>
    }

    componentWillMount() {
      storeBox.set(this.context.observableStore)
    }

    render() {
      return <Component {...this.props} />
    }
  }

  return Wrapper
}

export function makeConnect<State, Action = any>(): <OwnProps>(
  factory: (
    store: ObservableStore<State, Action>,
  ) => React.ComponentClass<OwnProps> | React.StatelessComponent<OwnProps>,
  displayName?: string | { name: string } | { displayName: string },
) => React.ComponentClass<OwnProps> {
  return connect as any
}
