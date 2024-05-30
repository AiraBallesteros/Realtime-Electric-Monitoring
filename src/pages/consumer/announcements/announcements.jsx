import Header from "@/components/header";
import NoDataFound from "@/components/no-data-found";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { FunnelIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Post from "@/components/post";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";  
import { db } from "/src/firebase/config";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";

function Announcements() {
  const [isDropdownOpen, setIsDropDownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateUntil, setDateUntil] = useState("");
  const [posts, setPosts] = useState([]);

  const location = useLocation();  
  const passedDate = location.state?.date;  

  useEffect(() => {
    let q;

    if (passedDate) {
      const exactDate = new Date(passedDate);
      exactDate.setHours(0, 0, 0, 0);
      const endDate = new Date(passedDate);
      endDate.setHours(23, 59, 59, 999);

      q = query(collection(db, "Announcements"), where("createdAt", ">=", exactDate), where("createdAt", "<=", endDate), orderBy("createdAt", "desc"));
    } else if (dateFrom && dateUntil) {
      const start = new Date(dateFrom);
      const end = new Date(dateUntil);
      end.setHours(23, 59, 59, 999); 
      q = query(collection(db, "Announcements"), where("createdAt", ">=", start), where("createdAt", "<=", end), orderBy("createdAt", "desc"));
    } else {
      q = query(collection(db, "Announcements"), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsArray);
    });

    return () => unsubscribe();
  }, [dateFrom, dateUntil, passedDate]);  

  const handleFilterReset = () => {
    setDateFrom("");
    setDateUntil("");
    setIsDropDownOpen(false); 
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const filteredPosts = posts.filter(post => {
      // Check if the post description contains the search query
      return post.description.toLowerCase().includes(search.toLowerCase());
    });
    setPosts(filteredPosts);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Header title="Announcements" userType="Consumer" />
      <div className="space-y-4">
        <Card className="mt-2 py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
            <Input
              onChange={(e) => {
                setSearch(e.target.value);
                // Reset posts array when search input is cleared
                if (e.target.value === "") {
                  setPosts(originalPosts); // Assuming originalPosts is the initial posts array
                }
              }}
              className="w-96"
              placeholder="Search"
            />
              <Button onClick={handleSearch}>Search</Button>
            </div>
            <div>
              <DropdownMenu open={isDropdownOpen}>
                <DropdownMenuTrigger
                  onClick={() => {
                    setIsDropDownOpen(!isDropdownOpen);
                  }}
                >
                  <FunnelIcon className="w-6 h-6" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <div className="flex justify-between items-center">
                      <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                      <button
                        onClick={() => {
                          setIsDropDownOpen(false);
                        }}
                        aria-label="Close filter dialog"
                        className="text-current bg-transparent border-none p-2" 
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col gap-1 items-end">
                    <div className="flex gap-2 items-center">
                      <Input
                        value={dateFrom}
                        onChange={(e) => {
                          setDateFrom(e.target.value);
                        }}
                        type="date" className="cursor-pointer"
                      />
                      <span>to</span>
                      <Input
                        value={dateUntil}
                        onChange={(e) => {
                          setDateUntil(e.target.value);
                        }}
                        type="date" className="cursor-pointer"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleFilterReset}>Reset Filter</Button>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
        {posts.length > 0 ? (
          posts.map((post) => <Post key={post.id} data={post} />)
        ) : (
          <NoDataFound />
        )}
      </div>
    </div>
  );
}

export default Announcements;
