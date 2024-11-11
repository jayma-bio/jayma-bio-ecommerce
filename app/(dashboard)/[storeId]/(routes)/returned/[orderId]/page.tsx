import getOrder from "@/actions/get-order-by-id";
import React from "react";
import OrderDetails from "./_components/order-details";

const Page = async ({
  params,
}: {
  params: { storeId: string; orderId: string };
}) => {
  const order = await getOrder(params);

  return <OrderDetails order={order} />;
};

export default Page;
