import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { Size } from "@/types-db";

const SizesPage = async ({ params }: { params: { storeId: string } }) => {


  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
    hello
      </div>
    </div>
  );
};

export default SizesPage;
