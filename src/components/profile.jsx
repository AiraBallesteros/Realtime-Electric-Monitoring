import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { auth, db } from "../firebase/config";

const formSchema = z.object({
  employee_id: z.string(),
  name: z.string(),
  employee_type: z.string(),
  contact_no: z.string(),
  email: z.string(),
});

function Profile() {
  const [userEmployeeId, setUserEmployeeID] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmployeeType, setUserEmployeeType] = useState("")
  const [userContactNo, setUserContactNo] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userUid, setUserUid] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(
          collection(db, "Admin"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setUserEmployeeID(docData.employee_id);
          setUserName(docData.name);
          setUserEmployeeType(docData.employee_type);
          setUserContactNo(docData.contact_no);
          setUserEmail(docData.email);
          setUserUid(docData.uid)
        }
      }
    });
    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: userEmployeeId,
      name: userName,
      employee_type: userEmployeeType,
      contact_no: userContactNo,
      email: userEmail,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values) {
    const adminRef = collection(db, "Admin");
    const q = query(adminRef, where("uid", "==", userUid));
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref; 

        await updateDoc(docRef, {
          employee_id: values.employee_id || userEmployeeId,
          name: values.name || userName,
          employee_type: values.employee_type || userEmployeeType,
          contact_no: values.contact_no || userContactNo,
          email: values.email || userEmail,
        });

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

  return (
    <div className="flex gap-8">
      <div className="w-full">
        <h4 className="mb-0 p-0">Profile</h4>
        <p className="text-muted-foreground">
          Update your accounts profile information and email address.
        </p>
      </div>
      <Card className=" w-full p-4">
        <div className="flex items-center w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 w-full">
              <FormField
                className=""
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl className="">
                      <Input
                        className="w-full"
                        placeholder={userEmployeeId}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                className=""
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Name</FormLabel>
                    <FormControl className="">
                      <Input
                        className="w-full"
                        placeholder={userName}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                className=""
                control={form.control}
                name="employee_type"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Employee Type</FormLabel>
                    <FormControl className="">
                      <Input
                        className="w-full"
                        placeholder={userEmployeeType}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                className=""
                control={form.control}
                name="contact_no"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl className="">
                      <Input
                        className="w-full"
                        placeholder={userContactNo}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                className=""
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Email</FormLabel>
                    <FormControl className="">
                      <Input
                        className="w-full"
                        placeholder={userEmail}
                        {...field}
                        style={{ opacity: 1 }}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Button type="submit" className="mt-4">
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}

export default Profile;
