import { zodResolver } from "@hookform/resolvers/zod";
import {
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { z } from "zod";
import { auth, db } from "/src/firebase/config";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
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

import loginImage from "../../../assets/images/login.svg";

const formSchema = z.object({
  email: z
    .string()
    .min(2, "Email must be at least 2 characters")
    .max(50, "Email must be at most 50 characters")
    .email("Email must be a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function Login() {
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const consumersRef = collection(db, "Consumers");
        const q = query(consumersRef, where("email", "==", user.email));

        getDocs(q)
          .then(async (querySnapshot) => {
            if (!querySnapshot.empty) {
              navigate("/dashboard", { replace: true });
            } else {
              // Check if the email is in Admin collection
                const adminRef = collection(db, "Admin");
                const adminQuery = query(adminRef, where("email", "==", user.email));
                
                const adminSnapshot = await getDocs(adminQuery);
              if (!adminSnapshot.empty) {
                setLoginError(
                  "Account not Recognized"
                );
                return;
              } else {
              try {
                await signOut(auth);
                await deleteUser(user);
                setLoginError(
                  "Your account is not authorized and has been removed. Please contact support."
                );
              } catch (error) {
                console.error("Error removing unauthorized user:", error);
                setLoginError(
                  "An error occurred while removing an unauthorized account."
                );
              }
            }
          }
          })
          .catch((err) => {
            console.error(err);
            setLoginError("An error occurred while verifying admin status.");
          });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  async function onSubmit(values) {
    try {
      await form.handleSubmit(async () => {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        // The onAuthStateChanged listener will handle the post-login logic
      })();
    } catch (error) {
      console.error(error);
      setLoginError(error.message);
    }
  }

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
          <CardTitle>Consumer Login</CardTitle>
          <CardDescription>
            Please login to your account to continue using our services
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
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe@mail.com" {...field} />
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
                type={showPassword ? "text" : "password"} 
               placeholder="*********"
                {...field}
            />
            </FormControl>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} 
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
              <div className="space-y-1 pl-1">
                <NavLink className="flex items-center" to={"admin/login"}>
                  <p className="text-xs text-gray-500">
                    Are you an Admin?
                    <span className="text-blue-500"> Login</span>
                  </p>
                </NavLink>
              </div>

              <div className="flex justify-center"> 
              <Button className="mt-4 btn btn-primary btn-lg" style={{width: "200px", backgroundColor: "#4169E1", borderColor: "lightblue"}} type="submit">
                Login
              </Button>
            </div>
            <div>
              <NavLink className="flex justify-center" to={"/register"}>
                <p className="text-xs text-gray-500">
                    Don{"'"}t have an account?
                    <span className="text-blue-500"> Register</span>
                </p>
              </NavLink>
            </div>
              {loginError && <p className="text-red-500">{loginError}</p>}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
