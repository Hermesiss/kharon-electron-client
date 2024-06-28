export default async function ({$axios, redirect, error}) {
  let serverIsOnline = false
  const maxRetries = 10000
  let retries = 0

  while (!serverIsOnline) {
    console.log('Trying to ping server... ', retries)
    try {
      await $axios.$get('/api/ping')
      serverIsOnline = true
    } catch (e) {
      if (++retries >= maxRetries) {
        error({statusCode: 503, message: 'Server is offline\n' + e.message})
        break
      }
      console.log('Server is offline, retrying...')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}
