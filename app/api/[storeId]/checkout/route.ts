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
  const origin = request.headers.get("origin") || "";
  
  // Check if the origin is in our allowed list
  const isAllowedOrigin = allowedOrigins.includes(origin);
  
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : allowedOrigins[0],
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
    const { products, userId, paymentPrice, name, email, phone, address } =
      await req.json();

    // Validate required fields
    if (!products || !paymentPrice || !email || !phone || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    const orderData = {
      isPaid: false,
      userId: userId,
      name: name,
      orderItems: products,
      email,
      phone,
      address,
      amount: paymentPrice,
      order_status: "Payment Processing",
      createdAt: serverTimestamp(),
    };

    const orderRef = await addDoc(
      collection(db, "stores", params.storeId, "orders"),
      orderData
    );

    const id = orderRef.id;

    await updateDoc(doc(db, "stores", params.storeId, "orders", id), {
      ...orderData,
      id,
      updatedAt: serverTimestamp(),
    });

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

    console.log("Cashfree Request Payload:", payload);

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
  return handleCORS(request) || NextResponse.json({}, { 
    headers: getCorsHeaders(request) 
  });
}