import { db } from "@/lib/firebase";
import prismadb from "@/lib/prismadb";
import { Order } from "@/types-db";
import { collection, doc, getDocs } from "firebase/firestore";

interface GraphData {
  name: string;
  total: number;
}

// Utility function to apply discounts
const applyDiscount = (price: number, discount: number): number => {
  return price - price * (discount / 100);
};

// Function to calculate total revenue based on payment status and additional charges
export const getOrderPaymentStatusTotalRevenue = async (storeId: string) => {
  // Fetch shipping and tax details from PrismaDB
  const paymentData = await prismadb.paymentManagement.findMany();
  const shippingCharge = Number(paymentData[0].shipping);
  const tax = Number(paymentData[0].tax);

  // Fetch orders for the given store
  const ordersData = (
    await getDocs(collection(doc(db, "stores", storeId), "orders"))
  ).docs.map((doc) => doc.data()) as Order[];

  const statusRevenue: { [key: string]: number } = {};
  const orderCount = ordersData.length;

  for (const order of ordersData) {
    const status = order.isPaid ? "Paid" : "Not Paid";

    let orderTotal = order.orderItems.reduce((orderSum, item) => {
      const discountedPrice = applyDiscount(item.price, item.discount || 0);
      return orderSum + discountedPrice * (item.qty || 1);
    }, 0);

    // Apply tax on the order total
    const taxAmount = orderTotal * (tax / 100);
    orderTotal += taxAmount;

    // Add the revenue to the status
    statusRevenue[status] = (statusRevenue[status] || 0) + orderTotal;
  }

  // Add shipping charge to the total revenue based on the order count
  const totalShippingCharge = shippingCharge * orderCount;
  statusRevenue["Paid"] += totalShippingCharge; // Apply to "Paid" category or as needed

  // Prepare the graph data
  const graphData: GraphData[] = [
    { name: "Paid", total: statusRevenue["Paid"] || 0 },
    { name: "Not Paid", total: statusRevenue["Not Paid"] || 0 },
  ];

  return graphData;
};

// Function to calculate total revenue across all paid orders with additional charges
export const getTotalRevenue = async (storeId: string) => {
  const paymentData = await prismadb.paymentManagement.findMany();
  const shippingCharge = Number(paymentData[0].shipping);
  const tax = Number(paymentData[0].tax);

  // Fetch orders for the given store
  const ordersData = (
    await getDocs(collection(doc(db, "stores", storeId), "orders"))
  ).docs.map((doc) => doc.data()) as Order[];

  const totalOrderCount = ordersData.length;
  const totalShippingCharge = shippingCharge * totalOrderCount;

  // Filter only paid orders
  const paidOrders = ordersData.filter((order) => order.isPaid);

  // Calculate total revenue with discounts and taxes for paid orders
  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      const discountedPrice = applyDiscount(item.price, item.discount || 0);
      return orderSum + discountedPrice * (item.qty || 1);
    }, 0);

    // Calculate tax for each order total
    const totalTaxForOrder = orderTotal * (tax / 100);
    return total + orderTotal + totalTaxForOrder;
  }, 0);

  // Return the total revenue including shipping charges
  return totalRevenue + totalShippingCharge;
};
