# redux-mobx-connect

    yarn add redux-mobx-connect

## A simple alternative to react-redux

react-redux is a remarkable piece of battle-tested engineering with a
work-of-art API. This... is not that.

This is a so-simple-it's-almost-dumb connector for redux stores which uses MobX to
hook stuff together. The API is obvious and boring, and you'll be yawning
all the way to the bank.

This

```typescript
import {connect} from "react-redux"

const ConnectedComponent = connect(
  null,
  (dispach, {id}) => ({onPress: () => dispatch(somethingHappened(id))})
)(Component)
```

becomes this:

```typescript
import {connect} from "redux-mobx-connect"

const ConnectedComponent = connect(store => ({id}) =>
  <Component onPress={() => store.dispatch(somethingHappened(id))}>
)
```

And this (from redux docs):

```typescript
const mapStateToProps = state => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onTodoClick: id => {
      dispatch(toggleTodo(id))
    }
  }
}

const VisibleTodoList = connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)
```

becomes this:

```typescript
const VisibleTodoList = connect(
  store =>
    class VisibleTodoList extends React.Component {
      onTodoClick = id => store.dispatch(toggleTodo(id))

      render() {
        const todos = getVisibleTodos(store.state.todos, store.state.visibilityFilter)
        return (
          <TodoList todos={todos} onTodoClick={this.onTodoClick} />
        )
      }
    },
)
```

## Usage

`Provider` takes a single prop, `store` which should be the redux store. Wrap your app in this, just like for react-redux.

`connect` takes a function which is passed a reactive store object, and can return either a stateless functional component or a es6 component class. So you write your connected components just like your
regular compoents, except wrapped in a lexical context where they have access to your redux store.

Yes it really is that simple. The only real gotcha is that you can't destructure the store
outside of the of the inner class or functional component.

e.g.

BAD:

```typescript
const VisibleTodoList = connect(
  ({state, dispatch}) =>
    class VisibleTodoList extends React.Component { ... },
)
```

GOOD:

```typescript
const VisibleTodoList = connect(
  store => class VisibleTodoList extends React.Component { ... },
)
```

Doing it the bad way means you lose the reactivity goodness that MobX
sets up for you, and state changes won't be propagated from store to component.

## Advanced Usage

Use `makeConnect` to create a project-specific version of connect so you don't need to
specify the types of your store state and actions everywhere.

Since redux-mobx-connect is built on MobX you can
even use `@observable` and `@computed` properties in your connected components to
manage component local state and memoize expensive derived state. No more reselect!

This is being used in production by [Futurice](https://futurice.com)

## License

MIT

[![Empowered by Futurice's open source sponsorship program](https://img.shields.io/badge/sponsor-chilicorn-ff69b4.svg)](http://futurice.com/blog/sponsoring-free-time-open-source-activities?utm_source=github&utm_medium=spice&utm_campaign=redux-mobx-connector)
