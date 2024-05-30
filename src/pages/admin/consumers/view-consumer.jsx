import Header from "@/components/header";
import NoDataFound from "@/components/no-data-found";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { currency } from "@/lib/utils";
import { BanknotesIcon, PencilIcon } from "@heroicons/react/24/outline";
import { BoltIcon } from "@heroicons/react/24/solid";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from "/src/firebase/config";

function ViewConsumer() {
  const { id } = useParams();
  const [consumer, setConsumer] = useState(null);

  useEffect(() => {
    const fetchConsumer = async () => {
      const q = query(collection(db, 'Consumers'), where('device_no', '==', id));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setConsumer(data);
      } else {
        console.log('No configuration found');
        toast({
          title: 'Error',
          description: 'No configuration found',
          status: 'error',
        });
      }
    };

    fetchConsumer();
  }, [id]);

  return (
    <div>
      <Header title="View Consumer" />
      {consumer ? (
        <Card className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="w-20 h-20">
                  <AvatarImage className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" src={consumer?.profileImageUrl} />
                  <AvatarFallback className="text-4xl bg-primary dark:bg-primary-dark">
                    {consumer?.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{consumer.name}</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">{consumer.email}</p>
                </div>
              </div>
              <Link
                className="text-gray-600 dark:text-primary-300 hover:text-primary-300"
                to={`/admin/consumers/${consumer.device_no}/edit`}
              >
                <Badge variant="outline" className="flex gap-1 p-2">
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit</span>
                </Badge>
              </Link>
            </div>
            <div className="flex justify-between flex-wrap gap-6">
              <div className="flex flex-col flex-grow">
                <Label className="block mb-2">Device ID:</Label>
                <p className="text-gray-600 dark:text-gray-300 font-semibold">{consumer.device_no}</p>
              </div>
              <div className="flex flex-col flex-grow">
                <Label className="block mb-2">Casureco ID:</Label>
                <p className="text-gray-600 dark:text-gray-300 font-semibold">{consumer.casureco_no}</p>
              </div>
              <div className="flex flex-col flex-grow">
                <Label className="block mb-2">Address:</Label>
                <p className="text-gray-600 dark:text-gray-300 font-semibold">{consumer.address}</p>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Current Reading</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ReadingCard title="Voltage" value={`${consumer.voltage} Volts`} 
                  icon={<BoltIcon className="w-8 h-8 text-yellow-500" />} 
                />
                <ReadingCard title="Current" value={`${consumer.current} Amps`} 
                  icon={<BoltIcon className="w-8 h-8 text-yellow-500" />} 
                />
                <ReadingCard title="kWh" value={`${consumer.kwh} kWh`} 
                  icon={<BoltIcon className="w-8 h-8 text-yellow-500" />} 
                />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Bills</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BillCard title="Monthly Bill" value={currency(consumer.monthly_bill)} 
                  icon={<BanknotesIcon className="w-8 h-8 text-black dark:text-gray-100" />} 
                />
                <BillCard title="Previous Bill" value={currency(consumer.previous_bill)} 
                  icon={<BanknotesIcon className="w-8 h-8 text-black dark:text-gray-100" />} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <NoDataFound />
      )}
    </div>
  );
}

function ReadingCard({ title, value, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{value}</p>
        </div>
        <div className="text-primary-foreground">{icon}</div>
      </div>
    </div>
  );
}

function BillCard({ title, value, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{value}</p>
        </div>
        <div className="text-primary-foreground">{icon}</div>
      </div>
    </div>
  );
}

export default ViewConsumer;
