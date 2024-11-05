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
    const { orderId, paymentId, status } = await req.json();

    if (status === "success" || status === "SUCCESS") {
      await updateDoc(doc(db, "stores", params.storeId, "orders", orderId), {
        isPaid: true,
        paymentId: paymentId,
        order_status: "Payment Successful",
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, "stores", params.storeId, "orders", orderId), {
        order_status: "Payment Failed",
        updatedAt: serverTimestamp(),
      });
    }
    
    return NextResponse.json(
      { message: "Db updated", status: 200 },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: error }, { headers: corsHeaders });
  }
}
