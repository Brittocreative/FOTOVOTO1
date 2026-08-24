export type Size = { width: number; height: number }
export type Point = { x: number; y: number }
export type Transform = Point & { scale: number }

export function coverScale(image: Size, canvas: Size): number {
  return Math.max(canvas.width / image.width, canvas.height / image.height)
}

export function clampTransform(
  transform: Transform,
  image: Size,
  canvas: Size,
  minimumScale: number,
): Transform {
  const scale = Math.max(transform.scale, minimumScale)
  const horizontalOverflow = Math.max(0, (image.width * scale - canvas.width) / 2)
  const verticalOverflow = Math.max(0, (image.height * scale - canvas.height) / 2)

  return {
    x: Math.max(-horizontalOverflow, Math.min(horizontalOverflow, transform.x)),
    y: Math.max(-verticalOverflow, Math.min(verticalOverflow, transform.y)),
    scale,
  }
}

export function zoomAroundPoint(
  transform: Transform,
  nextScale: number,
  point: Point,
): Transform {
  const ratio = nextScale / transform.scale

  return {
    x: point.x - (point.x - transform.x) * ratio,
    y: point.y - (point.y - transform.y) * ratio,
    scale: nextScale,
  }
}
