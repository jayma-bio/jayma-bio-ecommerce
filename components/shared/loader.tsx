import { LoaderIcon } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoaderIcon className="size-10 shrink-0 animate-spin" />
    </div>
  );
}
