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

const allowedOrigins = [
  "https://jaymabioinnovations.com",
  "https://www.jaymabioinnovations.com",
  "https://checkout.jaymabioinnovations.com",
  "https://www.checkout.jaymabioinnovations.com",
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
  
  // Check if the origin is in our allowed list
  if (allowedOrigins.includes(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  } else {
    corsHeaders["Access-Control-Allow-Origin"] = allowedOrigins[0];
  }

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  // Handle CORS preflight
  const corsResult = handleCORS(req);
  if (corsResult) return corsResult;

  try {
    const { products, userId, paymentPrice, name, email, phone, address } =
      await req.json();

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
      order_id: id,
      order_amount: paymentPrice,
      order_currency: "INR",
    };

    const response = await fetch(process.env.CASHFREE_FETCH_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.NEXT_PUBLIC_CASHFREE_APP_ID as string,
        "x-client-secret": process.env
          .NEXT_PUBLIC_CASHFREE_SECRET_KEY as string,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const url = `${process.env.PAYMENT_URL}?session_id=${data.payment_session_id}&store_id=${params.storeId}&order_id=${id}`;

    return NextResponse.json({ url: url }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const corsResult = handleCORS(request);
  if (corsResult) return corsResult;

  return NextResponse.json({}, { headers: corsHeaders });
}
