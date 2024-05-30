import { Button } from "@/components/ui/button";
import { currency } from "@/lib/utils";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";

export const columns = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "month",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => {
            let nextSortDirection;
            switch (column.getIsSorted()) {
              case 'asc':
                nextSortDirection = 'desc'; // From ascending to descending
                break;
              case 'desc':
                nextSortDirection = undefined; // From descending to unsorted/default
                break;
              default:
                nextSortDirection = 'asc'; // From unsorted/default to ascending
                break;
            }
            column.toggleSorting(nextSortDirection);
          }}
        >
          Date
          <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "kwh",
    header: "kWh",
  },
  {
    accessorKey: "monthly_bill",
    header: "Monthly Bill",
    cell: (props) => <span>{currency(props.getValue())}</span>,
  },
];
