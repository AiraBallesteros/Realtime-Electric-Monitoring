import { zodResolver } from "@hookform/resolvers/zod";

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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { z } from "zod";
import { db, auth } from "/src/firebase/config";
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import loginImage from "@/assets/images/login.svg";

const formSchema = z
  .object({
    email: z
      .string()
      .min(2, "Email must be at least 2 characters")
      .max(50, "Email must be at most 50 characters")
      .email("Email must be a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords does not match",
  });

export function Register() {
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", password_confirmation: "" },
  }); 

 const onSubmit = async (values) => {
    const { email, password } = values;
    try {
      // Check if the email exists in the 'Admin' collection
      const consumerRef = collection(db, "Consumers");
      const q = query(consumerRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        //If email was not found in Admin collection
        throw new Error("Email not registered. Please contact support.");
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      //Add the Uid of the newly created admin account
      const consumerDocRef = doc(db, "Consumers", querySnapshot.docs[0].id);
      await updateDoc(consumerDocRef, {
        uid: user.uid
      });
      //sign in the newly created user
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      // Handle errors appropriately
      form.setError("email", { message: "Invalid email" });
      setLoginError(error.message);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen gap-8">
      <div className="hidden flex-col items-center sm:flex">
        <img className="w-[350px]" src={loginImage} alt="login" />
        <h2 className="text-2xl font-extrabold text-center mb-4">
          Realtime Electric Meter Monitoring
        </h2>
      </div>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Consumer Register</CardTitle>
          <CardDescription>
            Create an account to get access to all the features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
              <div className="space-y-1">
                <NavLink className="flex items-center" to={"/"}>
                  <p className="text-xs text-gray-500">
                    Already have an account?
                    <span className="text-blue-500"> Login</span>
                  </p>
                </NavLink>
                <NavLink className="flex items-center" to={"/admin/login"}>
                  <p className="text-xs text-gray-500">
                    Are you an Admin?
                    <span className="text-blue-500"> Login here</span>
                  </p>
                </NavLink>
              </div>

              <div className="flex justify-end">
                <Button className="mt-4" type="submit">
                  Register
                </Button>
              </div>
              {loginError && <p className="text-red-500">{loginError}</p>}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
