import { AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { XCircleIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import PropTypes from "prop-types";
import { formatDistanceToNow } from 'date-fns';

import { useState } from "react";
import { db, storage  } from "/src/firebase/config";
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from "@/components/ui/use-toast";

Post.propTypes = {
  data: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool,
};

function Post({ data, isAdmin = false }) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedDescription, setEditedDescription] = useState(data.description);
  const [originalDescription] = useState(data.description); // Keep the original description
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState(data.imageUrls || []);

  const formattedDate = formatDistanceToNow(new Date(data.createdAt.seconds * 1000), { addSuffix: true });

  const handleDelete = async () => {
    setIsAlertOpen(false);

    // Define deleteImages function inside handleDelete so that await can be used
    const deleteImages = async () => {
      if (data.imageUrls && data.imageUrls.length > 0) {
        const promises = data.imageUrls.map((imageUrl) => {
          const imageRef = ref(storage, imageUrl);
          return deleteObject(imageRef);
        });
        await Promise.all(promises); 
      }
    };

    try {
      await deleteImages();

      await deleteDoc(doc(db, "Announcements", data.id));
      toast({ title: "Deleted Post", description: "Post deleted successfully." });

    } catch (error) {
      console.error('Error during deletion:', error);
    }
  };
	
  const handleEdit = async () => {
    setEditMode(false);
    const postRef = doc(db, "Announcements", data.id);

    // Upload new images to Firebase Storage and get their URLs
    const uploadedImageUrls = await Promise.all(
      images.map(async (image) => {
        const imageRef = ref(storage, `images/${data.id}/${image.name}`);
        await uploadBytes(imageRef, image);
        return getDownloadURL(imageRef);
      })
    );

    try {
      // Update post with new description and image URLs
      await updateDoc(postRef, {
        description: editedDescription,
        imageUrls: [...imageUrls, ...uploadedImageUrls]
      });
      setImageUrls([...imageUrls, ...uploadedImageUrls]); // Update local state
      toast({ title: "Post Updated", description: "The post has been updated successfully." });
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeleteImage = async (imageUrl) => {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    const updatedImageUrls = imageUrls.filter(url => url !== imageUrl);
    setImageUrls(updatedImageUrls); // Update local state
    const postRef = doc(db, "Announcements", data.id);
    await updateDoc(postRef, { imageUrls: updatedImageUrls });
  };

  const handleCancelEdit = () => {
    setEditedDescription(originalDescription); // Reset to the original description
    setEditMode(false); // Exit edit mode
  };
  
  return (
    <Card key={data.id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex gap-2 items-center">
            <Avatar>
              <AvatarImage src="//www.casureco2.com.ph/assets/img/c2_logo.ico" alt="" />
              <AvatarFallback className="bg-primary text-white">
                {data.posted_by?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="font-medium text-sm">{'Casureco II'}</p>
              <time className="text-xs">{formattedDate || 'Loading date...'}</time>
            </div>
          </div>
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button><DotsVerticalIcon /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Action</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setEditMode(true)} className="flex gap-1 items-center cursor-pointer">
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsAlertOpen(true)} className="flex gap-1 items-center cursor-pointer">
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {editMode ? (
          <div>
            <textarea
              className="w-full border rounded p-2"
              value={editedDescription}
              rows={3}
              onChange={(e) => setEditedDescription(e.target.value)}
            />
            <div className="my-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="inline-block relative m-1">
                  <img src={url} alt={`Post image ${index}`} className="w-20 h-20 object-cover rounded" />
                  <button className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1" onClick={() => handleDeleteImage(url)}>
                  <XCircleIcon className="w-5 h-5 text-white bg-opacity-50" />

                  </button>
                </div>
              ))}
              <input
                type="file"
                multiple
                onChange={(e) => setImages([...e.target.files])}
                className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleEdit}>Save Changes</button>
              <button className="bg-gray-500 text-white px-3 py-1 rounded" onClick={handleCancelEdit}>Cancel</button>
            </div>
          </div>
        ) : (
          <pre className="whitespace-pre-line font-sans text-sm">{data.description}</pre>
        )}
        {!editMode && imageUrls.map((url, index) => (
          <img key={index} src={url} alt={`Post image ${index}`} className="w-full mt-2 rounded-lg" />
        ))}
      </CardContent>
      <CardFooter>
        <div className="flex justify-end items-center gap-1">
          <span className="text-sm">{data.views}</span>
        </div>
      </CardFooter>
     
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the post.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <button>Cancel</button>
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default Post;
