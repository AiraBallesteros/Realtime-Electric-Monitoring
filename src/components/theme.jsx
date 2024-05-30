import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

function Theme() {
  const [theme, setTheme] = useState(localStorage.theme);

  const toggleTheme = () => {
    if (localStorage.theme === "dark") {
      localStorage.theme = "light";
      // set the tailwind theme to light
      document.documentElement.classList.remove("dark");
      setTheme("light");
    } else {
      localStorage.theme = "dark";
      // set the tailwind theme to dark
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
  };

  return (
    <div className="flex gap-8">
      <div className="w-full">
        <h4 className="mb-0 p-0">Theme</h4>
        <p className="text-muted-foreground">
          You can change theme either dark or light mode
        </p>
      </div>
      <Card className=" w-full p-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={theme === "dark"}
            onCheckedChange={toggleTheme}
            id="theme"
          />
          <Label htmlFor="airplane-mode">Dark Mode</Label>
        </div>
      </Card>
    </div>
  );
}

export default Theme;
