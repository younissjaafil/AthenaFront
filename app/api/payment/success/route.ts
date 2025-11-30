import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.ATHENA_CORE_URL;

async function handleCallback(request: NextRequest, externalId: string | null) {
  console.log(
    `[Payment Callback] Success callback received for externalId: ${externalId}`
  );
  console.log(`[Payment Callback] Backend URL: ${BACKEND_URL}`);

  if (!externalId) {
    console.error("[Payment Callback] Missing externalId");
    // Redirect to failure page
    return NextResponse.redirect(
      new URL(
        "/student/payments/callback?status=failed&error=missing_id",
        request.url
      )
    );
  }

  try {
    // Forward the callback to the backend
    const backendUrl = `${BACKEND_URL}/api/payments/callback/success?externalId=${externalId}`;
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
      const text = await backendResponse.text();
      console.error(`[Payment Callback] Backend response: ${text}`);
    } else {
      console.log(`[Payment Callback] Backend updated successfully`);
    }
  } catch (error) {
    console.error("[Payment Callback] Failed to notify backend:", error);
    // Continue anyway - we'll redirect the user and they can sync later
  }

  // Redirect user to the success page
  return NextResponse.redirect(
    new URL(
      `/student/payments/callback?status=success&externalId=${externalId}`,
      request.url
    )
  );
}

// Handle GET requests (query params)
export async function GET(request: NextRequest) {
  const externalId = request.nextUrl.searchParams.get("externalId");
  return handleCallback(request, externalId);
}

// Handle POST requests (body or query params)
export async function POST(request: NextRequest) {
  let externalId = request.nextUrl.searchParams.get("externalId");

  // If not in query params, try to get from body
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
