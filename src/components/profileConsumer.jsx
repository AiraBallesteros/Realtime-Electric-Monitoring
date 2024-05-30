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
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { auth, db, storage } from "../firebase/config";
import { XCircleIcon } from "@heroicons/react/24/outline";

const formSchema = z.object({
  device_no: z.string(),
  casureco_no: z.string(),
  first_name: z.string(),
  middle_name: z.string(),
  last_name: z.string(),
  address: z.string(),
  name: z.string(),
  contact_no: z.string(),
  email: z.string(),
});

function Profile() {
  const [userDeviceId, setUserDeviceID] = useState("");
  const [userCasurecoNo, setUserCasurecoNo] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userMiddleName, setUserMiddleName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userContactNo, setUserContactNo] = useState("");
  const [userUid, setUserUid] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadTask, setUploadTask] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(
          collection(db, "Consumers"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setUserName(docData.name);
          setUserDeviceID(docData.device_no);
          setUserCasurecoNo(docData.casureco_no);
          setUserFirstName(docData.first_name);
          setUserMiddleName(docData.middle_name);
          setUserLastName(docData.last_name);
          setUserAddress(docData.address);
          setUserEmail(docData.email);
          setUserUid(docData.uid);
          setUserContactNo(docData.contact_no);
          setAvatarUrl(docData.profileImageUrl || "https://avatar.iran.liara.run/username?username=Default");
        }
      }
    });
    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const storageRef = ref(storage, `consumer/${userUid}/${file.name}`);
      const uploadTaskInstance = uploadBytesResumable(storageRef, file);
      setUploadTask(uploadTaskInstance);

      uploadTaskInstance.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          toast({ title: "Upload failed", description: error.message });
        },
        () => {
          getDownloadURL(uploadTaskInstance.snapshot.ref).then((downloadURL) => {
            setAvatarUrl(downloadURL);
            updateProfileImageUrl(downloadURL); 
          });
        }
      );
    }
  };

  const removeAvatar = () => {
    setAvatarUrl("https://avatar.iran.liara.run/username?username=Default"); 
    updateProfileImageUrl(''); 
  };

  const updateProfileImageUrl = async (url) => {
    const q = query(collection(db, "Consumers"), where("uid", "==", userUid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, { profileImageUrl: url });
      toast({ title: "Profile Image Updated", description: "The profile image has been updated successfully." });
    }
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      device_no: userDeviceId,
      casureco_no: userCasurecoNo,
      first_name: userFirstName,
      middle_name: userMiddleName,
      last_name: userLastName,
      address: userAddress,
      name: userName,
      email: userEmail,
      contact_no: userContactNo,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values) {
    const adminRef = collection(db, "Consumers");
    const q = query(adminRef, where("uid", "==", userUid));
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref; 

        await updateDoc(docRef, {
          device_no: values.device_no || userDeviceId,
          casureco_no: values.casureco_no || userCasurecoNo,
          first_name: values.first_name || userFirstName,
          middle_name: values.middle_name || userMiddleName,
          last_name: values.last_name || userLastName,
          name: `${values.first_name || userFirstName} ${
            values.middle_name[0] || userMiddleName[0]
          }. ${values.last_name || userLastName} `,
          address: values.address || userAddress,
          contact_no: values.contact_no || userContactNo,
          email: values.email || userEmail,
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
            <div className="flex gap-4 items-end">
              <div className="relative">
              <div className="avatar-wrapper">
                <img src={avatarUrl} className="h-16 w-16 rounded-full border-2 border-gray" alt="Profile" />
                {avatarUrl && (
                  <div className="absolute right-0 top-0  bg-red-500 text-white rounded-full p-1">
                    <XCircleIcon className="w-3.5 h-3.5 text-white bg-opacity-50 cursor-pointer" 
                      onClick={removeAvatar}
                    />
                  </div>
                )}
                </div>
              </div>
              <div className="grid items-center gap-1.5">
                <Input id="avatar" onChange={handleFileChange} type="file" accept="image/*" className="cursor-pointer" />
              </div>
            </div>
              <FormField
                className=""
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Device ID</FormLabel>
                    <FormControl className="">
                      <Input
                        className="w-full"
                        placeholder={userDeviceId}
                        {...field}
                        style={{ opacity: 1 }}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                className=""
                control={form.control}
                name="casureco_no"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Casureco Account No.</FormLabel>
                    <FormControl className="">
                      <Input
                        className="w-full"
                        placeholder={userCasurecoNo}
                        {...field}
                        style={{ opacity: 1 }}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                className=""
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>First Name</FormLabel>
                    <FormControl className="">
                      <Input
                        className="w-full"
                        placeholder={userFirstName}
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
                name="middle_name"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl className="">
                      <Input
                        className="w-full"
                        placeholder={userMiddleName}
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
                name="last_name"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl className="">
                      <Input
                        className="w-full"
                        placeholder={userLastName}
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
                name="address"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Address</FormLabel>
                    <FormControl className="">
                      <Input
                        className="w-full"
                        placeholder={userAddress}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Additional field for Employee Contact Number */}
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
                        style={{ opacity: 1 }}
                        {...field}
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
