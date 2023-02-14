export default function tryParseJSON(buf: string): any | null {
  try {
    return JSON.parse(buf.toString());
  } catch (e) {
    return null;
  }
}
