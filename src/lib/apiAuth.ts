import { supabase } from './supabase'

// Attach the signed-in user's token to calls to our own email endpoint.
const originalFetch = window.fetch.bind(window)
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.pathname : (input as Request).url
  if (url.startsWith('/api/send-email')) {
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (token) {
        const headers = new Headers(init?.headers || {})
        headers.set('Authorization', `Bearer ${token}`)
        init = { ...(init || {}), headers }
      }
    } catch (e) { /* send without token; server will refuse */ }
  }
  return originalFetch(input, init)
}
