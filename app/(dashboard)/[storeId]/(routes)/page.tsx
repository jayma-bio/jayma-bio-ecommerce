import { Separator } from "@/components/ui/separator";
import { Heading } from "./_components/shared/heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LuIndianRupee } from "react-icons/lu";
import { priceFormatter } from "@/lib/utils";
import { getTotalRevenue } from "@/actions/get-total-revenue";
import { getTotalSales } from "@/actions/get-total-sales";
import { getTotalProducts } from "@/actions/get-total-products";
import Overview from "@/components/ui/overview";
import { getGraphTotalRevenue } from "@/actions/get-graph-total-revenue";
import { getOrderPaymentStatusTotalRevenue } from "@/actions/get-toal-revenue-by-payment-status";
import { getOrderTotalRevenueByCategory } from "@/actions/get-total-revenue-by-category";
import { getOrderStatusTotalRevenue } from "@/actions/get-revenue-by-order-status";

const SizesPage = async ({ params }: { params: { storeId: string } }) => {
  const totalRevenue = await getTotalRevenue(params.storeId);
  const totalSales = await getTotalSales(params.storeId);
  const totalProducts = await getTotalProducts(params.storeId);

  const monthlyGraphRevenue = await getGraphTotalRevenue(params.storeId);
  const orderStatusTotalRevenue = await getOrderPaymentStatusTotalRevenue(
    params.storeId
  );
  const orderCategoryTotalRevenue = await getOrderTotalRevenueByCategory(
    params.storeId
  );
  const orderPaymentStatusTotalRevenue = await getOrderStatusTotalRevenue(
    params.storeId
  );
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Dashboard" description="Overview of your store" />
        <Separator />

        <div className="grid grid-cols-4 gap-5">
          <Card className="col-span-2">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <LuIndianRupee className="size-5 shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {priceFormatter.format(totalRevenue)}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-sm font-medium">
                Order Placed
              </CardTitle>
              <LuIndianRupee className="size-5 shrink-0 " />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{totalSales}</div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <LuIndianRupee className="size-5 shrink-0 " />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-sm font-medium">
                Revenue By Month
              </CardTitle>
              <LuIndianRupee className="size-5 shrink-0 " />
            </CardHeader>
            <CardContent>
              <Overview data={monthlyGraphRevenue} />
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-sm font-medium">
                Revenue By Payment Status
              </CardTitle>
              <LuIndianRupee className="size-5 shrink-0 " />
            </CardHeader>
            <CardContent>
              <Overview data={orderStatusTotalRevenue} />
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-sm font-medium">
                Revenue By Category
              </CardTitle>
              <LuIndianRupee className="size-5 shrink-0 " />
            </CardHeader>
            <CardContent>
              <Overview data={orderCategoryTotalRevenue} />
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle className="text-sm font-medium">
                Revenue By Order Status
              </CardTitle>
              <LuIndianRupee className="size-5 shrink-0 " />
            </CardHeader>
            <CardContent>
              <Overview data={orderPaymentStatusTotalRevenue} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SizesPage;
