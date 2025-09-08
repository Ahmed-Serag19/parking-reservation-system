import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, Users } from "lucide-react";
import { useEmployees, useCreateEmployee } from "../hooks/use-admin";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createEmployeeSchema,
  type CreateEmployeeFormData,
} from "../../admin/schemas/employee-schemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

export function AdminUsersPage() {
  const navigate = useNavigate();
  const { data: employees = [], isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: { role: "employee" },
  });

  const onSubmit = async (values: CreateEmployeeFormData) => {
    await createEmployee.mutateAsync(values as any);
    reset({
      username: "",
      password: "",
      name: "",
      email: "",
      role: "employee",
    });
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
              <Users className="h-5 w-5" /> Employees
            </CardTitle>
            <CardDescription>
              Existing users with access to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : employees.length === 0 ? (
              <p className="text-muted-foreground">No users found.</p>
            ) : (
              <ul className="space-y-2">
                {employees.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <span className="text-sm">
                      {u.username}{" "}
                      <span className="text-muted-foreground">({u.role})</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create User</CardTitle>
            <CardDescription>Add a new admin or employee</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="text-sm">Username</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-xs text-red-600">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm">Password</label>
                <input
                  type="password"
                  className="w-full border rounded px-2 py-1"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm">Name</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  {...register("name")}
                />
              </div>
              <div>
                <label className="text-sm">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-2 py-1"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm">Role</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  {...register("role")}
                >
                  <option value="employee">employee</option>
                  <option value="admin">admin</option>
                </select>
                {errors.role && (
                  <p className="text-xs text-red-600">{errors.role.message}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || createEmployee.isPending}
              >
                Create
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
