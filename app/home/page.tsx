// This route is now handled by (social)/home/page.tsx
// This file redirects old /home links to the new location

import { redirect } from "next/navigation";

export default function OldHomePage() {
  redirect("/home");
}
