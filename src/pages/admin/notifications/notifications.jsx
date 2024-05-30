import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { announcementList } from "@/dummy.data";
import { useEffect, useState } from "react";
function Notifications() {
  const [notificationList, setNotificationList] = useState([]);

  useEffect(() => {
    setNotificationList(announcementList);
  }, []);

  const handleMarkAllAsRead = () => {};

  return (
    <div>
      <div className="flex justify-end -mb-4">
        <Button onClick={handleMarkAllAsRead} variant="ghost">
          Mark as all read
        </Button>
      </div>
      <div>
        <ul className="list-none">
          {notificationList.map((notification) => (
            <li key={notification.id}>
              <Card className="p-4 flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h5 className="font-bold">{notification.title}</h5>
                </div>
                <div className="flex gap-2 items-center">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {notification.posted_by.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-bold mb-0 pb-0">
                      {notification.posted_by}
                    </p>
                    <time className="text-xs">{notification.date}</time>
                  </div>
                </div>
                <div>
                  <p>{notification.description}</p>
                </div>
                <div>
                  <Button variant="ghost">View</Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Notifications;
