// Gmail (and Google Workspace via googlemail.com) ignores dots in the local
// part of an address for delivery purposes — "zan.papic@gmail.com" and
// "zanpapic@gmail.com" land in the exact same inbox. Our database does not
// know that, so without this normalization the two are treated as different
// people: an invite sent to one variant silently fails to match a signup
// using the other.
//
// The "+alias" part (e.g. "bacinhos+test2@gmail.com") is deliberately left
// alone — that's used on purpose for testing, and Gmail itself treats it as
// a distinct, routable address modifier rather than noise.
export function normalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase()
  const atIndex = trimmed.lastIndexOf('@')
  if (atIndex === -1) return trimmed

  const local = trimmed.slice(0, atIndex)
  const domain = trimmed.slice(atIndex + 1)

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const plusIndex = local.indexOf('+')
    const base = plusIndex === -1 ? local : local.slice(0, plusIndex)
    const tag = plusIndex === -1 ? '' : local.slice(plusIndex)
    return `${base.replace(/\./g, '')}${tag}@${domain}`
  }

  return trimmed
}
