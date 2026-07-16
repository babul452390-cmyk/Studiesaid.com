const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore }                 = require("firebase-admin/firestore");
const { getAuth }                      = require("firebase-admin/auth");

const serviceAccount = {
  type: "service_account",
  project_id: "study-aid-7e6d1",
  private_key_id: "258c3eda3d302028033cb6854a7dd86cda32ad90",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDQoR8f09e7tDH2\nO9Nw1KGitfgdFyel+8vzyyaeMtn6PvcXi5NJLqgbd4kiGCTke8hLs4/7orGnnHzi\nDAkVXQbcDh2L8vJQQU7kvZsFEiJXW4UGhnNHXATYLWr2PkiX+pgBVkIRQuYRe2ad\nRO1nan2SmjCLvNovJEYDydu80jntaXftXIa87zo7mv/tvKqLPn0cTB02SZ3R7ndZ\np3fWg2rCYpVr3zUHVIvXYPyK8CwzbSV9M6PUsKOiv+cP2V3AFlbfSTQgDDC/1tRA\nlfb4KFaz6H9wYtIMi7r2UR/ov+PrRST7iGyOs0M8sbA5cL43kVmJqn9UA0GSpmNd\nFV7EoKClAgMBAAECggEACND+QTiREdAUGm09yrNZn0gkU4pidQu2ezd3CtFoT8Bw\nbbDKyRltJjf/dg7iJDus47ITYBVof4ZH6r+KdLopK4x3KC5cmhKgdF8k2WqCRAHM\nldGBtp7HX6FPt1c7dxyyZsAP663RjiSSWgwLIkcoRlU4vvb8m2hjgw55ODoEE6nB\nS15vP7yROyMJTu4HRbCsR5+6bnajaPeb4kpBn4jLifbrR7lXun4Yu68kDGp8yrkU\n++n7kkEVr4FEFtVqR4G/srjiNduReoZ2apdN7+Sc/7DxPpMwyP6rlsgn/MIrO5EQ\nDMZLZQw3RRwfeJFfRoC9j7H8xkPhdKASX1JYKZIwowKBgQDsv+KX+Umo4Q2b/vyl\nbuFRbg/61Z3SCvCUyVTDG61MkYtdNecclF9qX/uGycmzhi8iE9zxP4NtPsmGJaG7\nmtzPcqAlJNAx6pEfC4tdNCvqKLRZQg+3B/R8zNXqoc1DlAFMrksTwWma34t+NmHu\nZ3q+nwZF1Siql1SdB/RgboElowKBgQDhl+UCHRhUU9N2JUGA3JarE0/04bRbpLJJ\nXIAB4vYAWznrA5SX1yCln4ZkR2jSIoIeftU+OxV2TSKlfijs+qfU7yv0D3Oz86SN\nUPuTyQTkT92W27F+vRiZNyOZwyqkngsUKzEJjZbng21ozvwnf9pUz2otjEn0P6Bw\nAfaRLY61FwKBgQDpazrWibNFLTbE0f94gDzokzJwJcMnfx+6IlJO12/iqTEVonqN\no//7Gk0clMEoHilEWP8iYHOM9zWr7FhsZoBEjAg29vfJ7zJLwI8UQsb1ZFKEGmzy\nEYbMsQxL/GErurYZS1K8VJpxVuvqcWXWrvHHFXUSztn8b52+AUTA+tKcLwKBgC6f\nHYzaRnTm/gSknmzrKZghXZzWKFfoKZBPtYSuSvi34bhX/RWEOBMCbNu8hkUnLIzw\n2VELFNxmBIr/D6YqBxVSeFrv9pFyAMfTvKpGGOS2PK04qe3vVm4Tnx/f3ag3oUKB\nypiW0mD2IF5QqHvhSFXOp7rSC1aW76k2PqayK5PxAoGBAJIZOwvXBSEqUd1mTyCg\nkH3+abvzFUEgL/DdyQpgK/AXjz5/ggINDzfchPH+m6l03d8qv1UjRaaJGcKRN7QG\nbpHKbj+Hq2aFXV4IpcqxPbgNJ18aGAcUbMcZ/B84q+LD7S63bpdtBpOSlEvbYPfn\n3WTZah9q6oqMHzZfjU+Xi6Bp\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@study-aid-7e6d1.iam.gserviceaccount.com",
  client_id: "104691650294307122076",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db   = getFirestore();
const auth = getAuth();

module.exports = { db, auth };
