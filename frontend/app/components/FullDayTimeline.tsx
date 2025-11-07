// LEGACY timeline (disabled for debug)
export function FullDayTimeline(/* props: any */) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[LEGACY] FullDayTimeline rendered — disabled')
  }
  return null
}
export default FullDayTimeline
