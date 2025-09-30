import { CirclePlus, LayoutGrid } from "lucide-react";
import { Button } from "./ui/button";

interface NoDataFoundProps {
  title: string;
  description: string;
  buttonText: string;
  buttonAction: () => void;
}

export const NoDataFound = ({
  title,
  description,
  buttonText,
  buttonAction,
}: NoDataFoundProps) => {
  return (
    <div className="col-span-full text-center py-12 2x1:py-24 bg-muted/48 rounded-lg">
      <LayoutGrid className="size-12 mx-auto text-accent-foreground" />
      <h3 className="mt-4 text-lg text-muted-foreground"> {title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
        {description}
      </p>
      <Button onClick={buttonAction} className="mt-4">
        <CirclePlus className="size-4 mr-2" />
        {buttonText}
      </Button>
    </div>
  );
};
