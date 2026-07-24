interface DiagonalEdgeProps {
  /** Which edge of the parent section the wedge sits on. */
  position: 'top' | 'bottom'
  /** Colour of the neighbouring section — the wedge is painted in it. */
  fill: string
  /** Optional hairline drawn along the diagonal. */
  line?: string
  /**
   * Which way the diagonal leans. 'right' drops from the left edge down to the
   * right; 'left' mirrors it. Alternating this between consecutive section
   * boundaries gives the page a zig-zag rhythm instead of a stack of parallels.
   */
  slant?: 'right' | 'left'
  /** Wedge height. Defaults to the --edge value set on the parent section. */
  height?: string
  className?: string
}

/**
 * Paints a triangular wedge over the top or bottom edge of a section so the
 * boundary with its neighbour reads as a diagonal instead of a flat 180° line.
 * Top and bottom share the same slope for a given slant, so the two edges of a
 * section stay parallel unless you deliberately mirror one of them.
 */
export default function DiagonalEdge({
  position,
  fill,
  line,
  slant = 'right',
  height = 'var(--edge)',
  className = '',
}: DiagonalEdgeProps) {
  const isTop = position === 'top'
  const isRight = slant === 'right'

  const points = isTop
    ? isRight
      ? '0,0 100,0 0,100'
      : '0,0 100,0 100,100'
    : isRight
      ? '0,100 100,100 100,0'
      : '0,100 100,100 0,0'

  // Hypotenuse of the wedge: "\" for a right slant, "/" for a left one.
  const [x1, y1, x2, y2] = isRight ? [100, 0, 0, 100] : [0, 0, 100, 100]

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
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={line}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  )
}
