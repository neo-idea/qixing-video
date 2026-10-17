import { DetailClient } from "./detail-client";

export default async function DetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { site?: string };
}) {
  return <DetailClient id={params.id} site={searchParams.site} />;
}
