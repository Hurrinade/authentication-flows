import { useQuery } from "@tanstack/react-query";
import { useMessages } from "../contexts/MessagesProvider";

export default function Resources() {
  const { addMessage } = useMessages();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const response = await fetch("api/v1/resources");
      if (!response.ok) {
        addMessage("User is unauthorized to access resources", "error");
        return { message: "Unauthorized" };
      }
      addMessage("Resources fetched", "success");
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (data.message === "Unauthorized") {
    return <div>{data.message}</div>;
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
