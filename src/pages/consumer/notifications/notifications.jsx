import { useEffect, useState } from "react";
import { db } from "/src/firebase/config";
import { collection, query, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";  

function Notifications() {
  const [notificationList, setNotificationList] = useState([]);
  const [user, setUser] = useState(null);  
  const navigate = useNavigate();
  const auth = getAuth();  

  useEffect(() => {
   
    const unsubscribeFromAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);  
    });

    const q = query(collection(db, "Announcements"));
    const unsubscribeFromDb = onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const date = data.createdAt?.toDate();
        const dateString = date ? date.toLocaleDateString("en-US") : 'No Date';
        return {
          originalId: doc.id,
          dateString,
          date,
          read: data.readBy?.includes(user?.uid) || false,
        };
      }).sort((a, b) => b.date - a.date);
      setNotificationList(notifications);
    });

    return () => {
      unsubscribeFromAuth();
      unsubscribeFromDb();
    };
  }, [user?.uid]);

  const markAsRead = async (notificationId) => {
    if (user) {
      const notificationRef = doc(db, "Announcements", notificationId);
      await updateDoc(notificationRef, {
        readBy: arrayUnion(user.uid)
      });
    }
  };

  const handleViewClick = async (notificationId) => {
    await markAsRead(notificationId);
    const notification = notificationList.find(n => n.originalId === notificationId);
    if (notification) {
      navigate('/announcements', { state: { date: notification.dateString } });
    }
  };

  const handleMarkAllAsRead = async () => {
    notificationList.forEach(async (notification) => {
      if (!notification.read) {
        await markAsRead(notification.originalId);
      }
    });
    setNotificationList(notificationList.map(notification => ({
      ...notification,
      read: true
    })));
  };

  return (
    <div className="px-4 py-6 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      <div className="flex justify-end mb-6">
        <button onClick={handleMarkAllAsRead} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-700 dark:focus:ring-indigo-500">
          Mark all as read
        </button>
      </div>
      <div className="space-y-4">
        <ul className="list-none">
          {notificationList.map((notification) => (
            <li key={notification.originalId}>
              <div className={`p-4 flex items-center gap-4 rounded-lg transition-shadow hover:shadow-lg ${!notification.read ? "bg-indigo-100 dark:bg-indigo-900 border-l-4 border-indigo-300 dark:border-yellow-500" : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"}`}>
                <div className="flex-shrink-0">
                  <img src="//www.casureco2.com.ph/assets/img/c2_logo.ico" alt="Avatar" className="h-12 w-12 rounded-full" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1 text-gray-800 dark:text-gray-200">{"Casureco II"}</p>
                  <time className="text-xs text-gray-600 dark:text-gray-400">{notification.dateString || 'No Date'}</time>
                </div>
                <div className="flex-auto text-sm">
                  <p className={`${!notification.read ? "text-indigo-800 dark:text-yellow-500" : "text-gray-800 dark:text-gray-300"}`}>{'Casureco has a New post!'}</p>
                </div>
                <div>
                  <button onClick={() => handleViewClick(notification.originalId)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-700 dark:focus:ring-indigo-500">
                    View
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}  

export default Notifications;