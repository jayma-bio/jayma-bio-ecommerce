import { db } from "@/lib/firebase";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const OPTIONS = async () => {
  return NextResponse.json({}, { headers: corsHeaders });
};

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { orderId } = await req.json();
    console.log(params.storeId);
    const response = await fetch(
      `${process.env.CASHFREE_FETCH_URL as string}/${orderId}/payments`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.NEXT_PUBLIC_CASHFREE_APP_ID as string,
          "x-client-secret": process.env
            .NEXT_PUBLIC_CASHFREE_SECRET_KEY as string,
          "x-api-version": "2023-08-01",
        },
      }
    );
    const data = await response.json();

    console.log(data);

    await updateDoc(doc(db, "stores", params.storeId, "orders", orderId), {
      isPaid: true,
      paymentId: data[0].cf_payment_id,
      updatedAt: serverTimestamp(),
    });
    
    return NextResponse.json(
      { message: "Db updated", status: 200 },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: error }, { headers: corsHeaders });
  }
}
