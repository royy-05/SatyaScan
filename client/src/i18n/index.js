import en from "./en.json";

export function t(keyPath, fallback = "") {
  if (!keyPath) return fallback;
  const parts = keyPath.split(".");
  let val = en;
  for (const part of parts) {
    if (val && typeof val === "object" && part in val) {
      val = val[part];
    } else {
      return fallback || keyPath;
    }
  }
  return typeof val === "string" ? val : fallback || keyPath;
}
