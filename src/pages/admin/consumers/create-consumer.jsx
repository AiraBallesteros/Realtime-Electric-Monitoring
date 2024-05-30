import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod/src/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "/src/firebase/config";
import { collection, addDoc, query, where, getDocs} from "firebase/firestore";

const formSchema = z
  .object({
    first_name: z
      .string()
      .min(2, {
        message: "First name must be at least 2 characters",
      })
      .max(50),
    middle_name: z
      .string()
      .min(2, {
        message: "Middle name must be at least 2 characters",
      })
      .max(50),
    last_name: z
      .string()
      .min(2, {
        message: "Last name must be at least 2 characters",
      })
      .max(50),
    contact_no: z
      .string()
      .min(10, {
        message: "Contact number must be at least 10 digits",
      })
      .max(11),
    address: z
      .string()
      .min(2, {
        message: "Address must be at least 2 characters long",
      })
      .max(255, {
        message: "Address must not exceed in 255 characters",
      }),
    casureco_no: z.string().min(2, {
      message: "Casureco number must be at least 2 characters long",
    }),
    latitude: z.string(),
    longitude: z.string(),
    // NOTE: adjust the min length depending on the your needs
    device_no: z.string().min(2, {
      message: "Device id number must be at least 2 characters long",
    }),
    email: z
      .string()
      .email("This is not a valid email.")
      .min(1, { message: "This field has to be filled." })
  })

function ConsumerCreate() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      contact_no: "",
      address: "",
      latitude: "",
      longitude: "",
      casureco_no: "",
      device_no: "",
      email: "",
    },
  });


  const navigate = useNavigate();


  async function onSubmit(values) {
    event.preventDefault();
  
    // Query Firestore for existing device ID
    const consumerRef = collection(db, 'Consumers');
    const adminRef = collection(db, 'Admin');
    let q = query(consumerRef, where("casureco_no", "==", values.casureco_no));
    let querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) { // Check whether Casureco Account Number already exists
      toast({
        title: "Error Creating Consumer",
        description: "Casureco Account Number is already in use. Please use a different one."
      });
      return; 
    }
    q = query(consumerRef, where("device_no", "==", values.device_no));
    querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) { // Check whether Device ID Number already exists
      toast({
        title: "Error Creating Consumer",
        description: "Device ID is already in use. Please use a different one."
      });
      return; // Stop the execution if device ID is found
    }
    
    q = query(consumerRef, where("email", "==", values.email));
    querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) { // Check whether Device ID Number already exists
      toast({
        title: "Error Creating Consumer",
        description: "Email is already in use. Please use a different one."
      });
      return; // Stop the execution if device ID is found
    }

    q = query(adminRef, where("email", "==", values.email));
    querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) { // Check whether Device ID Number already exists
      toast({
        title: "Error Creating Consumer",
        description: "Email is already in use. Please use a different one."
      });
      return; // Stop the execution if device ID is found
    }
    await addDoc(consumerRef, {
      // uid: userCredential.user.uid, // Store the unique ID for reference
      first_name: values.first_name,
      middle_name: values.middle_name,
      last_name: values.last_name,
      name: `${values.first_name} ${values.middle_name[0]}. ${values.last_name}`,
      contact_no: values.contact_no,          
      address: values.address,
      latitude: values.latitude,
      longitude: values.longitude,
      casureco_no: values.casureco_no,
      device_no: values.device_no,
      email: values.email, // Email is already stored in Auth, but you might want it here for easy access
      type: "consumer"
    })
    .then(() =>{
      toast({
        title: "Created",
        description: "Consumer successfully created"
      });
      navigate("/admin/consumers");
    })
    .catch((error) => {
      // Handle errors such as email already in use
      console.error("Error creating admin account:", error);
      toast({
        title: "Error",
        description: error.message // Displaying error message
      });
    });
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Header title="Consumer / Create Account" />
      <Card className="mt-2 py-8 px-4">
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <h2>Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middle_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter middle name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
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
                          <Input
                            placeholder="Enter contact number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-full">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea
                              className="col-span-2 resize-none"
                              placeholder="Enter consumer address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter x-coordinate" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter y-coordinate" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h2>Account Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                  <FormField
                    control={form.control}
                    name="casureco_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Casureco Account Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter casureco account number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="device_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter device ID" {...field} />
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
                          <Input placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div></div>
                </div>
              </div>
              <div>
                <Button type="submit" className="mt-8">
                  Create Account
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ConsumerCreate;
