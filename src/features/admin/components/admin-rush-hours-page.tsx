import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, Clock } from "lucide-react";
import {
  useRushHours,
  useCreateRushHour,
  useDeleteRushHour,
} from "../hooks/use-admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { RushHour } from "../../../types/api";

type RushForm = { weekDay: number; from: string; to: string };

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const getDayName = (weekDay: number) => DAY_NAMES[weekDay] || `Day ${weekDay}`;

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
    <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin")}
        className="mb-4 sm:mb-6 flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" /> Rush Hours
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Global time windows with special rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm sm:text-base text-muted-foreground">
                Loading...
              </p>
            ) : rushHours.length === 0 ? (
              <p className="text-sm sm:text-base text-muted-foreground">
                No rush hours configured.
              </p>
            ) : (
              <ul className="space-y-2">
                {rushHours.map((r: RushHour) => (
                  <li
                    key={r.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 border rounded"
                  >
                    <div className="flex-1">
                      <span className="text-xs sm:text-sm font-medium block">
                        {getDayName(r.weekDay)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.from} - {r.to}
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto text-xs sm:text-sm"
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
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">
              Add Rush Window
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Create a new rush-hour window
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3 sm:space-y-4"
              role="form"
              aria-label="Add rush hour form"
            >
              <div>
                <label
                  htmlFor="weekDay"
                  className="text-xs sm:text-sm font-medium"
                >
                  Day of Week
                </label>
                <select
                  id="weekDay"
                  className="w-full border rounded px-2 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  {...register("weekDay", { valueAsNumber: true })}
                  aria-describedby="weekDay-help"
                >
                  {DAY_NAMES.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
                <div id="weekDay-help" className="sr-only">
                  Select the day of the week for this rush hour period
                </div>
              </div>
              <div>
                <label
                  htmlFor="from"
                  className="text-xs sm:text-sm font-medium"
                >
                  From
                </label>
                <input
                  id="from"
                  type="time"
                  className="w-full border rounded px-2 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  {...register("from")}
                  aria-describedby="from-help"
                />
                <div id="from-help" className="sr-only">
                  Select the start time for this rush hour period
                </div>
              </div>
              <div>
                <label htmlFor="to" className="text-xs sm:text-sm font-medium">
                  To
                </label>
                <input
                  id="to"
                  type="time"
                  className="w-full border rounded px-2 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  {...register("to")}
                  aria-describedby="to-help"
                />
                <div id="to-help" className="sr-only">
                  Select the end time for this rush hour period
                </div>
              </div>
              <Button
                type="submit"
                disabled={createRush.isPending}
                className="w-full sm:w-auto text-sm sm:text-base"
                aria-describedby="submit-status"
              >
                {createRush.isPending ? "Adding..." : "Add"}
              </Button>
              <div id="submit-status" className="sr-only" aria-live="polite">
                {createRush.isPending
                  ? "Adding rush hour, please wait"
                  : "Ready to add rush hour"}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
