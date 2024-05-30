import React, { useEffect, useRef, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, query, orderBy, onSnapshot, addDoc, where } from "firebase/firestore";
import { storage, db } from "/src/firebase/config";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { CameraIcon, FunnelIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Post from "@/components/post";
import { v4 as uuidv4 } from 'uuid';

function Announcements() {
  const [isDropdownOpen, setIsDropDownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateUntil, setDateUntil] = useState(null);
  const [posts, setPosts] = useState([]);
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");
  const imageRef = useRef(null);

  useEffect(() => {
    let q;
    if (dateFrom && dateUntil) {
      const start = new Date(dateFrom);
      const end = new Date(dateUntil);
      end.setHours(23, 59, 59); 
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
  }, [dateFrom, dateUntil]);

  const handleFilterReset = () => {
    setDateFrom("");
    setDateUntil("");
    setIsDropDownOpen(false); // Optionally close the dropdown
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const filteredPosts = posts.filter(post => {
      // Check if the post description contains the search query
      return post.description.toLowerCase().includes(search.toLowerCase());
    });
    setPosts(filteredPosts);
  };
  

  const handleUploadImages = async (files) => {
    const uploadPromises = files.map(({ file }) => {
      const storageRef = ref(storage, `images/${Date.now()}-${file.name}`);
      return uploadBytesResumable(storageRef, file).then(snapshot => getDownloadURL(snapshot.ref));
    });
    return Promise.all(uploadPromises);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      let postData = { 
        createdAt: new Date(),
        postId: uuidv4(), // Adding a UUID as a unique identifier for each post
      };
      if (images.length > 0) {
        const imageUrls = await handleUploadImages(images);
        postData.imageUrls = imageUrls;
      }
      if (description.trim()) {
        postData.description = description;
      }
      if (!description.trim() && images.length === 0) {
        toast({ title: "No Content Detected", description: "Write or upload something." });
        return;
      }
      await addDoc(collection(db, "Announcements"), postData);
      toast({ title: "Posted", description: "Announcement successfully posted." });
      setImages([]);
      setDescription("");
      if (imageRef.current) {
        imageRef.current.value = null;
      }
    } catch (error) {
      console.error("Error creating post: ", error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({
        file, preview: URL.createObjectURL(file)
      }));
      setImages(filesArray);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Header title="Announcements" />
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
                  onClick={() => setIsDropDownOpen(!isDropdownOpen)}
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
                        type="date"
                      />
                      <span>to</span>
                      <Input
                        value={dateUntil}
                        onChange={(e) => {
                          setDateUntil(e.target.value);
                        }}
                        type="date"
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
        <Card>
          <Textarea
            id="description"
            value={description}
            rows={6}
            placeholder="Announce something by typing here..."
            className="bg-gray-50 dark:bg-card p-4"
            onChange={(e) => setDescription(e.target.value)}
          />

        <div className="px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="hover:bg-primary rounded-full hover:text-white p-2">
                <label htmlFor="upload" className="flex flex-col items-center gap-2 cursor-pointer">
                  <CameraIcon className="w-6 h-6" />
                  <input
                    id="upload"
                    ref={imageRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {images.map((image, index) => (
                <div key={index} className="relative inline-block">
                  <img src={image.preview} className="w-20 h-20 object-cover" alt="Preview"/>
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <Button onClick={handlePost}>Post</Button>
          </div>
        </Card>
        {posts.length > 0 ? (
          posts.map((post) => <Post key={post.id} data={post} isAdmin={true} />)
        ) : (
          <NoDataFound />
        )}
      </div>
    </div>
  );
}

export default Announcements;

