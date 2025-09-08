import { Users, UserPlus, Shield, User } from "lucide-react";
import { useEmployees } from "../../../lib/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

interface EmployeeListProps {
  onCreateEmployee: () => void;
}

export function EmployeeList({ onCreateEmployee }: EmployeeListProps) {
  const { data: employees = [], isLoading, error } = useEmployees();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employees
          </CardTitle>
          <CardDescription>Loading employees...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employees
          </CardTitle>
          <CardDescription>Failed to load employees</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Error loading employees. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employees ({employees.length})
            </CardTitle>
            <CardDescription>
              Manage employee accounts and permissions
            </CardDescription>
          </div>
          <Button
            onClick={onCreateEmployee}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No employees found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first employee account to get started.
            </p>
            <Button
              onClick={onCreateEmployee}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {employee.role === "admin" ? (
                      <Shield className="h-8 w-8 text-amber-500 bg-amber-100 dark:bg-amber-900/20 p-1.5 rounded-full" />
                    ) : (
                      <User className="h-8 w-8 text-blue-500 bg-blue-100 dark:bg-blue-900/20 p-1.5 rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {employee.name || employee.username}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          employee.role === "admin"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                        }`}
                      >
                        {employee.role}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>@{employee.username}</span>
                      {employee.email && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{employee.email}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">
                    {employee.createdAt && (
                      <span>
                        Created{" "}
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
