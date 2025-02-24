import { db, storage } from "@/lib/firebase";
import { Size, Store } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { NextResponse } from "next/server";

export const PATCH = async (
  req: Request,
  { params }: { params: { storeId: string } }
) => {
  try {
    const { userId } = auth();
    const body = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required/missing", { status: 400 });
    }

    const docRef = doc(db, "stores", params.storeId);
    await updateDoc(docRef, { name });
    const store = (await getDoc(docRef)).data() as Store;

    return NextResponse.json(store);
  } catch (error: any) {
    console.log(`STORE_PATCH Error: ${error.message}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const POST = async (
  req: Request,
  { params }: { params: { storeId: string } }
) => {
  try {
    const { userId } = auth();
    const body = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 400 });
    }

    const { name, value } = body;

    if (!name) {
      return new NextResponse("Size name is required/missing", {
        status: 400,
      });
    }

    if (!value) {
      return new NextResponse("Size value  is required/missing", {
        status: 400,
      });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required/missing", { status: 400 });
    }

    const store = await getDoc(doc(db, "stores", params.storeId));

    if (store.exists()) {
      let storeData = store.data();
      if (storeData?.userId !== userId) {
        return new NextResponse("Unauthorized", { status: 400 });
      }
    }

    const sizeData = {
      name,
      value,
      createdAt: serverTimestamp(),
    };

    // Add the data to the firestore database and retrive its reference id
    const sizeRef = await addDoc(
      collection(db, "stores", params.storeId, "sizes"),
      sizeData
    );

    // Get the reference id
    const id = sizeRef.id;

    await updateDoc(doc(db, "stores", params.storeId, "sizes", id), {
      ...sizeData,
      id,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id, ...sizeData });
  } catch (error: any) {
    console.log(`SIZES_POST Error: ${error.message}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const GET = async (
  req: Request,
  { params }: { params: { storeId: string } }
) => {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required/missing", { status: 400 });
    }

    const sizesData = (
      await getDocs(collection(doc(db, "stores", params.storeId), "sizes"))
    ).docs.map((doc) => doc.data()) as Size[];

    return NextResponse.json(sizesData);
  } catch (error: any) {
    console.log(`SIZES_GET Error: ${error.message}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { storeId: string } }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    const docRef = doc(db, "stores", params.storeId);

    //  Delete all the subcollections of the store with those data files

    // billboards and its images
    const billboardsQuerySnapshot = await getDocs(
      collection(db, `stores/${params.storeId}/billboards`)
    );

    billboardsQuerySnapshot.forEach(async (billboardDoc) => {
      await deleteDoc(billboardDoc.ref);

      //remove the images from the storage
      const imageUrl = billboardDoc.data().imageUrl;
      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }
    });

    //categories

    const categoriesQuerySnapshot = await getDocs(
      collection(db, `stores/${params.storeId}/categories`)
    );

    categoriesQuerySnapshot.forEach(async (categoryDoc) => {
      await deleteDoc(categoryDoc.ref);
    });

    //sizes
    const sizesQuerySnapshot = await getDocs(
      collection(db, `stores/${params.storeId}/sizes`)
    );

    sizesQuerySnapshot.forEach(async (sizesDoc) => {
      await deleteDoc(sizesDoc.ref);
    });

    //kitchens
    const kitchensQuerySnapshot = await getDocs(
      collection(db, `stores/${params.storeId}/kitchens`)
    );

    kitchensQuerySnapshot.forEach(async (kitchensDoc) => {
      await deleteDoc(kitchensDoc.ref);
    });

    // cuisines
    const cuisinesQuerySnapshot = await getDocs(
      collection(db, `stores/${params.storeId}/cuisines`)
    );

    cuisinesQuerySnapshot.forEach(async (cuisinesDoc) => {
      await deleteDoc(cuisinesDoc.ref);
    });

    //products && images
    const productsQuerySnapshot = await getDocs(
      collection(db, `stores/${params.storeId}/products`)
    );

    productsQuerySnapshot.forEach(async (productDoc) => {
      await deleteDoc(productDoc.ref);

      //remove the images from the storage
      const imagesArray = productDoc.data().images;
      if (imagesArray && Array.isArray(imagesArray)) {
        await Promise.all(
          imagesArray.map(async (image) => {
            const imageRef = ref(storage, image.url);
            await deleteObject(imageRef);
          })
        );
      }
    });

    //orders and its order items and its images
    const ordersQuerySnapshot = await getDocs(
      collection(db, `stores/${params.storeId}/orders`)
    );

    ordersQuerySnapshot.forEach(async (orderDoc) => {
      await deleteDoc(orderDoc.ref);

      const orderItemsArray = orderDoc.data().orderItems;
      if (orderItemsArray && Array.isArray(orderItemsArray)) {
        await Promise.all(
          orderItemsArray.map(async (orderItem) => {
            const itemImagesArray = orderItem.images;
            if (itemImagesArray && Array.isArray(itemImagesArray)) {
              await Promise.all(
                itemImagesArray.map(async (image) => {
                  const imageRef = ref(storage, image.url);
                  await deleteObject(imageRef);
                })
              );
            }
          })
        );
      }
    });

    // finally deleting the store

    await deleteDoc(docRef);

    return NextResponse.json({
      msg: "Store and all of sub-collections deleted",
    });
  } catch (error: any) {
    console.log(`STORE_DELETE Error: ${error.message}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
