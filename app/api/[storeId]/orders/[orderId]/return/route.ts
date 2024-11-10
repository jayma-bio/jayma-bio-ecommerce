import { db } from "@/lib/firebase";
import { Order } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "https://jaymabioinnovations.com",
  "https://www.jaymabioinnovations.com",
  "https://checkout.jaymabioinnovations.com",
  "https://www.checkout.jaymabioinnovations.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
];

// Updated CORS headers with explicit values
const corsHeaders = new Headers({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods":
    "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Credentials": "true",
});

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");

  // Set the actual origin if it's allowed, otherwise use the first allowed origin
  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders.set("Access-Control-Allow-Origin", origin);
  } else {
    corsHeaders.set("Access-Control-Allow-Origin", allowedOrigins[0]);
  }

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string; orderId: string } }
) {
  const origin = req.headers.get("origin");

  // Set the actual origin if it's allowed, otherwise use the first allowed origin
  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders.set("Access-Control-Allow-Origin", origin);
  } else {
    corsHeaders.set("Access-Control-Allow-Origin", allowedOrigins[0]);
  }

  try {
    const body = await req.json();

    const {
      returned_items,
      returnWholeOrder,
      return_or_refund,
      returnImages,
      return_reason,
    } = body;

    if (!params.storeId) {
      return new NextResponse("Store ID is required/missing", {
        status: 400,
        headers: corsHeaders,
      });
    }
    if (!params.orderId) {
      return new NextResponse("Order ID is required/missing", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const orderRef = await getDoc(
      doc(db, "stores", params.storeId, "orders", params.orderId)
    );

    let updatedData;
    if (returnWholeOrder) {
      updatedData = {
        ...orderRef.data(),
        order_status: "Return Requested",
        returned_items: returned_items,
        isReturned: true,
        updatedAt: serverTimestamp(),
        returnImages: returnImages,
        return_or_refund: return_or_refund,
        return_reason: return_reason,
      };
    } else {
      updatedData = {
        ...orderRef.data(),
        isReturned: returned_items ? true : false,
        cancelled_items: returned_items,
        updatedAt: serverTimestamp(),
        return_or_refund: return_or_refund,
        returnImages: returnImages,
        return_reason: return_reason,
      };
    }

    if (orderRef.exists()) {
      await updateDoc(
        doc(db, "stores", params.storeId, "orders", params.orderId),
        updatedData
      );
    } else {
      return new NextResponse("Order not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    const size = (
      await getDoc(doc(db, "stores", params.storeId, "orders", params.orderId))
    ).data() as Order;

    return NextResponse.json(size, { headers: corsHeaders });
  } catch (error: any) {
    console.log(`ORDER_PATCH Error: ${error.message}`);
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { storeId: string; orderId: string } }
) {
  const origin = req.headers.get("origin");
  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders.set("Access-Control-Allow-Origin", origin);
  } else {
    corsHeaders.set("Access-Control-Allow-Origin", allowedOrigins[0]);
  }

  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required/missing", {
        status: 400,
        headers: corsHeaders,
      });
    }
    if (!params.orderId) {
      return new NextResponse("Order ID is required/missing", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const orderRef = doc(
      db,
      "stores",
      params.storeId,
      "orders",
      params.orderId
    );
    await deleteDoc(orderRef);

    return NextResponse.json(
      { msg: "Orders deleted" },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.log(`ORDER_DELETE Error: ${error.message}`);
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string; orderId: string } }
) {
  const origin = req.headers.get("origin");
  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders.set("Access-Control-Allow-Origin", origin);
  } else {
    corsHeaders.set("Access-Control-Allow-Origin", allowedOrigins[0]);
  }

  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required/missing", {
        status: 400,
        headers: corsHeaders,
      });
    }
    if (!params.orderId) {
      return new NextResponse("Order ID is required/missing", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const order = (
      await getDoc(doc(db, "stores", params.storeId, "orders", params.orderId))
    ).data() as Order;

    const updatedOrder = order.order_status === "Order Cancelled" && order;

    return NextResponse.json(updatedOrder, { headers: corsHeaders });
  } catch (error: any) {
    console.log(`ORDER_GET Error: ${error.message}`);
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}
