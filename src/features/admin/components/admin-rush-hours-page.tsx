import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, Clock } from "lucide-react";
import {
  useRushHours,
  useCreateRushHour,
  useDeleteRushHour,
} from "../../../lib/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type RushForm = { weekDay: number; from: string; to: string };

export function AdminRushHoursPage() {
  const navigate = useNavigate();
  const { data: rushHours = [], isLoading } = useRushHours();
  const createRush = useCreateRushHour();
  const deleteRush = useDeleteRushHour();
  const { register, handleSubmit, reset } = useForm<RushForm>({
    defaultValues: { weekDay: 1, from: "07:00", to: "09:00" },
  });

  const onSubmit = async (values: RushForm) => {
    try {
      await createRush.mutateAsync(values);
      toast.success("Rush hour added successfully!");
      reset({ weekDay: 1, from: "07:00", to: "09:00" });
    } catch (error) {
      toast.error("Failed to add rush hour");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin")}
        className="mb-6 flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Rush Hours
            </CardTitle>
            <CardDescription>
              Global time windows with special rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : rushHours.length === 0 ? (
              <p className="text-muted-foreground">No rush hours configured.</p>
            ) : (
              <ul className="space-y-2">
                {rushHours.map((r: any) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <span className="text-sm">
                      Day {r.weekDay}: {r.from} - {r.to}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteRush.mutate(r.id)}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Rush Window</CardTitle>
            <CardDescription>Create a new rush-hour window</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="text-sm">Week Day (0-6)</label>
                <input
                  type="number"
                  min={0}
                  max={6}
                  className="w-full border rounded px-2 py-1"
                  {...register("weekDay", { valueAsNumber: true })}
                />
              </div>
              <div>
                <label className="text-sm">From</label>
                <input
                  type="time"
                  className="w-full border rounded px-2 py-1"
                  {...register("from")}
                />
              </div>
              <div>
                <label className="text-sm">To</label>
                <input
                  type="time"
                  className="w-full border rounded px-2 py-1"
                  {...register("to")}
                />
              </div>
              <Button type="submit" disabled={createRush.isPending}>
                Add
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
