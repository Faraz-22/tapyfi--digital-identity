export function createNfcWritePayload(url: string) {
  return {
    recordType: "url",
    data: url,
    instructions: [
      "Open the dashboard on a Web NFC compatible Android browser or use NFC Tools.",
      "Write only this dynamic URL to the NFC chip.",
      "All profile data stays in the database and can be updated live."
    ]
  };
}
