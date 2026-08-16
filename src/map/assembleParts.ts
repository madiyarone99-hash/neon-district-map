export interface FilePartsManifest {
  bytes: number
  sha256: string
  parts: string[]
}

export interface PagesManifest {
  city: FilePartsManifest
  js: FilePartsManifest
}

export function decodeBase64Part(part: string): Uint8Array {
  const binary = atob(part.trim())
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function joinBase64Parts(parts: string[]): Uint8Array {
  const chunks = parts.map(decodeBase64Part)
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

export function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  const digest = await crypto.subtle.digest('SHA-256', copy)
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

export async function assembleVerifiedFile(
  parts: string[],
  expected: Pick<FilePartsManifest, 'bytes' | 'sha256'>,
  label: string,
): Promise<Uint8Array> {
  const bytes = joinBase64Parts(parts)
  if (bytes.byteLength !== expected.bytes) {
    throw new Error(
      `${label}: размер не совпал (${bytes.byteLength} вместо ${expected.bytes})`,
    )
  }
  const hash = await sha256Hex(bytes)
  if (hash !== expected.sha256) {
    throw new Error(`${label}: SHA-256 не совпал`)
  }
  return bytes
}
