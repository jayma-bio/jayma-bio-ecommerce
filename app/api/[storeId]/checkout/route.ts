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
  "http://localhost:5173",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-id, x-client-secret, x-api-version",
  "Access-Control-Max-Age": "86400",
};

function handleCORS(request: NextRequest) {
  const origin = request.headers.get("origin") || "";

  if (allowedOrigins.includes(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  } else {
    corsHeaders["Access-Control-Allow-Origin"] = allowedOrigins[0];
  }

  if (request.method === "OPTIONS") {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  return null;
}
export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const corsResult = handleCORS(req);
  if (corsResult) return corsResult;
  
  Cashfree.XClientId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID as string;
  Cashfree.XClientSecret = process.env
    .NEXT_PUBLIC_CASHFREE_SECRET_KEY as string;
  Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;
  
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
      orderItems: products,
      email,
      phone,
      address,
      amount: paymentPrice,
      order_status: "Processing",
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

    // Log the request to Cashfree
    console.log("Cashfree Request Payload:", payload);
    console.log("Cashfree URL:", process.env.CASHFREE_FETCH_URL);

    // const response = await fetch(process.env.CASHFREE_FETCH_URL as string, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "x-client-id": process.env.NEXT_PUBLIC_CASHFREE_APP_ID as string,
    //     "x-client-secret": process.env
    //       .NEXT_PUBLIC_CASHFREE_SECRET_KEY as string,
    //     "x-api-version": "2023-08-01",
    //   },
    //   body: JSON.stringify(payload),
    // });

    // if (!response.ok) {
    //   console.error("Cashfree API Error:", await response.text());
    //   throw new Error(`Cashfree API error: ${response.status}`);
    // }

    // const data = await response.json();

    // // Log Cashfree response
    // console.log("Cashfree Response:", data);

    // if (!data.payment_session_id) {
    //   console.error("No payment_session_id in response:", data);
    //   throw new Error("Missing payment_session_id in Cashfree response");
    // }

    const data = await Cashfree.PGCreateOrder("2023-08-01", payload)
      .then((response) => {
        console.log("Order created successfully:", response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Error:", error.response.data.message);
        return null;
      });

    if (!data) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500, headers: corsHeaders }
      );
    }

    // Construct URL with error handling
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
  const corsResult = handleCORS(request);
  if (corsResult) return corsResult;

  return NextResponse.json({}, { headers: corsHeaders });
}
