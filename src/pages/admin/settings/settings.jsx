import AboutUs from "@/components/about-us";
import Header from "@/components/header";
import Logout from "@/components/logout";
import Password from "@/components/password";
import Profile from "@/components/profile";
import Theme from "@/components/theme";

function Settings() {
  return (
    <div>
      <Header title="Settings" />
      <div className="mt-2 py-8 px-4 space-y-8">
        <Theme />
        <Profile />
        <Password />
        <AboutUs />
        <Logout path="/admin/login" />
      </div>
    </div>
  );
}

export default Settings;
