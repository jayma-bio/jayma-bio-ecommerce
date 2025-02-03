import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Cashfree, OrderEntity } from "cashfree-pg";
import { axiosinstance } from "@/lib/axios";

const allowedOrigins = [
  "https://jaymabioinnovations.com",
  "https://www.jaymabioinnovations.com",
  "https://checkout.jaymabioinnovations.com",
  "https://www.checkout.jaymabioinnovations.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
];

// Function to generate CORS headers based on the request origin
function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin") || "*";

  // Check if the origin is in our allowed list
  const isAllowedOrigin = allowedOrigins.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-id, x-client-secret, x-api-version",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Allow-Credentials": "true",
  };
}

function handleCORS(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  return null;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

async function getFormattedServerTimestamp() {
  const timestamp = new Date();
  const timestampDate = (timestamp as any).toDate();
  
  return formatDate(timestampDate);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const corsResult = handleCORS(req);
  if (corsResult) return corsResult;

  const corsHeaders = getCorsHeaders(req);

  Cashfree.XClientId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID as string;
  Cashfree.XClientSecret = process.env.NEXT_PUBLIC_CASHFREE_SECRET_KEY as string;
  Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

  try {
    const { products, userId, paymentPrice, name, email, phone,
      country,
      state,
      city,
      pincode, address } =
      await req.json();

    // Validate required fields
    if (!products || !paymentPrice || !email || !phone || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    const createdAt = await getFormattedServerTimestamp();
    const updatedAt = await getFormattedServerTimestamp();

    const orderData = {
      isPaid: false,
      userId: userId,
      name: name,
      orderItems: products,
      email,
      phone,
      country,
      state,
      city,
      pincode,
      address,
      amount: paymentPrice,
      order_status: "Payment Processing",
      createdAt,
    };

    const orderRef = await addDoc(
      collection(db, "stores", params.storeId, "orders"),
      orderData
    );

    const id = orderRef.id;

    await updateDoc(doc(db, "stores", params.storeId, "orders", id), {
      ...orderData,
      id,
      updatedAt,
    });

    const shipRocketOrderData = {
      "order_id": id,
      "order_date": orderData.createdAt,
      "pickup_location": process.env.SHIPROCKET_PICKUP_LOC,
      "channel_id": "6085137",
      "billing_customer_name": orderData.name.split(" ")[0],
      "billing_last_name": orderData.name.split(" ")[1],
      "billing_address": orderData.address,
      "billing_address_2": "",
      "billing_city": orderData.city,
      "billing_pincode": orderData.pincode,
      "billing_state": orderData.state,
      "billing_country": orderData.country,
      "billing_email": orderData.email,
      "billing_phone": orderData.phone,
      "shipping_is_billing": true,
      "order_items": orderData.orderItems.map((item: any) => {
        return {
          "name": item.name,
          "sku": item.id,
          "units": item.qty,
          "selling_price": item.price
        }
      }),
      "payment_method": "Prepaid",
      "sub_total": orderData.amount,
      "length": "10",
      "breadth": "10",
      "height": "10",
      "weight": "1"
    };

    console.log("shipRocketOrderData", shipRocketOrderData);
    
    const createShipRocketOrder = await axiosinstance.post("/orders/create/adhoc", shipRocketOrderData).then((response) => {
      console.log("Order created successfully:", response.data);
      return response.data;
    }).catch((error) => {
      console.error("Error:", error.response.data.message);
      return null;
    });
    
    console.log("createShipRocketOrder", createShipRocketOrder);

    const payload = {
      customer_details: {
        customer_id: userId,
        customer_phone: phone,
        customer_email: email,
        customer_name: name,
      },
      order_meta: {
        return_url: process.env.FRONTEND_URL! + `?orderId=/${id}`,
      },
      order_id: id,
      order_amount: paymentPrice,
      order_currency: "INR",
    };

    const data = await Cashfree.PGCreateOrder("2023-08-01", payload)
      .then((response: { data: any }) => {
        console.log("Order created successfully:", response.data);
        return response.data;
      })
      .catch((error: any) => {
        console.error("Error:", error.response.data.message);
        return null;
      });

    if (!data) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500, headers: corsHeaders }
      );
    }

    await updateDoc(doc(db, "stores", params.storeId, "orders", id), {
      ...orderData,
      id,
      session_id: data.payment_session_id,
    });

    const paymentUrl = new URL(process.env.PAYMENT_URL! || "");
    paymentUrl.searchParams.append("session_id", data.payment_session_id!);
    paymentUrl.searchParams.append("store_id", params.storeId);
    paymentUrl.searchParams.append("order_id", id);

    return NextResponse.json(
      { url: paymentUrl.toString() },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  });
}