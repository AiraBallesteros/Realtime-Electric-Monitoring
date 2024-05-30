import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { employeeType } from "@/config";
import {
  ArrowsUpDownIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropTypes } from "prop-types";
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { db, auth  } from "/src/firebase/config";
import { onAuthStateChanged } from 'firebase/auth';
import { query, collection, where, getDocs, deleteDoc, updateDoc } from "firebase/firestore";

const formSchema = z.object({
  employee_id: z.string().min(3, {
    message: "Employee must be at least 3 characters.",
  }),
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  email: z
    .string()
    .min(3, {
      message: "Email must be at least 3 characters.",
    })
    .email(),
  contact_no: z.string().min(8, {
    message: "Contact number must be at least 8 characters.",
  }),
  employee_type: z.enum(employeeType),
});

export const ActionComponent = ({ row }) => {
  const admin = row.original;

  const [isOpen, setIsOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: admin.employee_id,
      name: admin.name,
      email: admin.email,
      contact_no: admin.contact_no,
      employee_type: admin.employee_type,
    },
  });

async function onSubmit(values) {
  const adminRef = collection(db, "Admin");
  const q = query(adminRef, where("uid", "==", admin.uid)); // assuming admin.uid is the uid you want to query for
  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Assuming 'uid' is unique, there should only be one document
      const docRef = querySnapshot.docs[0].ref; // get the reference to the first document
      await updateDoc(docRef, {
        employee_id: values.employee_id,
        name: values.name,
        email: values.email,
        contact_no: values.contact_no,
        employee_type: values.employee_type,
       });
        setIsOpen(false);
        toast({
          title: "Updated",
          description: "Admin account updated successfully",
        });
    } else {
      // No document found with the uid provided
      toast({
        title: "Error",
        description: "No matching admin account found.",
      });
    }
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({
        title: "Error",
        description: "There was an error updating the admin account.",
      });
    }
  }
  const [userRole, setUserRole] = useState(''); 
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

  const handleDeleteAdminByEmail = async (email) => {
    // Confirm deletion
    setIsAlertOpen(false);
  
    const adminQuery = query(collection(db, "Admin"), where("email", "==", email));

    if (userRole !== 'super admin') {
      toast({
        title: "Unauthorized",
        description: "You're not authorize to delete an Admin account.",
      });
      return;
    }

    try {
      const querySnapshot = await getDocs(adminQuery);
      if (querySnapshot.empty) {
        toast({
          title: "Error",
          description: "No admin found with the provided email.",
        });
        return;
      }
  
      // Assuming email is unique and only one document exists
      querySnapshot.forEach((doc) => {
        deleteDoc(doc.ref).then(() => {
          toast({
            title: "Admin Deleted",
            description: "The admin account has been successfully deleted.",
          });
        });
      });
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast({
        title: "Error",
        description: "Failed to delete the admin account. Please try again.",
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 ml-2 text-sm w-full"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update admin</DialogTitle>
              <DialogDescription>Update an admin account</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2"
              >
                <FormField
                  control={form.control}
                  name="employee_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter admin employee id"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter admin name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter admin email" 
                          {...field} 
                          disabled
                          style={{ opacity: 1 }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact No</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter admin contact" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employee_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an employee type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employeeType &&
                            employeeType.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="submit">Update</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <DropdownMenuItem className="flex gap-2" onSelect={() => setIsAlertOpen(true)}>
          <TrashIcon className="w-4 h-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete <strong>{admin.email}</strong> account.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <button>Cancel</button>
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteAdminByEmail(admin.email)} className="bg-red-500 text-white hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
    </DropdownMenu>
  );
};

export const columns = [
  {
    accessorKey: "employee_id",
    header: "Employee ID",
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
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "employee_type",
    header: "Employee type",
  },
  {
    accessorKey: "contact_no",
    header: "Contact",
  },
  {
    id: "actions",
    cell: ActionComponent,
  },
];

ActionComponent.propTypes = {
  row: PropTypes.object,
};
