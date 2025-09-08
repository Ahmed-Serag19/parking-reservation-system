import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Loader2, Save } from "lucide-react";
import {
  useCategories,
  useUpdateCategoryRates,
} from "../hooks/use-admin";

const rateUpdateSchema = z.object({
  rateNormal: z
    .number()
    .min(0, "Normal rate must be positive")
    .max(100, "Normal rate must be less than 100"),
  rateSpecial: z
    .number()
    .min(0, "Special rate must be positive")
    .max(100, "Special rate must be less than 100"),
});

type RateUpdateData = z.infer<typeof rateUpdateSchema>;

export function CategoryRateUpdate() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const updateRatesMutation = useUpdateCategoryRates();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RateUpdateData>({
    resolver: zodResolver(rateUpdateSchema),
    defaultValues: {
      rateNormal: 0,
      rateSpecial: 0,
    },
  });

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setValue("rateNormal", category.rateNormal);
      setValue("rateSpecial", category.rateSpecial);
    }
  };

  const onSubmit = async (data: RateUpdateData) => {
    if (!selectedCategoryId) return;

    try {
      await updateRatesMutation.mutateAsync({
        categoryId: selectedCategoryId,
        rates: data,
      });

      // Show success toast
      toast.success("Category rates updated successfully", {
        style: {
          background: "#ffffff",
          color: "#1f2937",
          border: "1px solid #e5e7eb",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
      });

      // Reset form and clear selection
      setSelectedCategoryId("");
      reset({
        rateNormal: 0,
        rateSpecial: 0,
      });
    } catch (error) {
      toast.error("Failed to update category rates");
      console.error("Rate update error:", error);
    }
  };

  if (categoriesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Update Category Rates</CardTitle>
          <CardDescription>Loading categories...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Category Rates</CardTitle>
        <CardDescription>
          Select a category and update its hourly rates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="w-full px-3 py-2 border rounded-md bg-background"
            value={selectedCategoryId}
            onChange={(e) => handleCategorySelect(e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} - Current: ${category.rateNormal}/$
                {category.rateSpecial}
              </option>
            ))}
          </select>
        </div>

        {selectedCategory && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <h4 className="font-medium">{selectedCategory.name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedCategory.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rateNormal">Normal Rate ($/hour)</Label>
                <Input
                  id="rateNormal"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  {...register("rateNormal", { valueAsNumber: true })}
                  disabled={updateRatesMutation.isPending}
                />
                {errors.rateNormal && (
                  <p className="text-sm text-destructive">
                    {errors.rateNormal.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rateSpecial">Special Rate ($/hour)</Label>
                <Input
                  id="rateSpecial"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  {...register("rateSpecial", { valueAsNumber: true })}
                  disabled={updateRatesMutation.isPending}
                />
                {errors.rateSpecial && (
                  <p className="text-sm text-destructive">
                    {errors.rateSpecial.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={updateRatesMutation.isPending}
              className="w-full"
            >
              {updateRatesMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Rates...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Rates
                </>
              )}
            </Button>
          </form>
        )}

        <div className="text-xs text-muted-foreground">
          💡 Special rates apply during rush hours and holidays
        </div>
      </CardContent>
    </Card>
  );
}
