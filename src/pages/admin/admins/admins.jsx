import { DataTable } from "@/components/data-table";
import Header from "@/components/header";
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
import { admins } from "@/dummy.data";
import { PlusIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { employeeType } from "/src/config";
import { columns } from "./columns";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "/src/firebase/config";
import { db } from "/src/firebase/config";
import { collection, addDoc, query, onSnapshot, where, getDocs } from "firebase/firestore";

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
    employee_type: z.enum(employeeType),
  contact_no: z.string().min(8, {
    message: "Contact number must be at least 8 characters.",
  }),
});

function Admins() {
  const [isOpen, setIsOpen] = useState(false);
  const [admins, setAdmins] = useState([]); // State to hold dynamic data

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // Fetch admins data from Admin Collection in Firestore
  useEffect(() => {
    const q = query(collection(db, 'Admin'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedAdmins = [];
      querySnapshot.forEach((doc) => {
        fetchedAdmins.push(doc.data());
      });
      setAdmins(fetchedAdmins); // Update state with fetched data
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  async function onSubmit(values) {
    event.preventDefault();
    // Using Firebase Auth to create a new user
    const adminsRef = collection(db, 'Admin');
    let q = query(adminsRef, where("employee_id", "==", values.employee_id));
    let querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) { // Check whether Casureco Account Number already exists
      toast({
        title: "Error Creating Admin",
        description: "Admin Employee ID is already in use. Please use a different one."
      });
      return; 
    }

    q = query(adminsRef, where("email", "==", values.email));
    querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) { // Check whether Casureco Account Number already exists
      toast({
        title: "Error Creating Admin",
        description: "Email is already in use. Please use a different one."
      });
      return; 
    }

    const adminRef = collection(db, 'Admin'); //Add the newly created Admin to Admin collection
    await addDoc(adminRef, {
      // uid: userCredential.user.uid, // Store the unique ID for reference
      employee_id: values.employee_id,
      name: values.name,
      email: values.email, 
      employee_type: values.employee_type,
      contact_no: values.contact_no,
      type: "admin"
    })
    .then(() =>{
      setIsOpen(false);
        toast({
          title: "Success",
          description: "Admin account successfully added."
        });
    });

}

  return (
    <div className="w-full space-y-4">
      <Header title="Admins" userType="Admin" />
      <div className="flex justify-end">
        <Dialog
          open={isOpen}
          onOpenChange={(value) => {
          setIsOpen(value);
          form.reset();
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Admin</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create admin</DialogTitle>
              <DialogDescription>Create an admin account</DialogDescription>
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
                        <Input placeholder="Enter admin email" {...field} />
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
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <DataTable columns={columns} data={admins} />
      </div>
    </div>
  );
}

export default Admins;
