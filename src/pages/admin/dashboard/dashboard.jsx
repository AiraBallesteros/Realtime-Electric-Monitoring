import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { consumerData } from "@/dummy.data";
import { cn, currency, legend } from "@/lib/utils";
import {
  BoltIcon,
  EyeIcon,
  UserCircleIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import L from "leaflet";
import { renderToString } from "react-dom/server";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useState, useEffect } from 'react';
import { query, collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '/src/firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

function Dashboard() {
  const [consumer, setConsumer] = useState([]);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [voltageStats, setVoltageStats] = useState({
    functional: 0,
    undervoltage: 0,
    overvoltage: 0,
    noPower: 0
  });

  useEffect(() => {
    const consumersCollectionRef = collection(db, "Consumers");
    const unsubscribe = onSnapshot(consumersCollectionRef, (querySnapshot) => {
      const consumersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConsumer(consumersList);
      calculateVoltageStats(consumersList);
    });
    return () => unsubscribe();
  }, []);

  function calculateVoltageStats(consumers) {
    let stats = { functional: 0, undervoltage: 0, overvoltage: 0, noPower: 0 };
    consumers.forEach(c => {
      if (c.voltage === 0) {
        stats.noPower++;
      } else if (c.voltage >= 1 && c.voltage <= 207) {
        stats.undervoltage++;
      } else if (c.voltage >= 208 && c.voltage <= 252) {
        stats.functional++;
      } else if (c.voltage >= 253) {
        stats.overvoltage++;
      }
    });
    setVoltageStats({
      functional: Math.round(stats.functional / consumers.length * 100),
      undervoltage: Math.round(stats.undervoltage / consumers.length * 100),
      overvoltage: Math.round(stats.overvoltage / consumers.length * 100),
      noPower: Math.round(stats.noPower / consumers.length * 100)
    });
  }
  

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <SheetHeader>
            <SheetTitle>
              <div className="flex items-center gap-3 font-semibold text-lg p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white dark:text-gray-200 rounded-full shadow-md">
                <UserCircleIcon className="w-6 h-6 animate-bounce" />
                {selectedConsumer?.name}
              </div>
            </SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4 text-gray-800 dark:text-gray-200">
            <div className="flex gap-3 items-center">
              <UserIcon className="w-6 h-6 text-blue-500 dark:text-blue-300" />
              <h4 className="text-lg font-semibold">Profile Information</h4>
            </div>
            <Card className="p-6 space-y-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <p>Casureco No:</p>
                <p className="font-bold">{selectedConsumer?.casureco_no}</p>
              </div>
              <div className="flex items-center gap-3">
                <p>Device No:</p>
                <p className="font-bold">{selectedConsumer?.device_no}</p>
              </div>
              <div className="flex items-center gap-3">
                <p>Address:</p>
                <p className="font-bold">{selectedConsumer?.address}</p>
              </div>
              <div className="flex items-center gap-3">
                <p>Email:</p>
                <p className="font-bold">{selectedConsumer?.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <p>Contact No:</p>
                <p className="font-bold">{selectedConsumer?.contact_no}</p>
              </div>
            </Card>
            <div className="flex gap-3 items-center">
              <BoltIcon className="w-6 h-6 text-green-500 dark:text-green-300" />
              <h4 className="text-lg font-semibold">Reading</h4>
            </div>
            <Card className="p-6 space-y-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <p>Voltage:</p>
                <p className="font-bold">{selectedConsumer?.voltage} volts</p>
              </div>
              <div className="flex items-center gap-3">
                <p>Current:</p>
                <p className="font-bold">{selectedConsumer?.current} amps</p>
              </div>
              <div className="flex items-center gap-3">
                <p>kWh:</p>
                <p className="font-bold">{selectedConsumer?.kwh} kWh</p>
              </div>
            </Card>
            <div className="flex gap-3 items-center">
              <p className="text-red-500 dark:text-red-400 text-2xl">₱</p>
              <h4 className="text-lg font-semibold">Billing</h4>
            </div>
            <Card className="p-6 space-y-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <p>Monthly Bill:</p>
                <p className="font-bold">
                  {currency(selectedConsumer?.monthly_bill)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p>Previous Bill:</p>
                <p className="font-bold">
                  {currency(selectedConsumer?.previous_bill)}
                </p>
              </div>
            </Card>
          </div>
        </SheetContent>
      </Sheet>

      <div className="space-y-4">
      <div className="flex gap-2">
      <Card className="p-8 space-y-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow-lg transition duration-300 ease-in-out hover:shadow-xl">
        <div className="mt-4 flex flex-col gap-2 items-center"> 
           {/*<h1 className="mb-2">{consumer.length}</h1>*/}
           <h1 className="mb-2" style={{ fontSize: '4.5rem' }}>{consumer.length}</h1> 
            <div className="flex gap-2 items-center"> 
              <UsersIcon className="w-6 h-6" />
              <h4>Total Consumer</h4>
            </div>
           </div>
        </Card>
          <Card className="p-8 space-y-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow-lg transition duration-300 ease-in-out hover:shadow-xl">
              <h2 className="mb-5 text-3xl" style={{ marginTop: '23px' }}>Legend</h2>
              <div className="grid grid-cols-2 gap-1">
                  <div className="flex gap-2">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6 rounded-full p-0.5 bg-gray-500 dark:bg-gray-700 text-gray-100 dark:text-gray-300"
                      >
                          <path
                              fillRule="evenodd"
                              d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                              clipRule="evenodd"
                          />
                      </svg>
                      <span>No Power</span>
                  </div>
                  <div className="flex gap-2">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6 rounded-full p-0.5 bg-orange-500 dark:bg-orange-600 text-orange-100 dark:text-orange-200"
                      >
                          <path
                              fillRule="evenodd"
                              d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                              clipRule="evenodd"
                          />
                      </svg>
                      <span>Low Voltage</span>
                  </div>
                  <div className="flex gap-2">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6 rounded-full p-0.5 bg-green-500 dark:bg-green-600 text-green-100 dark:text-green-200"
                      >
                          <path
                              fillRule="evenodd"
                              d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                              clipRule="evenodd"
                          />
                      </svg>
                      <span>Functional</span>
                  </div>
                  <div className="flex gap-2">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6 rounded-full p-0.5 bg-red-500 dark:bg-red-600 text-red-100 dark:text-red-200"
                      >
                          <path
                              fillRule="evenodd"
                              d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                              clipRule="evenodd"
                          />
                      </svg>
                      <span>Over Voltage</span>
                  </div>
              </div>
          </Card>
          <Card className="p-8 space-y-4 flex-grow bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow-lg">
    <div className="flex items-center space-x-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 mr-2" />
            Voltage Alert Status
        </h2>
    </div>
    <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Functional Voltage</div>
            <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div className="bg-green-500 h-4 rounded-full" style={{ width: `${voltageStats.functional}%` }}></div>
                </div>
                <span className="text-green-600 dark:text-green-400 min-w-[40px] text-right">{voltageStats.functional}%</span>
            </div>
        </div>
        <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Undervoltage</div>
            <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div className="bg-orange-500 h-4 rounded-full" style={{ width: `${voltageStats.undervoltage}%` }}></div>
                </div>
                <span className="text-orange-600 dark:text-orange-400 min-w-[40px] text-right">{voltageStats.undervoltage}%</span>
            </div>
        </div>
        <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Overvoltage</div>
            <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div className="bg-red-500 h-4 rounded-full" style={{ width: `${voltageStats.overvoltage}%` }}></div>
                </div>
                <span className="text-red-600 dark:text-red-400 min-w-[40px] text-right">{voltageStats.overvoltage}%</span>
            </div>
        </div>
        <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">No Power</div>
            <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div className="bg-gray-500 h-4 rounded-full" style={{ width: `${voltageStats.noPower}%` }}></div>
                </div>
                <span className="text-gray-600 dark:text-gray-400 min-w-[40px] text-right">{voltageStats.noPower}%</span>
            </div>
        </div>
    </div>
</Card>

        </div>
        <div>
          <MapContainer
            className="z-0 w-full"
            center={[13.621775, 123.194824]}
            zoom={13}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {consumer.length > 0 &&
              consumer.map((item, index) => (
                <Marker
                  key={index}
                  icon={L.divIcon({
                    className: "custom-icon",
                    html: renderToString(
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={cn(
                          "w-6 h-6 rounded-full p-0.5",
                          legend(item.voltage)
                        )}
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ),
                  })}
                  position={[item.latitude, item.longitude]}
                >
                  <Popup className="bg-white dark:bg-white-800 p-0.5 rounded-lg shadow-sm border border-white dark:border-white">
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-600 mb-2">{item.name}</h5>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-600 text-sm mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className={cn(
                            "w-5 h-5 rounded-full p-0.5",
                            legend(item.voltage)
                          )}
                        >
                          <path
                            fillRule="evenodd"
                            d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{item.voltage} volts</span>
                      </div>
                      <div className="flex justify-center items-center h-full">
                        <button
                          className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500"
                          onClick={() => {
                            setSelectedConsumer(item);
                            setIsOpen(true);
                          }}
                        >
                          <EyeIcon className="w-4 h-4" />
                          View
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
