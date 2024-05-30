import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { z } from "zod";
import { db, auth } from "/src/firebase/config";
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const formSchema = z
  .object({
    email: z
      .string()
      .max(50, "Email must be at most 50 characters")
      .email("Email must be a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z
      .string()
      .min(6, "Password confirmation must be at least 6 characters"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords does not match",
  });

export function Register() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", password_confirmation: "" },
  });

  const handleRegister = async (values) => {
    const { email, password } = values;
    try {
      // Check if the email exists in the 'Admin' collection
      const adminsRef = collection(db, "Admin");
      const q = query(adminsRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        //If email was not found in Admin collection
        throw new Error("Email not registered. Please contact support.");
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      //Add the Uid of the newly created admin account
      const adminDocRef = doc(db, "Admin", querySnapshot.docs[0].id);
      await updateDoc(adminDocRef, {
        uid: user.uid
      });
      //sign in the newly created user
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin/dashboard");
    } catch (error) {
      // Handle errors appropriately
      form.setError("email", { message: "Invalid Email" });
      setError("Login Error: " + error.message);

    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div>
        <h2 className="text-3xl font-extrabold text-center mb-4">
          Realtime Electric
          <br />
          Meter Monitoring
        </h2>

        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Admin Register</CardTitle>
            <CardDescription>
              Create an admin account to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleRegister)}
                className="space-y-2"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          className={
                            form.formState.errors.email && "border-red-500"
                          }
                          placeholder="johndoe@mail.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            className={
                              form.formState.errors.password && "border-red-500"
                            }
                            type={showPassword ? "text" : "password"}
                            placeholder="*********"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        >
                          {showPassword ? (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password_confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Confirmation</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            className={
                              form.formState.errors.password_confirmation &&
                              "border-red-500"
                            }
                            type={showPasswordConfirmation ? "text" : "password"}
                            placeholder="*********"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPasswordConfirmation((value) => !value)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        >
                          {showPasswordConfirmation ? (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-1 pl-1">
                  <NavLink className="flex items-center" to={"/admin/login"}>
                    <p className="text-xs text-gray-500">
                      Already have an account?
                      <span className="text-blue-500"> Login</span>
                    </p>
                  </NavLink>
                  <NavLink className="flex items-center" to={"/"}>
                    <p className="text-xs text-gray-500">
                      Are you a consumer?
                      <span className="text-blue-500"> Login</span>
                    </p>
                  </NavLink>
                </div>

                <div className="flex justify-end">
                  <Button className="mt-4" type="submit">
                    Register
                  </Button>
                </div>
                {error && <p className="text-red-500">{error}</p>}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}