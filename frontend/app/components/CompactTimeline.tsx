// LEGACY timeline (disabled for debug)
export function CompactTimeline(/* props: any */) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[LEGACY] CompactTimeline rendered — disabled')
  }
  return null
}
export default CompactTimeline
