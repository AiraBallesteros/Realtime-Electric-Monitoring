import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '/src/firebase/config';
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types"; 

function Logout({ path }) {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        // If no user is logged in, redirect to the login page
        navigate(path);
      }
    });

    // Clean up the listener on component unmount
    return unsubscribe; 
  }, [navigate, path]);

 const handleLogout = async () => {
    try {
      await signOut(auth); // Log the user out
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };
  
  return (
    <div className="flex w-full justify-end py-2 ">
      <Button
        className="w-32 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </div>
  );
}


Logout.propTypes = {
  path: PropTypes.string.isRequired, 
};

export default Logout;
