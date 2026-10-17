import { SearchClient } from "./search-client";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  return <SearchClient q={searchParams.q ?? ""} />;
}
