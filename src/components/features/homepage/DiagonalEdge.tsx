interface DiagonalEdgeProps {
  /** Which edge of the parent section the wedge sits on. */
  position: 'top' | 'bottom'
  /** Colour of the neighbouring section — the wedge is painted in it. */
  fill: string
  /** Optional hairline drawn along the diagonal. */
  line?: string
  /** Wedge height. Defaults to the --edge value set on the parent section. */
  height?: string
  className?: string
}

/**
 * Paints a triangular wedge over the top or bottom edge of a section so the
 * boundary with its neighbour reads as a diagonal instead of a flat 180° line.
 * Both positions share the same slope, so stacked edges stay parallel.
 */
export default function DiagonalEdge({
  position,
  fill,
  line,
  height = 'var(--edge)',
  className = '',
}: DiagonalEdgeProps) {
  const isTop = position === 'top'
  const points = isTop ? '0,0 100,0 0,100' : '0,100 100,100 100,0'

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-20 ${isTop ? 'top-0' : 'bottom-0'} ${className}`}
      style={{ height }}
    >
      <svg className="block h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points={points} fill={fill} />
        {line && (
          <line
            x1="100"
            y1="0"
            x2="0"
            y2="100"
            stroke={line}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  )
}
