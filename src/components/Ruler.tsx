/** Millimetre ruler drawn at real scale. */
export function Ruler({ pxPerMm, lengthMm, dark }: { pxPerMm: number; lengthMm: number; dark?: boolean }) {
  const mm = Math.max(1, Math.floor(lengthMm))
  const width = mm * pxPerMm
  const fg = dark ? '#f9fafb' : '#111827'
  const ticks = []
  for (let i = 0; i <= mm; i++) {
    const x = i * pxPerMm
    const len = i % 10 === 0 ? 18 : i % 5 === 0 ? 12 : 7
    ticks.push(<line key={i} x1={x} x2={x} y1={0} y2={len} stroke={fg} strokeWidth={i % 10 === 0 ? 1.5 : 1} />)
    if (i % 10 === 0) {
      ticks.push(
        <text key={`t${i}`} x={x + 2} y={30} fill={fg} fontSize={10} fontFamily="system-ui">
          {i / 10}
        </text>,
      )
    }
  }
  return (
    <svg width={width + 24} height={34} className="block overflow-visible" aria-label={`Righello ${mm} mm`}>
      <line x1={0} x2={width} y1={0.5} y2={0.5} stroke={fg} />
      {ticks}
      <text x={width + 4} y={30} fill={fg} fontSize={10} fontFamily="system-ui" opacity={0.7}>
        cm
      </text>
    </svg>
  )
}
