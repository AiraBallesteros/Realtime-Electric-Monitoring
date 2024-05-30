import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Label } from "./ui/label";

function NoDataFound() {
  return (
    <div className="flex items-center min-h-screen -mt-20 justify-center">
      <Label className="flex gap-1  items-center mx-auto">
        <InformationCircleIcon className="w-6 h-6" />
        <span>No data found</span>
      </Label>
    </div>
  );
}

export default NoDataFound;
