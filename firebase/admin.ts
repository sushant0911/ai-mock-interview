import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const apps = getApps();

  if (!apps.length) {
    // Validate required environment variables
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error("FIREBASE_PROJECT_ID is not set");
    }
    if (!process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error("FIREBASE_CLIENT_EMAIL is not set");
    }
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error("FIREBASE_PRIVATE_KEY is not set");
    }

    try {
      // Properly format the private key
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;

      // Remove surrounding quotes if present (handles both single and double quotes)
      privateKey = privateKey.trim();
      if (
        (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
        (privateKey.startsWith("'") && privateKey.endsWith("'"))
      ) {
        privateKey = privateKey.slice(1, -1);
      }

      // If the key doesn't start with -----BEGIN, it might be missing the header
      if (!privateKey.includes("-----BEGIN")) {
        throw new Error(
          "Private key appears to be malformed - missing BEGIN marker"
        );
      }

      // Handle escaped newlines - replace \n (literal backslash-n) with actual newlines
      // This handles the format from Vercel where newlines are escaped as \n
      privateKey = privateKey.replace(/\\n/g, "\n");

      // Also handle double-escaped newlines just in case
      privateKey = privateKey.replace(/\\\\n/g, "\n");

      // Clean up any double newlines that might have been created
      privateKey = privateKey.replace(/\n\n+/g, "\n");

      // Ensure the key ends with a newline after END marker (required by Firebase)
      if (!privateKey.endsWith("\n")) {
        privateKey = privateKey + "\n";
      }

      // Trim but preserve the structure
      privateKey = privateKey.trim() + "\n";

      // Final validation - check key structure
      if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
        throw new Error(
          "Private key must start with '-----BEGIN PRIVATE KEY-----'"
        );
      }
      if (
        !privateKey.endsWith("-----END PRIVATE KEY-----\n") &&
        !privateKey.endsWith("-----END PRIVATE KEY-----")
      ) {
        throw new Error(
          "Private key must end with '-----END PRIVATE KEY-----'"
        );
      }

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorCode = (error as { code?: string })?.code;

      console.error("Firebase Admin initialization error:", error);
      console.error("Error details:", {
        message: errorMessage,
        code: errorCode,
        projectId: process.env.FIREBASE_PROJECT_ID ? "set" : "missing",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? "set" : "missing",
        privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
        privateKeyStart:
          process.env.FIREBASE_PRIVATE_KEY?.substring(0, 30) || "none",
      });
      throw new Error(`Failed to initialize Firebase Admin: ${errorMessage}`);
    }
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
}

export const { auth, db } = initFirebaseAdmin();
