import { HomeClient } from "./home-client";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <Suspense>
      <HomeClient />
    </Suspense>
  );
}
