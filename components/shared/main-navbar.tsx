"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import React from "react";

export const MainNav = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  const pathname = usePathname();
  const params = useParams();

  const routes = [
    {
      href: `/${params.storeId}`,
      label: "Overview",
      active: pathname === `/${params.storeId}`,
    },
    {
      href: `/${params.storeId}/billboards`,
      label: "Billboards",
      active:
        pathname === `/${params.storeId}/billboards` ||
        pathname.includes("billboards"),
    },
    {
      href: `/${params.storeId}/categories`,
      label: "Categories",
      active:
        pathname === `/${params.storeId}/categories` ||
        pathname.includes("categories"),
    },
    {
      href: `/${params.storeId}/sizes`,
      label: "Sizes",
      active:
        pathname === `/${params.storeId}/sizes` || pathname.includes("sizes"),
    },
    {
      href: `/${params.storeId}/products`,
      label: "Products",
      active:
        pathname === `/${params.storeId}/products` ||
        pathname.includes("products"),
    },
    {
      href: `/${params.storeId}/orders`,
      label: "Orders",
      active:
        pathname === `/${params.storeId}/orders` || pathname.includes("orders"),
    },
    {
      href: `/${params.storeId}/cancelled`,
      label: "Cancelled Orders",
      active:
        pathname === `/${params.storeId}/cancelled` ||
        pathname.includes("cancelled"),
    },
    {
      href: `/${params.storeId}/settings`,
      label: "Settings",
      active: pathname === `/${params.storeId}/settings`,
    },
  ];

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6 pl-6")}>
      {routes.map((route) => (
        <Link
          href={route.href}
          key={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary capitalize",
            route.active
              ? "text-primary dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
};
