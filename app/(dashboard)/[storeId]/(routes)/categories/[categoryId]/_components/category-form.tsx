"use client";
import { useConfirm } from "@/hooks/use-confirm";
import { CategoryFormSchema } from "@/schemas/CategoryFormSchema";
import { Billboards, Category } from "@/types-db";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Heading } from "../../../_components/shared/heading";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ClientUploadedFileData } from "uploadthing/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzone } from "@/lib/uplaodthing";

interface CategoryFormProps {
  initialData: Category;
  billboards: Billboards[];
}

export const CategoryForm = ({
  initialData,
  billboards,
}: CategoryFormProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialData.banner || null);

  const title = initialData ? "Edit Category" : "Create Category";
  const description = initialData
    ? "Edit your category"
    : "Create a new category";
  const toastMessage = initialData ? "Category updated" : "Category created";
  const toastErrorMessage = initialData
    ? "Category update failed"
    : "Category creation failed";
  const action = initialData ? "Update" : "Create Category";
  const actionLoadingText = initialData ? "Updating" : "Creating";

  const [ConfirmDialogue, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this category."
  );

  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      banner: initialData?.banner || "",
      name: initialData?.name || "",
      billboardId: initialData?.billboardId || "",
      categoryDesc: initialData?.categoryDesc || [{ video: "", desc: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "categoryDesc",
  });

  const params = useParams();
  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof CategoryFormSchema>) => {
    setIsLoading(true);
    try {
      const { billboardId: formBillId } = form.getValues();

      const matchingBillboard = billboards.find(
        (item) => item.id === formBillId
      );

      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/categories/${params.categoryId}`,
          {
            ...data,
            billboardLabel: matchingBillboard?.label,
          }
        );
      } else {
        await axios.post(`/api/${params.storeId}/categories`, {
          ...data,
          billboardLabel: matchingBillboard?.label,
        });
      }
      toast(toastMessage);

      router.push(`/${params.storeId}/categories`);
      router.refresh();
    } catch (error: any) {
      console.log(`Client Error: ${error.message}`);
      toast(toastErrorMessage);
    } finally {
      router.refresh();
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    setIsDeleting(true);
    const ok = await confirm();

    if (ok) {
      try {
        await axios.delete(
          `/api/${params.storeId}/categories/${params.categoryId}`
        );
        router.push(`/${params.storeId}/categories`);
        router.refresh();
        toast("Category removed");
        setIsDeleting(false);
      } catch (error: any) {
        console.log(`Client Error: ${error.message}`);
        toast("An error occurred while deleting the category");
        setIsDeleting(false);
      }
    }
    setIsDeleting(false);
  };

  const handleImageUpload = (
    res: ClientUploadedFileData<{ uploadedBy: string }>[]
  ) => {
    if (res && res.length > 0) {
      setUploadedImage(res[0].url);
      form.setValue("banner", res[0].url);
      toast.success("Image uploaded successfully");
    }
  };
  
  const handleImageDelete = () => {
    setUploadedImage(null);
    form.setValue("banner", "");
    toast.success("Image removed");
  };
  
  return (
    <>
      <ConfirmDialogue />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            onClick={onDelete}
            size="sm"
            variant="destructive"
            loadingText="Deleting..."
            isLoading={isDeleting}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-5"
        >
          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="banner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner</FormLabel>
                  <FormControl>
                    <UploadDropzone
                      endpoint="imageUploader"
                      onClientUploadComplete={handleImageUpload}
                      onUploadError={(error: Error) => {
                        console.error(`Upload error: ${error.message}`);
                        toast.error("Image upload failed");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {uploadedImage && (
                <div className="relative group aspect-auto">
                  <div
                    className="cursor-pointer rounded-lg overflow-hidden h-full"
                    onClick={() => {
                      setSelectedImage(uploadedImage);
                      setShowImageDialog(true);
                    }}
                  >
                    <img
                      src={uploadedImage}
                      alt={`Event image ${uploadedImage + 1}`}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleImageDelete}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Enter category name..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billboardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billboard</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            defaultValue={field.value}
                            placeholder="Select a billboard"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {billboards.map((billboard) => (
                          <SelectItem key={billboard.id} value={billboard.id}>
                            {billboard.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Category Descriptions</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ video: "", desc: "" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add More
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-3 gap-8">
                <FormField
                  control={form.control}
                  name={`categoryDesc.${index}.video`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="Enter video URL..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`categoryDesc.${index}.desc`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={isLoading}
                          placeholder="Enter description..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                    className="mt-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            disabled={isLoading}
            type="submit"
            loadingText={actionLoadingText}
            isLoading={isLoading}
          >
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
