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
import { auth, db } from "@/firebase/config";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
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

const formSchema = z.object({
  email: z
    .string()
    .max(50, "Email must be at most 50 characters")
    .email("Email must be a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function Login() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const adminsRef = collection(db, "Admin");
        const q = query(adminsRef, where("email", "==", user.email));

        getDocs(q)
          .then(async (querySnapshot) => {
            if (!querySnapshot.empty) {
              // User is an admin, navigate to the admin dashboard
              navigate("/admin/consumers", { replace: true });
            } else {
              // Check if the email is in Admin collection
                const consumerRef = collection(db, "Consumers");
                const consumerQuery = query(consumerRef, where("email", "==", user.email));
                
                const consumerSnapshot = await getDocs(consumerQuery);
              if (!consumerSnapshot.empty) {
                setError(
                  "Account not Recognized"
                );
              } else {
              try {
                // Sign out the user before deletion
                await signOut(auth);
                // Delete the user's account
                await deleteUser(user);
                setError(
                  "Your account is not authorized and has been removed. Please contact support."
                );
              } catch (error) {
                console.error("Error removing unauthorized user:", error);
                setError(
                  "An error occurred while removing an unauthorized account."
                );
              }
            }
          }
          })
          .catch((err) => {
            setError("An error occurred while verifying admin status.");
            console.error(err);
          });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (values) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // Further admin check and redirection is handled by the useEffect hook
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        form.setError("email", { message: "Invalid username or password" });
        return;
      }
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
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Please login to your admin account to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleLogin)}
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
                  <NavLink className="flex items-center" to={"/"}>
                    <p className="text-xs text-gray-500">
                      Are you a consumer?
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
                <NavLink className="flex justify-center" to={"/admin/register"}>
                  <p className="text-xs text-gray-500">
                    Don{"'"}t have an account?
                      <span className="text-blue-500"> Register</span>
                  </p>
                </NavLink>
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
