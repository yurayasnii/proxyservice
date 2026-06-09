interface Props {
  size?: number
}

// Original image: 1408×768. Shield icon: x:485–915 (430px), y:25–460 (435px).
// Scale so shield fills 75% of box → symmetric ~12% padding each side.
export function LogoIcon({ size = 36 }: Props) {
  const scale = (size * 0.75) / 435     // 435 = shield height (tallest dimension)

  const bgW = Math.round(1408 * scale)
  const bgH = Math.round(768  * scale)

  // geometric center of shield in original image
  const shieldCX = 485 + 430 / 2       // = 700
  const shieldCY = 25  + 435 / 2 + 35  // = 277.5

  const posX = Math.round(size / 2 - shieldCX * scale)
  const posY = Math.round(size / 2 - shieldCY * scale)
  const br   = Math.round(size * 0.22)

  // Clip inner div to just below shield bottom (y=460) so text below is hidden
  const shieldBottomInDiv = Math.round(460 * scale + posY)
  const innerBottom = Math.max(0, size - shieldBottomInDiv - 1)

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: br,
        flexShrink: 0,
        backgroundColor: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: innerBottom,
          backgroundImage:    'url("/logo.png")',
          backgroundSize:     `${bgW}px ${bgH}px`,
          backgroundPosition: `${posX}px ${posY}px`,
          backgroundRepeat:   'no-repeat',
        }}
      />
    </div>
  )
}
