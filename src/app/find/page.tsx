import { Suspense } from "react";
import FindMassPage from "./page.client";

export const metadata = {
  title: "Find Mass",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <FindMassPage />
    </Suspense>
  );
}
