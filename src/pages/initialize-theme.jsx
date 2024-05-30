import React from "react";

function InitializeTheme() {
  React.useEffect(() => {
    // check if there is a theme in local storage if there is check if dark
    // then set the theme to dark
    if (localStorage.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return <></>;
}

export default InitializeTheme;
