import fpPromise from '@fingerprintjs/fingerprintjs';

// Initialize the agent at application startup.
const fp = fpPromise.load();

let cachedVisitorId = null;

export const getDeviceFingerprint = async () => {
  if (cachedVisitorId) return cachedVisitorId;
  
  try {
    const agent = await fp;
    const result = await agent.get();
    cachedVisitorId = result.visitorId;
    return cachedVisitorId;
  } catch (error) {
    console.error("Error generating fingerprint:", error);
    return "unknown_client_device";
  }
};
