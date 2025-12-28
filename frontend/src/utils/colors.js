// Lightweight color helpers for charts and UI

export function hexToRgba (hex, alpha = 0.85) {
  if (!hex || typeof hex !== 'string') {
    return `rgba(0,0,0,${alpha})`
  }
  const h = hex.replace('#', '')
  const bigint = Number.parseInt(h, 16)
  if (Number.isNaN(bigint)) {
    return `rgba(0,0,0,${alpha})`
  }
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function withAlpha (hex, alpha = 0.85) {
  return hexToRgba(hex, alpha)
}

export default { hexToRgba, withAlpha }
