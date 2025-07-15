import { useQuery } from "@tanstack/react-query";
import { useMessages } from "../contexts/MessagesProvider";

export default function Resources({
  resourcesRoute,
}: {
  resourcesRoute: string;
}) {
  const { addMessage } = useMessages();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const response = await fetch(`api/v1/${resourcesRoute}`);
      const data = await response.json();

      if (data.error) {
        addMessage(data.data, "error");
        return data;
      }
      addMessage("Resources fetched", "success");
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (data.error) return <div>{data.data}</div>;

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
        {data.data.map((resource: any) => (
          <div key={resource.id}>{resource.id}</div>
        ))}
      </div>
    </div>
  );
}
