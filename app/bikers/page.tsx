import { BikersDirectoryClient } from "@/components/bikers-directory-client";

export default async function BikersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  return <BikersDirectoryClient initialQuery={params.q ?? ""} />;
}
