export default function (app) {
  app.$axios.onError(error => {
    console.log(app)
    console.log('INTERCEPTOR', error)
    app.app.store.commit('notifications/showError', error)
  })
}
