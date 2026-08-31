export const getSelfUrl = () => {
  if (!process.env.NEXT_PUBLIC_SELF_URL) {
    throw new Error('NEXT_PUBLIC_SELF_URL is not set')
  }

  return process.env.NEXT_PUBLIC_SELF_URL
}
