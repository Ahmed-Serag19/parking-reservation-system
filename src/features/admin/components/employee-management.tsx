import { useState } from "react";
import { EmployeeList } from "./employee-list";
import { CreateEmployeeForm } from "./create-employee-form";

export function EmployeeManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateEmployee = () => {
    setShowCreateForm(true);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
  };

  if (showCreateForm) {
    return (
      <CreateEmployeeForm
        onCancel={handleCancelCreate}
        onSuccess={handleCreateSuccess}
      />
    );
  }

  return <EmployeeList onCreateEmployee={handleCreateEmployee} />;
}
