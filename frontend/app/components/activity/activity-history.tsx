import { fetchData } from "@/lib/fetch-util";
import { Loader } from "../loader";
import { useQuery } from "@tanstack/react-query";
import type { HistoryLog } from "@/types/app";
import { getActivityIcon } from "./activity-icon";

export const ActivityHistory = ({resourceId }: {resourceId: string}) => {

    const { data, isPending } = useQuery({
        queryKey: ['activity-history', resourceId],
        queryFn: () => fetchData(`/activities/${resourceId}/history`),
    }) as {
        data: HistoryLog[],
        isPending: boolean
    }

    if (isPending) return <Loader/>;


    return (
        <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-lg text-muted-foreground mb-4">History</h3>

      <div className="space-y-4">
        {data?.map((history) => (
          <div key={history._id} className="flex gap-2">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {getActivityIcon(history.action)}
            </div>

            <div>
              <p className="text-sm">
                <span className="font-medium">{history.user.name}</span>{" "}
                {history.details?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
    );

}