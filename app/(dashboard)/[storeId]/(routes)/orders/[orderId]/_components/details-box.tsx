import { cn } from "@/lib/utils";
import React from "react";

interface DetailsBoxProps {
  name: string;
  value: string;
  className?: string;
}

const DetailsBox = ({ name, value, className }: DetailsBoxProps) => {
  return (
    <div className={cn("col-span-2 flex items-center border gap-3 rounded-lg px-4 py-3 border-green/30", className)}>
      <h1 className="text-lg text-green/50">{name}:</h1>
      <h1 className="text-medium text-green">{value}</h1>
    </div>
  );
};

export default DetailsBox;
