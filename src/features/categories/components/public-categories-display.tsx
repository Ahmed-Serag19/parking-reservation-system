import { useCategories } from "../../../lib/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { DollarSign, Clock } from "lucide-react";

interface PublicCategoriesDisplayProps {
  selectedCategoryId?: string;
  onCategorySelect?: (categoryId: string) => void;
  showSelection?: boolean;
}

export function PublicCategoriesDisplay({
  selectedCategoryId,
  onCategorySelect,
  showSelection = false,
}: PublicCategoriesDisplayProps) {
  const { data: categories = [], isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Categories</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load categories</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No categories available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Available Categories</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;

          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                showSelection
                  ? isSelected
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-muted/50"
                  : ""
              }`}
              onClick={() => showSelection && onCategorySelect?.(category.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </div>
                  {showSelection && isSelected && (
                    <Badge variant="default" className="ml-2">
                      Selected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>Normal</span>
                    </div>
                    <span className="font-medium">
                      ${category.rateNormal}/hr
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span>Special</span>
                    </div>
                    <span className="font-medium">
                      ${category.rateSpecial}/hr
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showSelection && (
        <div className="text-xs text-muted-foreground">
          💡 Special rates apply during rush hours and holidays
        </div>
      )}
    </div>
  );
}
