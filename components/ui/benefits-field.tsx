"use client";

import { Control, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash2 } from "lucide-react";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import React from "react";
import { ProductFormSchema } from "@/schemas/ProductFormSchema";

type Benefit = {
  title: string;
  description: string;
};

interface BenefitsFieldProps {
  control: Control<z.infer<typeof ProductFormSchema>>;
  disabled?: boolean;
  className?: string;
}

export const BenefitsField = ({ control, disabled = false, className }: BenefitsFieldProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "benefits" as const,
  });


  const addBenefit = () => {
    append({ title: "", description: "" });
  };

  const minBenefits = 1;

  return (
    <div className={className}>
      <FormItem>
        <FormLabel>Product Benefits</FormLabel>
        <FormControl>
          <div className="space-y-4">
            {/* Horizontal Grid for Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-3 p-4 border rounded-lg bg-card/50 h-fit">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-base font-medium">
                      Benefit {index + 1}
                    </FormLabel>
                    {fields.length > minBenefits && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={disabled}
                        className="h-8 w-8 shrink-0"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <FormItem>
                      <FormLabel className="text-xs">Benefit Title</FormLabel>
                      <FormControl>
                        <Input
                          disabled={disabled}
                          placeholder="Free Shipping"
                          className="h-9"
                          {...control.register(`benefits.${index}.title` as const)}
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel className="text-xs">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={disabled}
                          placeholder="Free shipping on orders over $50"
                          className="resize-none h-[70px] text-sm"
                          {...control.register(`benefits.${index}.description` as const)}
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Button */}
            {fields.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBenefit}
                disabled={disabled}
                className="w-40 justify-start h-12 mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Benefit
              </Button>
            )}
          </div>
        </FormControl>
      </FormItem>
    </div>
  );
};
