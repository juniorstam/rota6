import { Suspense } from "react";

import { PublishTripFlow } from "@/components/publish-trip-flow";

export default function PublishTripPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <PublishTripFlow />
    </Suspense>
  );
}
