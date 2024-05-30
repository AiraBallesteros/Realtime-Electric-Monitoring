import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { consumerData } from "@/dummy.data";
import { zodResolver } from "@hookform/resolvers/zod/src/zod";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
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
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { query, collection, where, getDocs, updateDoc } from 'firebase/firestore';//
import { db } from "/src/firebase/config";//


const formSchema = z.object({
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
    .max(15),
  address: z
    .string()
    .min(2, {
      message: "Address must be at least 2 characters long",
    })
    .max(255, {
      message: "Address must not exceed in 255 characters",
    }),
  latitude: z.string(),
  longitude: z.string(),
  casureco_no: z.string().min(2, {
    message: "Casureco number must be at least 2 characters long",
  }),
  // NOTE: adjust the min length depending on the your needs
  device_no: z.string().min(2, {
    message: "Device id number must be at least 2 characters long",
  }),
  email: z
    .string()
    .email("This is not a valid email.")
    .min(1, { message: "This field has to be filled." }),
});

function EditConsumer() {
  const { id } = useParams();
  const [consumer, setConsumer] = useState(null);

  useEffect(() => {
    const fetchConsumer = async () => {
      const q = query(collection(db, 'Consumers'), where('device_no', '==', id));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setConsumer(querySnapshot.docs[0].data());
      } else {
        console.log('No configuration found');
        toast({
          title: 'Error',
          description: 'No configuration found',
          status: 'error',
        });
      }
    };

    fetchConsumer();
  }, [id]);

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

  useEffect(() => {
    if (consumer) {
      form.reset(consumer);
    }
  }, [consumer, form]);

  const navigate = useNavigate();

  async function onSubmit(values) {
    const consumerRef = collection(db, "Consumers");
    const q = query(consumerRef, where("uid", "==", consumer.uid)); 
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Assuming 'uid' is unique, there should only be one document
        const docRef = querySnapshot.docs[0].ref; // get the reference to the first document
  
        await updateDoc(docRef, {
          // first_name: values.first_name,
          // middle_name: values.middle_name,
          // last_name: values.last_name,
          // name: `${values.first_name} ${values.middle_name[0]}. ${values.last_name}`,
          // contact_no: values.contact_no,          
          // address: values.address,
          latitude: values.latitude,
          longitude: values.longitude,
          casureco_no: values.casureco_no,
          device_no: values.device_no,
        });
        toast({
          title: "Updated",
          description: "Consumer account updated successfully",
        });
      } else {
        // No document found with the uid provided
        toast({
          title: "Error",
          description: "No matching consumer account found.",
        });
      }
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({
        title: "Error",
        description: "There was an error updating the consumer account.",
      });
    }
    navigate("/admin/consumers");
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
                          <Input 
                            placeholder="Enter first name" 
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
                    name="middle_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter middle name" 
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
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter last name" 
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
                          <Input
                            placeholder="Enter contact number"
                            {...field}
                            disabled
                            style={{ opacity: 1 }}
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
                              disabled
                              style={{ opacity: 1 }}
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
                          <Input 
                            placeholder="Enter email address" 
                            {...field} 
                            style={{ opacity: 1 }}
                            disabled/>
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
                  Update Account
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default EditConsumer;