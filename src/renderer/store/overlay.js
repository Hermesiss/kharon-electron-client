export const state = () => ({
  showOverlay: false,
  progress: -1
})

export const mutations = {
  startProgress(state, progress = -1) {
    state.showOverlay = true
    state.progress = progress
  },
  stopProgress(state) {
    state.showOverlay = false
    state.progress = -1
  },
  setProgress(state, progress) {
    state.progress = progress
  }
}
