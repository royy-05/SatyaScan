export const DOC_TYPES = [
  {
    code: "PASSPORT",
    label: "Passport",
    description: "International travel passport with MRZ zone",
    allowedMimetypes: ["image/jpeg", "image/png", "image/webp"],
    maxSizeBytes: 10485760,
  },
  {
    code: "VISA",
    label: "Entry Visa",
    description: "Official border entry permit or e-Visa document",
    allowedMimetypes: ["image/jpeg", "image/png", "image/webp"],
    maxSizeBytes: 10485760,
  },
  {
    code: "NATIONAL_ID",
    label: "National Identity Card",
    description: "Government issued national identification card",
    allowedMimetypes: ["image/jpeg", "image/png", "image/webp"],
    maxSizeBytes: 10485760,
  },
  {
    code: "DRIVING_LICENSE",
    label: "Driving License",
    description: "Official state or national driving authorization card",
    allowedMimetypes: ["image/jpeg", "image/png", "image/webp"],
    maxSizeBytes: 10485760,
  },
  {
    code: "PERMIT",
    label: "Special Border Pass / Permit",
    description: "Temporary border cross permit or diplomatic pass",
    allowedMimetypes: ["image/jpeg", "image/png", "image/webp"],
    maxSizeBytes: 10485760,
  },
];
