import { Badge } from "@/components/ui/badge";
import { AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currency } from "@/lib/utils";
import {
  ArrowsUpDownIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { CopyIcon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import React, { useState, useEffect } from 'react';
import { db, auth } from "/src/firebase/config";
import { onAuthStateChanged } from 'firebase/auth';
import { query, collection, where, getDocs, deleteDoc } from "firebase/firestore";
export const columns = [
  {
    accessorKey: "device_no",
    header: "Device id",
  },
  {
    accessorKey: "casureco_no",
    header: "Casureco no.",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "contact_no",
    header: "Contact no.",
  },
  {
    accessorKey: "voltage",
    header: "Voltage",
    cell: (props) => {
      const voltage = props.getValue();
      let color = "bg-green-500";
      if (voltage >= 253) color = "bg-red-500";
      else if (voltage == 0) color = "bg-gray-200";
      else if (voltage <= 207) color = "bg-orange-500";
      return <Badge className={color}>{voltage}</Badge>;
    },
  },
  {
    accessorKey: "current",
    header: "Current",
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
  {
    accessorKey: "previous_bill",
    header: "Previous bill",
    cell: (props) => <span>{currency(props.getValue())}</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const consumer = row.original;
      const [userRole, setUserRole] = useState(''); 
      const [isAlertOpen, setIsAlertOpen] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Create a query against the 'Admin' collection where 'uid' field matches the current user's uid.
        const q = query(collection(db, "Admin"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setUserRole(docData.role);
        
        } else {
          console.log("No such document!");
          setUserName('Unknown User');
        }
      } else {
        setUserName('Unknown User');
      }
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);
      const handleDeleteConsumerByEmail = async (email) => {
        // Confirm deletion
        setIsAlertOpen(false);
        const adminQuery = query(collection(db, "Consumers"), where("email", "==", email));
        if (userRole !== 'super admin') {
          toast({
            title: "Unauthorized",
            description: "You're not authorize to delete a Consumer account.",
          });
          return;
        }
        try {
          const querySnapshot = await getDocs(adminQuery);
          if (querySnapshot.empty) {
            toast({
              title: "Error",
              description: "No consumer found with the provided email.",
            });
            return;
          }
      
          // Assuming email is unique and only one document exists
          querySnapshot.forEach((doc) => {
            deleteDoc(doc.ref).then(() => {
              toast({
                title: "Consumer Deleted",
                description: "The consumer account has been successfully deleted.",
              });
            });
          });
        } catch (error) {
          console.error("Error deleting consumer:", error);
          toast({
            title: "Error",
            description: "Failed to delete the consumer account. Please try again.",
          });
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <EllipsisHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              className="flex gap-2 cursor-pointer" 
              onClick={() => navigator.clipboard.writeText(consumer.device_no)}
            >
              <CopyIcon className="w-4 h-4" />
              <span>Copy Device ID</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                to={`/admin/consumers/${consumer.device_no}`}
                className="flex gap-2"
              >
                <EyeIcon className="w-4 h-4" />
                <span>View Consumer</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                to={`/admin/consumers/${consumer.device_no}/edit`}
                className="flex gap-2"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex gap-2 cursor-pointer" onSelect={() => setIsAlertOpen(true)}>
              <TrashIcon className="w-4 h-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete <strong>{consumer.email}</strong> account.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <button>Cancel</button>
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteConsumerByEmail(consumer.email)} className="bg-red-500 text-white hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenu>
      );
    },
  },
];
