import { DetailClient } from "./detail-client";

export default async function DetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ site?: string; from?: string }>;
}) {
  const { id } = await params;
  const { site, from } = await searchParams;
  return <DetailClient id={id} site={site} from={from} />;
}
