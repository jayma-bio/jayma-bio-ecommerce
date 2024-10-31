import { db } from "@/lib/firebase";
import { Size } from "@/types-db";
import { doc, getDoc } from "firebase/firestore";

import React from "react";

const CreateSizePage = async ({
  params,
}: {
  params: { storeId: string; sizeId: string };
}) => {
  const size = (
    await getDoc(doc(db, "stores", params.storeId, "sizes", params.sizeId))
  ).data() as Size;

  return (
    <div className="flex flex-col ">
      <div className="flex-1 space-y-4 p-8 pt-6">ok</div>
    </div>
  );
};

export default CreateSizePage;
