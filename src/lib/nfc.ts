type NdefReaderLike = {
  write(message: { records: Array<{ recordType: string; data: string }> }): Promise<void>;
};

declare global {
  interface Window {
    NDEFReader?: new () => NdefReaderLike;
  }
}

export function canUseWebNfc() {
  return typeof window !== "undefined" && Boolean(window.NDEFReader);
}

export async function writeProfileUrlToNfc(url: string) {
  if (!canUseWebNfc() || !window.NDEFReader) {
    throw new Error("Web NFC is not available in this browser. Use NFC Tools to write the same URL.");
  }

  const writer = new window.NDEFReader();
  await writer.write({
    records: [{ recordType: "url", data: url }]
  });
}
