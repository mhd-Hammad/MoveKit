export default function BlueprintDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Blueprint: {params.id}</h1>
    </div>
  );
}
