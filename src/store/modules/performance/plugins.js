// https://github.com/vuejs/vuex/blob/dev/examples/todomvc/store/plugins.js

const myPlugin = store => {
  // called when the store is initialized
  store.subscribe((mutation, state) => {
    // called after every mutation.
    // The mutation comes in the format of `{ type, payload }`.
  })
}

export default [myPlugin]
