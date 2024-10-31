import { db } from "@/lib/firebase";
import { Category, Product, Size } from "@/types-db";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

import React from "react";
import { ProductForm } from "./_components/product-form";

const CreateSizePage = async ({
  params,
}: {
  params: { storeId: string; productId: string };
}) => {
  const product = (
    await getDoc(doc(db, "stores", params.storeId, "products", params.productId))
  ).data() as Product;

  const categoriesData = (
    await getDocs(collection(db, "stores", params.storeId, "categories"))
  ).docs.map((doc) => doc.data()) as Category[];
  const sizesData = (
    await getDocs(collection(db, "stores", params.storeId, "sizes"))
  ).docs.map((doc) => doc.data()) as Size[];
  return (
    <div className="flex flex-col ">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          initialData={product}
          categories={categoriesData}
          sizes={sizesData}
        />
      </div>
    </div>
  );
};

export default CreateSizePage;
