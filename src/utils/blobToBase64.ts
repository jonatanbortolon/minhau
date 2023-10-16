export function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.readAsDataURL(blob)

    reader.onload = () => resolve(reader.result as string)

    reader.onerror = reject
  })
}
