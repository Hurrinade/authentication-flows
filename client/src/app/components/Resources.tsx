import { useQuery } from "@tanstack/react-query";
import { useMessages } from "../contexts/MessagesProvider";
import { useUser } from "../contexts/UserProvider";

export default function Resources({
  resourcesRoute,
}: {
  resourcesRoute: string;
}) {
  const { addMessage } = useMessages();
  const { accessToken, setAccessToken, setUser, setShowProtected } = useUser();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const response = await fetch(`api/v1/${resourcesRoute}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();

      if (data.error) {
        addMessage(data.data, "error");
        if (response.status === 401 && resourcesRoute === "hybrid-resources") {
          setAccessToken(null);
          const internalResponse = await fetch(`api/v1/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const internalData = await internalResponse.json();

          if (internalData.error) {
            setUser(null);
            setShowProtected(false);
            addMessage(
              "Refreshing token failed: " + internalData.data,
              "error",
            );
            throw new Error("REFRESH_FAILED");
          }

          setAccessToken(internalData.data.accessToken);
          const internalAccessResponse = await fetch(
            `api/v1/${resourcesRoute}`,
            {
              headers: {
                Authorization: `Bearer ${internalData.data.accessToken}`,
              },
            },
          );

          const internalAccessData = await internalAccessResponse.json();
          if (internalAccessData.error) {
            throw new Error("REFRESH_FAILED");
          }

          addMessage("Resources fetched", "success");
          return internalAccessData;
        }

        return data;
      }
      addMessage("Resources fetched", "success");
      return data;
    },
    retry: (failureCount, error) => {
      if (error.message === "REFRESH_FAILED") {
        return false;
      }
      return failureCount < 2;
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
        {data.data.map((resource: { id: string }) => (
          <div key={resource.id}>{resource.id}</div>
        ))}
      </div>
    </div>
  );
}
