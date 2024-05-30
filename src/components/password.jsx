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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { auth } from "../firebase/config";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

const formSchema = z.object({
  current_password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  new_password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  re_enter_password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

function Password() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values) {
    if (values.new_password !== values.re_enter_password) {
      console.error("New passwords do not match.");
      toast({
        title: "Error",
        description: "New Password does not match"
      });
      return;
    }
    
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(
      user.email, 
      values.current_password
    );
  
    // Reauthenticate user
    reauthenticateWithCredential(user, credential).then(() => {
      // User re-authenticated.
      updatePassword(user, values.new_password).then(() => {
        console.log("Password updated successfully!");
        // Update successful.
        form.reset({
          ...form.getValues(), // This maintains the other field values if there are any
          current_password: '',
          new_password: '',
          re_enter_password: ''
        });
        toast({
          title: "Updated",
          description: "Password updated successfully"
        });
      }).catch((error) => {
        // An error happened.
        console.error("Error updating password", error);
        toast({
          title: "Error",
          description: "Incorrect Current Password"
        });
      });
    }).catch((error) => {
      // An error happened during reauthentication.
      console.error("Error during reauthentication", error);
      toast({
        title: "Error",
        description: "Incorrect Current Password"
      });
    });
  }

  return (
    <div className="flex gap-8">
      <div className="w-full">
        <h4 className="mb-0 p-0">Update Password</h4>
        <p className="text-muted-foreground">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </div>
      <Card className=" w-full p-4">
        <div className="flex items-center w-full">
          <Form className="" {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2 w-full"
            >
              <FormField
                className=""
                control={form.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Current Password</FormLabel>
                    <FormControl className="">
                      <Input
                        className="w-full"
                        type="password"
                        placeholder="Enter current password"
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
                name="new_password"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>New Password</FormLabel>
                    <FormControl className="">
                      <Input
                        className="w-full"
                        type = "password"
                        placeholder="Enter your new password"
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
                name="re_enter_password"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Re-enter password</FormLabel>
                    <FormControl className="">
                      <Input
                        className="w-full"
                        type = "password"
                        placeholder="Re enter your password"
                        {...field}
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

export default Password;
