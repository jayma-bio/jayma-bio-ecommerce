import { axiosinstance } from "@/lib/axios";
import { db } from "@/lib/firebase";
import { Order, Product } from "@/types-db";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

interface ShipRocketOrderData {
  order_id: string;
  order_date: string;
  pickup_location: string;
  channel_id: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: {
    name: string;
    sku: string;
    units: number;
    selling_price: number;
  }[];
  payment_method: string;
  sub_total: number;
  length: string;
  breadth: string;
  height: string;
  weight: string;
}

interface ShipRocketResponse {
  shipment_id: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const OPTIONS = async () => {
  return NextResponse.json({}, { headers: corsHeaders });
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { orderId, paymentId, status } = await req.json();

    const order = (
      await getDoc(doc(db, "stores", params.storeId, "orders", orderId))
    ).data() as Order;

    if (status === "success" || status === "SUCCESS") {
      // const items_name = order.orderItems.map((item) => item.name).join(", ");
      // const info1 = await sendOrderPlacedMailtoUser({
      //   name: order.name,
      //   email: order.email,
      //   orderId: order.id,
      //   amount: order.amount.toString(),
      //   date: order.createdAt.toDate().toISOString(),
      //   items_name: items_name,
      //   paymentId: order.paymentId,
      //   storeId: params.storeId,
      // });
      // await sendOrderPlacedMailtoAdmin({
      //   name: order.name,
      //   orderId: order.id,
      //   amount: order.amount.toString(),
      //   date: order.createdAt.toDate().toISOString(),
      //   items_name: items_name,
      //   paymentId: order.paymentId,
      //   storeId: params.storeId,
      // });
      const token = await axiosinstance
        .post("/auth/login", {
          email: process.env.SHIPROCKET_EMAIL,
          password: process.env.SHIPROCKET_PASSWORD,
        })
        .then((response) => {
          console.log("Logged in successfully:", response.data);
          return response.data.token;
        })
        .catch((error) => {
          console.error("Error:", error.response.data.message);
          return null;
        });

      if (!token) {
        return NextResponse.json(
          {
            error: "Shiprocket login failed",
          },
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }

      const {
        id,
        name,
        address,
        city,
        country,
        state,
        pincode,
        phone,
        email,
        orderItems: products,
        amount: paymentPrice,
      } = order;

      const shipRocketOrderData: ShipRocketOrderData = {
        order_id: order.id,
        order_date: formatDate(new Date()),
        pickup_location: "Warehouse",
        channel_id: "6085137",
        billing_customer_name: name.split(" ")[0],
        billing_last_name: name.split(" ")[1] || "",
        billing_address: address,
        billing_address_2: "",
        billing_city: city,
        billing_pincode: pincode,
        billing_state: state,
        billing_country: country,
        billing_email: email,
        billing_phone: phone,
        shipping_is_billing: true,
        order_items: products.map((item: Product) => ({
          name: item.name,
          sku: item.id,
          units: item.qty ?? 0,
          selling_price: item.price,
        })),
        payment_method: "Prepaid",
        sub_total: paymentPrice,
        length: "10",
        breadth: "10",
        height: "10",
        weight: "1",
      };

      const createShipRocketOrder = await axiosinstance
        .post<ShipRocketResponse>("/orders/create/adhoc", shipRocketOrderData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 8000,
        })
        .then((data) => {
          return data.data;
        })
        .catch((error) => {
          console.error("Shiprocket order creation failed:", error);
          return null;
        });

      if (!createShipRocketOrder) {
        return NextResponse.json(
          {
            error: "Shiprocket order creation failed",
          },
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }

      await updateDoc(doc(db, "stores", params.storeId, "orders", orderId), {
        isPaid: true,
        paymentId: paymentId,
        order_status: "Payment Successful",
        shipment_id: createShipRocketOrder.shipment_id,
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, "stores", params.storeId, "orders", orderId), {
        order_status: "Payment Failed",
        updatedAt: serverTimestamp(),
      });
    }

    return NextResponse.json(
      { message: "Final Checkout Successful", status: 200 },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: error }, { headers: corsHeaders });
  }
}
