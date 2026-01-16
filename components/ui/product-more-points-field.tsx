"use client";

import { Control, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Trash2 } from "lucide-react";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import React from "react";
import { ProductFormSchema } from "@/schemas/ProductFormSchema";

interface MorePointsFieldProps {
  control: Control<z.infer<typeof ProductFormSchema>>;
  disabled?: boolean;
  className?: string;
}

export const MorePointsField = ({ 
  control, 
  disabled = false, 
  className 
}: MorePointsFieldProps) => {
  const { fields: pointFields, append: appendPoint, remove: removePoint } = useFieldArray({
    control,
    name: "more_points" as const,
  });

  const addMorePoint = () => {
    appendPoint({
      title: "",
      descriptions: [{ text: "" }],
      bullet_points: [],
    });
  };

  return (
    <div className={className}>
      <FormItem>
        <FormLabel>More Points</FormLabel>
        <FormControl>
          <div className="space-y-4">
            {/* Horizontal Grid for More Points Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl">
              {pointFields.map((field, pointIndex) => (
                <MorePointBlock
                  key={field.id}
                  control={control}
                  pointIndex={pointIndex}
                  disabled={disabled}
                  onRemove={() => removePoint(pointIndex)}
                  canRemove={pointFields.length > 1}
                />
              ))}
            </div>

            {/* Add More Point Button */}
            {pointFields.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMorePoint}
                disabled={disabled}
                className="w-48 justify-start h-12 mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add More Point Block
              </Button>
            )}
          </div>
        </FormControl>
        <FormMessage>{control._formState.errors.more_points?.message}</FormMessage>
      </FormItem>
    </div>
  );
};

interface MorePointBlockProps {
  control: Control<z.infer<typeof ProductFormSchema>>;
  pointIndex: number;
  disabled: boolean;
  onRemove: () => void;
  canRemove: boolean;
}

const MorePointBlock = ({
  control,
  pointIndex,
  disabled,
  onRemove,
  canRemove,
}: MorePointBlockProps) => {
  const { 
    fields: descFields, 
    append: appendDesc, 
    remove: removeDesc 
  } = useFieldArray({
    control,
    name: `more_points.${pointIndex}.descriptions` as const,
  });

  const { 
    fields: bulletFields, 
    append: appendBullet, 
    remove: removeBullet 
  } = useFieldArray({
    control,
    name: `more_points.${pointIndex}.bullet_points` as any,
  });

  const addDescription = () => {
    appendDesc({ text: "" });
  };

  const addBulletPoint = () => {
    appendBullet("");
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card/50 max-h-[500px] overflow-y-auto">
      {/* Block Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 pb-2">
        <FormLabel className="text-base font-medium">
          Point Block {pointIndex + 1}
        </FormLabel>
        {canRemove && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={onRemove}
            disabled={disabled}
            className="h-8 w-8 shrink-0"
          >
            <Trash2 className="size-3" />
          </Button>
        )}
      </div>

      {/* Title Field - REQUIRED */}
      <FormItem>
        <FormLabel className="text-xs font-medium">Title *</FormLabel>
        <FormControl>
          <Input
            disabled={disabled}
            placeholder="Point title..."
            className="h-10"
            {...control.register(`more_points.${pointIndex}.title` as const)}
          />
        </FormControl>
        <FormMessage>
          {control._formState.errors.more_points?.[pointIndex]?.title?.message}
        </FormMessage>
      </FormItem>

      {/* Descriptions Section - UNLIMITED */}
      <div className="space-y-2">
        <FormLabel className="text-xs font-medium">Descriptions *</FormLabel>
        <div className="space-y-1">
          {descFields.map((field, descIndex) => (
            <div key={field.id} className="flex items-center gap-2">
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder={`Description ${descIndex + 1}`}
                  className="h-9 text-sm flex-1"
                  {...control.register(
                    `more_points.${pointIndex}.descriptions.${descIndex}.text` as const
                  )}
                />
              </FormControl>
              {descFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDesc(descIndex)}
                  disabled={disabled}
                  className="h-9 w-9 p-0 shrink-0"
                >
                  <X className="size-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDescription}
          disabled={disabled}
          className="w-full h-9 mt-1 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Description
        </Button>
      </div>

      {/* Bullet Points Section - UNLIMITED */}
      <div className="space-y-2">
        <FormLabel className="text-xs font-medium">Bullet Points (Optional)</FormLabel>
        <div className="space-y-1">
          {bulletFields.map((field, bulletIndex) => (
            <div key={field.id} className="flex items-center gap-2">
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder={`• Bullet point ${bulletIndex + 1}`}
                  className="h-9 text-sm flex-1"
                  {...control.register(
                    `more_points.${pointIndex}.bullet_points.${bulletIndex}` as const
                  )}
                />
              </FormControl>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeBullet(bulletIndex)}
                disabled={disabled}
                className="h-9 w-9 p-0 shrink-0"
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBulletPoint}
          disabled={disabled}
          className="w-full h-9 mt-1 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Bullet Point
        </Button>
      </div>
    </div>
  );
};
