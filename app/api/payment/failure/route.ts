import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.ATHENA_CORE_URL!;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const externalId = searchParams.get("externalId");

  console.log(
    `[Payment Callback] Failure callback received for externalId: ${externalId}`
  );

  if (externalId) {
    try {
      // Forward the callback to the backend
      const backendResponse = await fetch(
        `${BACKEND_URL}/api/payments/callback/failure?externalId=${externalId}`,
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
