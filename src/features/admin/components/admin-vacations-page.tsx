import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, Calendar } from "lucide-react";
import {
  useVacations,
  useCreateVacation,
  useDeleteVacation,
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
import type { Vacation } from "../../../types/api";

type VacationForm = { name: string; from: string; to: string };

export function AdminVacationsPage() {
  const navigate = useNavigate();
  const { data: vacations = [], isLoading } = useVacations();
  const createVacation = useCreateVacation();
  const deleteVacation = useDeleteVacation();
  const { register, handleSubmit, reset } = useForm<VacationForm>({
    defaultValues: { name: "", from: "", to: "" },
  });

  const onSubmit = async (values: VacationForm) => {
    try {
      await createVacation.mutateAsync(values);
      toast.success("Vacation period added successfully!");
      reset({ name: "", from: "", to: "" });
    } catch (error) {
      toast.error("Failed to add vacation period");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" /> Vacation Periods
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Special date ranges with different pricing rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm sm:text-base text-muted-foreground">
                Loading...
              </p>
            ) : vacations.length === 0 ? (
              <p className="text-sm sm:text-base text-muted-foreground">
                No vacation periods configured.
              </p>
            ) : (
              <ul className="space-y-2">
                {vacations.map((v: Vacation) => (
                  <li
                    key={v.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 border rounded"
                  >
                    <div className="flex-1">
                      <span className="text-xs sm:text-sm font-medium block">
                        {v.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(v.from)} - {formatDate(v.to)}
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto text-xs sm:text-sm"
                      onClick={() => deleteVacation.mutate(v.id)}
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
              Add Vacation Period
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Create a new vacation period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3 sm:space-y-4"
              role="form"
              aria-label="Add vacation period form"
            >
              <div>
                <label
                  htmlFor="name"
                  className="text-xs sm:text-sm font-medium"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g., Christmas Holiday"
                  className="w-full border rounded px-2 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  {...register("name")}
                  aria-describedby="name-help"
                />
                <div id="name-help" className="sr-only">
                  Enter a descriptive name for this vacation period
                </div>
              </div>
              <div>
                <label
                  htmlFor="from"
                  className="text-xs sm:text-sm font-medium"
                >
                  From Date
                </label>
                <input
                  id="from"
                  type="date"
                  className="w-full border rounded px-2 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  {...register("from")}
                  aria-describedby="from-help"
                />
                <div id="from-help" className="sr-only">
                  Select the start date for this vacation period
                </div>
              </div>
              <div>
                <label htmlFor="to" className="text-xs sm:text-sm font-medium">
                  To Date
                </label>
                <input
                  id="to"
                  type="date"
                  className="w-full border rounded px-2 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  {...register("to")}
                  aria-describedby="to-help"
                />
                <div id="to-help" className="sr-only">
                  Select the end date for this vacation period
                </div>
              </div>
              <Button
                type="submit"
                disabled={createVacation.isPending}
                className="w-full sm:w-auto text-sm sm:text-base"
                aria-describedby="submit-status"
              >
                {createVacation.isPending ? "Adding..." : "Add"}
              </Button>
              <div id="submit-status" className="sr-only" aria-live="polite">
                {createVacation.isPending
                  ? "Adding vacation period, please wait"
                  : "Ready to add vacation period"}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
