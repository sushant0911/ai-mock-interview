import Vapi from "@vapi-ai/web";

const vapiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;

if (!vapiToken) {
  console.warn(
    "Warning: NEXT_PUBLIC_VAPI_WEB_TOKEN is not set. VAPI calls will fail."
  );
}

export const vapi = new Vapi(vapiToken || "");
