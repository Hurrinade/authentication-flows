import { useQuery } from "@tanstack/react-query";

export default function Resources() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["resources"],
    queryFn: () => fetch("api/v1/resources").then((res) => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (data.message === "Unauthorized") {
    return <div>Unauthorized</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resources</h2>
        <button
          className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={() => refetch()}
        >
          Refetch
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {data.map((resource: any) => (
          <div key={resource.id}>{resource.id}</div>
        ))}
      </div>
    </div>
  );
}
