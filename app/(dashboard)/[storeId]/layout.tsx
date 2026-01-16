import { Suspense } from "react";
import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { collection, getDocs, query, where } from "firebase/firestore";
import { redirect } from "next/navigation";
import { Store } from "@/types-db";
import Navbar from "@/components/shared/navbar";
import Loader from "@/components/shared/loader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { storeId: string };
}

async function StoreValidator({ storeId, userId }: { storeId: string; userId: string }) {
  const storeSnap = await getDocs(
    query(
      collection(db, "stores"),
      where("userId", "==", userId),
      where("id", "==", storeId)
    )
  );

  let store: Store | undefined;
  storeSnap.forEach((doc) => {
    store = doc.data() as Store;
  });

  if (!store) {
    redirect("/");
  }

  return null;
}

const DashboardLayout = async ({ children, params }: DashboardLayoutProps) => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <>
      <Navbar />
      <Suspense
        fallback={
         <Loader />
        }
      >
        <StoreValidator storeId={params.storeId} userId={userId} />
        {children}
      </Suspense>
    </>
  );
};

export default DashboardLayout;
