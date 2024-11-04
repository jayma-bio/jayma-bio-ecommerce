// src/lib/cashfree.ts
import { load } from "@cashfreepayments/cashfree-js";

let cashfree: Awaited<ReturnType<typeof load>> | undefined;

const initializeSDK = async function () {
  cashfree = await load({
    mode: "sandbox",
  });
};

initializeSDK();

export default cashfree;
