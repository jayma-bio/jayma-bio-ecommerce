import { db } from "@/lib/firebase";
import { Order } from "@/types-db";
import { doc, getDoc } from "firebase/firestore";

const getOrder = async ({
  storeId,
  orderId,
}: {
  storeId: string;
  orderId: string;
}): Promise<Order> => {
  try {
    const order = (
      await getDoc(doc(db, "stores", storeId, "orders", orderId))
    ).data() as Order;

    return order;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export default getOrder;
