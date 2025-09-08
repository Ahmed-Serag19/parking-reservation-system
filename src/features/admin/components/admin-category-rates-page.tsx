import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { CategoryRateUpdate } from "./category-rate-update";
import { Button } from "../../../components/ui/button";

export function AdminCategoryRatesPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Category Rate Management</h1>
            <p className="text-muted-foreground">
              Update normal and special rates for parking categories
            </p>
          </div>
        </div>

        <CategoryRateUpdate />
      </div>
    </div>
  );
}
