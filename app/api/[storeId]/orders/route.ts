import { db } from "@/lib/firebase";
import { Order } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { NextResponse } from "next/server";


export const GET = async (
  req: Request,
  { params }: { params: { storeId: string } }
) => {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required/missing", { status: 400 });
    }

    const sizesData = (
      await getDocs(collection(doc(db, "stores", params.storeId), "orders"))
    ).docs.map((doc) => doc.data()) as Order[];

    return NextResponse.json(sizesData);
  } catch (error: any) {
    console.log(`ORDERS_GET Error: ${error.message}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
