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

// Constants
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
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

    return NextResponse.json({ id: id }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  });
}