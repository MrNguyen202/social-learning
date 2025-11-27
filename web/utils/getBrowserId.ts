import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function getBrowserId() {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;  // device_id cho web
}
