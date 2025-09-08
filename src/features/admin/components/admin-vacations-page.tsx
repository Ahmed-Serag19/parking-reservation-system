import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, Calendar } from "lucide-react";
import {
  useVacations,
  useCreateVacation,
  useDeleteVacation,
} from "../../../lib/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { useForm } from "react-hook-form";

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
    await createVacation.mutateAsync(values);
    reset({ name: "", from: "", to: "" });
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
              <Calendar className="h-5 w-5" /> Vacations
            </CardTitle>
            <CardDescription>Global vacation periods</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : vacations.length === 0 ? (
              <p className="text-muted-foreground">No vacations configured.</p>
            ) : (
              <ul className="space-y-2">
                {vacations.map((v: any) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <span className="text-sm">
                      {v.name}: {v.from} → {v.to}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
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
          <CardHeader>
            <CardTitle>Add Vacation</CardTitle>
            <CardDescription>Create a new vacation period</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="text-sm">Name</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  {...register("name")}
                />
              </div>
              <div>
                <label className="text-sm">From</label>
                <input
                  type="date"
                  className="w-full border rounded px-2 py-1"
                  {...register("from")}
                />
              </div>
              <div>
                <label className="text-sm">To</label>
                <input
                  type="date"
                  className="w-full border rounded px-2 py-1"
                  {...register("to")}
                />
              </div>
              <Button type="submit" disabled={createVacation.isPending}>
                Add
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
