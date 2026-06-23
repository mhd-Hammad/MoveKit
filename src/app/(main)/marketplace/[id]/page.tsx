export default function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Listing: {params.id}</h1>
    </div>
  );
}
