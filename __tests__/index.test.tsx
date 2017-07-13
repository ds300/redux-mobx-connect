import * as React from "react"

import { makeConnect, connect, Provider } from "../"
import * as Renderer from "react-test-renderer"

describe("makeConnect", () => {
  it("just returns the connect function", () => {
    expect(makeConnect()).toBe(connect)
  })
})

class Child extends React.Component<{ message: string }> {
  static contextTypes = {
    observableStore: () => null,
  }

  render() {
    return (
      <div>
        {this.context.observableStore.dispatch(this.props.message)}
      </div>
    )
  }
}

describe("Provider", () => {
  it("adds an `observableStore` property to the react context soup", () => {
    const dispatch = jest.fn()
    const subscribe = jest.fn()

    Renderer.create(
      <Provider
        store={{
          getState: jest.fn(),
          dispatch,
          subscribe,
          replaceReducer: jest.fn(),
        }}
      >
        <Child message="hello" />
      </Provider>,
    ).toJSON()

    expect(dispatch).toBeCalledWith("hello")
    expect(subscribe).toBeCalled()
  })
})

describe("Connected components", () => {
  it("clean up after themselves", () => {
    const dispatch = jest.fn()
    const unsubscribe = jest.fn()
    const subscribe = () => unsubscribe

    const inst = Renderer.create(
      <Provider
        store={{
          getState: jest.fn(),
          dispatch,
          subscribe,
          replaceReducer: jest.fn(),
        }}
      >
        <Child message="whatup" />
      </Provider>,
    )

    expect(() => inst.unmount()).not.toThrow()
    expect(dispatch).toBeCalledWith("whatup")
    expect(unsubscribe).toBeCalled()
  })

  it("get the store and props", () => {
    const dispatch = jest.fn()
    const reduxStore = {
      getState() {
        return { name: "world" }
      },
      dispatch,
      subscribe: jest.fn(),
      replaceReducer: jest.fn(),
    }
    const ConnectedChild = connect<
      { name: string },
      { greeting: string }
    >(store => props =>
      <Child message={`${props.greeting}, ${store.state.name}!`} />,
    )

    Renderer.create(
      <Provider store={reduxStore}>
        <ConnectedChild greeting="Hello" />
      </Provider>,
    ).toJSON()

    expect(dispatch).toBeCalledWith("Hello, world!")
  })
})
