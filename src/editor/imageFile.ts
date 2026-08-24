const acceptedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function validateImageFile(file: File): string | null {
  return acceptedTypes.has(file.type) ? null : 'Escolha uma imagem JPG, PNG ou WEBP.'
}

export async function loadImageFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  const image = new Image()
  image.src = url

  try {
    await image.decode()
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}
