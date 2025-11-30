import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.ATHENA_CORE_URL!;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const externalId = searchParams.get("externalId");

  console.log(
    `[Payment Callback] Success callback received for externalId: ${externalId}`
  );

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
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/payments/callback/success?externalId=${externalId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!backendResponse.ok) {
      console.error(
        `[Payment Callback] Backend returned error: ${backendResponse.status}`
      );
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
