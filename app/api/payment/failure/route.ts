import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.ATHENA_CORE_URL;

async function handleCallback(request: NextRequest, externalId: string | null) {
  console.log(
    `[Payment Callback] Failure callback received for externalId: ${externalId}`
  );
  console.log(`[Payment Callback] Backend URL: ${BACKEND_URL}`);

  if (externalId) {
    try {
      // Forward the callback to the backend
      const backendUrl = `${BACKEND_URL}/api/payments/callback/failure?externalId=${externalId}`;
      console.log(`[Payment Callback] Forwarding to: ${backendUrl}`);

      const backendResponse = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!backendResponse.ok) {
        console.error(
          `[Payment Callback] Backend returned error: ${backendResponse.status}`
        );
      } else {
        console.log(`[Payment Callback] Backend updated successfully`);
      }
    } catch (error) {
      console.error("[Payment Callback] Failed to notify backend:", error);
    }
  }

  // Redirect user to the failure page
  return NextResponse.redirect(
    new URL(
      `/student/payments/callback?status=failed&externalId=${externalId || ""}`,
      request.url
    )
  );
}

// Handle GET requests
export async function GET(request: NextRequest) {
  const externalId = request.nextUrl.searchParams.get("externalId");
  return handleCallback(request, externalId);
}

// Handle POST requests
export async function POST(request: NextRequest) {
  let externalId = request.nextUrl.searchParams.get("externalId");

  if (!externalId) {
    try {
      const body = await request.json();
      externalId = body.externalId?.toString() || null;
    } catch {
      // Body might be empty or not JSON
    }
  }

  return handleCallback(request, externalId);
}
