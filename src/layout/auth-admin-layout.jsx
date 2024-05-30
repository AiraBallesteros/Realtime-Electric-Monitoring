import Logo from "@/assets/images/powervue.png";
import { Card, CardHeader } from "@/components/ui/card";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import {
  BellIcon,
  Cog6ToothIcon,
  CogIcon,
  HomeIcon,
  MegaphoneIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Label } from "@radix-ui/react-label";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { auth, db } from "/src/firebase/config";

function AuthAuthLayout() {
  const [showSideNav, setShowSideNav] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const navRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        //add logic to navigate user if the role was consumer
        //if(user.role === "consumer")
        //navigate("/")
        fetchUserData(user.uid);
      } else {
        setUserName("");
        setUserEmail("");
         // redirect to login page if there is no user
        navigate("/");
      }
    });

    const handleOutsideClick = (event) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target) &&
        showSideNav
      ) {
        setShowSideNav((prev) => !prev);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      unsubscribeAuth();
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const fetchUserData = (uid) => {
    const usersRef = collection(db, "Admin");
    const q = query(usersRef, where("uid", "==", uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setUserName(userData.name);
        setUserEmail(userData.email);
      } else {
        console.log("No matching document found!");
      }
    });

    return unsubscribe;
  };

  return (
    <div className="bg-gray-100 dark:bg-card">
      <button
        onClick={() => setShowSideNav((prev) => !prev)}
        type="button"
        className="inline-flex items-center p-2 my-2 ms-3 text-sm bg-primary-foreground text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      >
        <span className="sr-only">Open sidebar</span>
        <HamburgerMenuIcon className="w-5 h-5" />
      </button>
      <div className="w-full min-h-screen gap-2 flex">
        <aside
          id="default-sidebar"
          className={cn(
            "fixed top-0 left-0 z-40 w-64 h-screen transition-transform sm:translate-x-0",
            showSideNav ? "translate-x" : "-translate-x-full"
          )}
          aria-label="Sidebar"
          ref={navRef}
        >
          <Card className="m-2 h-full flex flex-col justify-between overflow-y-auto">
            <CardHeader>
              <CardTitle>
                <img className="" src={Logo} alt="" />
              </CardTitle>
              <CardDescription className="text-xs text-center font-medium">
                Realtime Electric Monitoring System
              </CardDescription>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                <div>
                  <NavLink
                    className="flex py-1.5 gap-3 px-2 items-center"
                    to={"consumers"}
                  >
                    <UsersIcon className="w-6 h-6" />
                    <span className="font-semibold">Consumers</span>
                  </NavLink>
                </div>
                <div>
                  <NavLink
                    className="flex gap-3 py-1.5 px-2 items-center"
                    to={"dashboard"}
                  >
                    <HomeIcon className="w-6 h-6" />
                    <span className="font-semibold">Dashboard</span>
                  </NavLink>
                </div>

                <div>
                  <NavLink
                    className="flex gap-3 py-1.5 px-2 items-center"
                    to={"announcements"}
                  >
                    <MegaphoneIcon className="w-6 h-6" />
                    <span className="font-semibold">Announcements</span>
                  </NavLink>
                </div>
                <div>
                  <NavLink
                    className="flex py-1.5 gap-3 px-2 items-center"
                    to={"admins"}
                  >
                    <UserIcon className="w-6 h-6" />
                    <span className="font-semibold">Admins</span>
                  </NavLink>
                </div>
                <div>
                  <NavLink
                    className="flex py-1.5 gap-3 px-2 items-center"
                    to={"settings"}
                  >
                    <Cog6ToothIcon className="w-6 h-6" />
                    <span className="font-semibold">Settings</span>
                  </NavLink>
                </div>
                <div>
                  <NavLink
                    className="flex gap-3 px-2 py-1.5 items-center"
                    to={"configuration"}
                  >
                    <CogIcon className="w-6 h-6" />
                    <span className="font-semibold">Configuration</span>
                  </NavLink>
                </div>
                {/* <div>
                  <NavLink
                    className="flex gap-3 px-2 py-1.5 items-center"
                    to={"notifications"}
                  >
                    <BellIcon className="w-6 h-6" />
                    <span className="font-semibold">Notifications</span>
                  </NavLink>
                </div> */}
              </nav>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Avatar>
                <AvatarImage
                  src="//www.casureco2.com.ph/assets/img/c2_logo.ico"
                  alt=""
                />
                <Avatar className="bg-primary text-secondary flex justify-center items-center">
                  {userName ? userName[0].toUpperCase() : "A"}
                </Avatar>
              </Avatar>
              <div className="flex flex-col">
                <Label className="font-bold">{userName}</Label>
                <small className="font-light">{userEmail}</small>
              </div>
            </CardFooter>
          </Card>
        </aside>
        <div className="sm:ml-64 m-4 px-2 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthAuthLayout;