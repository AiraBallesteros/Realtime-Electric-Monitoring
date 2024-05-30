import { Gauge } from "@/components/gauge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currency } from "@/lib/utils";
import { faker } from "@faker-js/faker";
import { BoltIcon, BanknotesIcon, FlagIcon } from "@heroicons/react/24/outline";
import { FaBolt } from 'react-icons/fa';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "@/components/ui/use-toast";
import { db, auth } from "/src/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  doc,
  where,
  onSnapshot,
  updateDoc,
  getDoc,
  setDoc
} from "firebase/firestore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("monthly");
  const [labels, setLabels] = useState([]);
  const [targetMonthlyBill, setTargetMonthlyBill] = useState("");
  const [targetConsumption, setConsumption] = useState("");
  const [isEditingMonthlyBill, setIsEditingMonthlyBill] = useState(false);
  const [isEditingConsumption, setIsEditingConsumption] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false); 
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [continuousKwH, setContinuousKwH] = useState("");

  const [devEUI, setDevEUI] = useState("");
  const [userKwhConsumption, setUserKwhConsumption] = useState("");
  const [userVoltage, setUserVoltage] = useState("");
  const [userCurrent, setUserCurrent] = useState("");
  const [userCurrentBill, setUserCurrentBill] = useState("");
  const [userPrevBill, setUserPrevBill] = useState("");
  const [kwhRate, setKwh] = useState("");
  const [userTargetMonthlyBill, setUserTargetMonthlyBill] = useState("");
  const [userTargetKwhConsumption, setUserTargetKwhConsumption] = useState("");
  const [percentageMessage, setPercentageMessage] = useState('');

  //For kwh consumption (continuous)
  const [usageJanuary, setUsageJanuary] = useState("");
  const [usageFebruary, setUsageFebruary] = useState("");
  const [usageMarch, setUsageMarch] = useState("");
  const [usageApril, setUsageApril] = useState("")
  const [usageMay, setUsageMay] = useState("");
  const [usageJune, setUsageJune] = useState("")
  const [usageJuly, setUsageJuly] = useState("")
  const [usageAugust, setUsageAugust] = useState("")
  const [usageSeptember, setUsageSeptember] = useState("")
  const [usageOctober, setUsageOctober] = useState("")
  const [usageNovember, setUsageNovember] = useState("")
  const [usageDecember, setUsageDecember] = useState("")
  //For Monthly Bill(continuous)
  const [usageMonthlyJanuary, setUsageMonthlyJanuary] = useState("");
  const [usageMonthlyFebruary, setUsageMonthlyFebruary] = useState("");
  const [usageMonthlyMarch, setUsageMonthlyMarch] = useState("");
  const [usageMonthlyApril, setUsageMonthlyApril] = useState("");
  const [usageMonthlyMay, setUsageMonthlyMay] = useState("");
  const [usageMonthlyJune, setUsageMonthlyJune] = useState("");
  const [usageMonthlyJuly, setUsageMonthlyJuly] = useState("");
  const [usageMonthlyAugust, setUsageMonthlyAugust] = useState("");
  const [usageMonthlySeptember, setUsageMonthlySeptember] = useState("");
  const [usageMonthlyOctober, setUsageMonthlyOctober] = useState("");
  const [usageMonthlyNovember, setUsageMonthlyNovember] = useState("");
  const [usageMonthlyDecember, setUsageMonthlyDecember] = useState("");
  //Computation for KWH consumption per month
  const januaryKwH = (usageJanuary - usageDecember).toFixed(3);
  const februaryKwH = (usageFebruary - usageJanuary).toFixed(3);
  const marchKwH = (usageMarch - usageFebruary).toFixed(3);
  const aprilKwH = (usageApril - usageMarch).toFixed(3);
  const mayKwH = (usageMay - usageApril).toFixed(3);
  const juneKwH = (usageJune - usageMay).toFixed(3);
  const julyKwH = (usageJuly - usageJune).toFixed(3);
  const augustKwH = (usageAugust - usageJuly).toFixed(3);
  const septemberKwH = (usageSeptember - usageAugust).toFixed(3);
  const octoberKwH = (usageOctober - usageSeptember).toFixed(3);
  const novemberKwH = (usageNovember - usageOctober).toFixed(3);
  const decemberKwH = (usageDecember - usageNovember).toFixed(3);
  
  //Computation to get current monthly Usage
  const januaryBill = usageMonthlyJanuary - usageMonthlyDecember; 
  const februaryBill = usageMonthlyFebruary - usageMonthlyJanuary; 
  const marchBill = usageMonthlyMarch - usageMonthlyFebruary; 
  const aprilBill = usageMonthlyApril - usageMonthlyMarch; 
  const mayBill = usageMonthlyMay - usageMonthlyApril; 
  const juneBill = usageMonthlyJune - usageMonthlyMay; 
  const julyBill = usageMonthlyJuly - usageMonthlyJune; 
  const augustBill = usageMonthlyAugust - usageMonthlyJuly; 
  const septemberBill = usageMonthlySeptember - usageMonthlyAugust; 
  const octoberBill = usageMonthlyOctober - usageMonthlySeptember; 
  const novemberBill = usageMonthlyNovember - usageMonthlyOctober; 
  const decemberBill = usageMonthlyDecember - usageMonthlyNovember; 
  //FetchKwHConsumption
  const fetchKwhDataForMonth = (deviceNo, month, setter) => {
    const kwhDocRef = doc(db, `/deviceMonthlyData/${deviceNo}/${month}/KwH`);
    onSnapshot(kwhDocRef, (kwhDocSnap) => {
        if (kwhDocSnap.exists()) {
            // If the document exists, use the existing data
            setter(kwhDocSnap.data().Positive_Active_Energy_Total_1);
        } else {
            // If the document does not exist, handle the creation process
            console.log(`No kWh data found for ${month} for device ${deviceNo}, creating new entry.`);
            setDoc(kwhDocRef, { Positive_Active_Energy_Total_1: 0 }, { merge: true })
                .then(() => setter(0))
                .catch(error => console.error(`Error creating kWh entry for ${month}:`, error));
        }
    }, (error) => {
        console.error(`Error subscribing to kWh data for ${month}:`, error);
    });
};

  // Single useEffect to handle user auth changes and data fetching
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch the consumer's device number first
        getDocs(query(collection(db, "Consumers"), where("uid", "==", user.uid))).then(querySnapshot => {
          if (!querySnapshot.empty) {
            const userDeviceNo = querySnapshot.docs[0].data().device_no;
            // Fetch kWh data for each month using the device number
            fetchKwhDataForMonth(userDeviceNo, 'January', setUsageJanuary);
            fetchKwhDataForMonth(userDeviceNo, 'February', setUsageFebruary);
            fetchKwhDataForMonth(userDeviceNo, 'March', setUsageMarch);
            fetchKwhDataForMonth(userDeviceNo, 'April', setUsageApril);
            fetchKwhDataForMonth(userDeviceNo, "May", setUsageMay);
            fetchKwhDataForMonth(userDeviceNo, "June", setUsageJune);
          } else {
            console.log('Consumer data not found for the logged-in user.');
          }
        }).catch(error => {
          console.error('Error fetching consumer device number:', error);
        });
      } else {
        console.log('User is not logged in.');
      }
    });

    // Clean-up function
    return () => unsubscribeAuth();
  }, []);

  //FetchMonthlyConsumption
  const fetchMonthlyConsumption = (deviceNo, month, setter) => {
    const kwhDocRef = doc(db, `/deviceMonthlyData/${deviceNo}/${month}/KwH`);
    onSnapshot(kwhDocRef, (kwhDocSnap) => {
        if (kwhDocSnap.exists()) {
            // If the document exists, use the existing data
            setter(kwhDocSnap.data().current_bill);
        } else {
            // If the document does not exist, create it and set the initial value
            console.log(`No kWh data found for ${month} for device ${deviceNo}, creating new entry.`);
            setDoc(kwhDocRef, { current_bill: 0 }, { merge: true })
                .then(() => setter(0))
                .catch(error => console.error(`Error creating kWh data for ${month}:`, error));
        }
    }, (error) => {
        console.error(`Error subscribing to kWh data for ${month}:`, error);
    });
};

  // Single useEffect to handle user auth changes and data fetching
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch the consumer's device number first
        getDocs(query(collection(db, "Consumers"), where("uid", "==", user.uid))).then(querySnapshot => {
          if (!querySnapshot.empty) {
            const userDeviceNo = querySnapshot.docs[0].data().device_no;
            // Fetch kWh data for each month using the device number
              fetchMonthlyConsumption(userDeviceNo, 'January', setUsageMonthlyJanuary);
              fetchMonthlyConsumption(userDeviceNo, 'February', setUsageMonthlyFebruary);
              fetchMonthlyConsumption(userDeviceNo, 'March', setUsageMonthlyMarch);
              fetchMonthlyConsumption(userDeviceNo, 'April', setUsageMonthlyApril);
              fetchMonthlyConsumption(userDeviceNo, "May", setUsageMonthlyMay);
              fetchMonthlyConsumption(userDeviceNo, "June", setUsageMonthlyJune);
          } else {
            console.log('Consumer data not found for the logged-in user.');
          }
        }).catch(error => {
          console.error('Error fetching consumer device number:', error);
        });
      } else {
        console.log('User is not logged in.');
      }
    });

    // Clean-up function
    return () => unsubscribeAuth();
  }, []);
  

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        getDocs(query(collection(db, "Consumers"), where("uid", "==", user.uid))).then(querySnapshot => {
          if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            const presentMonth = new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore", month: "numeric" });
            const updateData = async (kwh, previous_bill, monthly_bill) => {
              try {
                await updateDoc(docRef, {kwh, previous_bill, monthly_bill });
                // console.log(`Updated usage for ${new Date().toLocaleString('default', { month: 'long' })}.`);
              } catch (error) {
                console.error('Failed to update usage:', error);
              }
            };
            if (presentMonth == 1) {
              updateData(januaryKwH ,decemberBill, januaryBill);
            }
            else if (presentMonth == 2) {
              updateData(februaryKwH ,januaryBill, februaryBill);
            }
            else if (presentMonth == 3) {
              updateData(marchKwH ,februaryBill, marchBill);
            }
            else if (presentMonth == 4) {
              updateData(aprilKwH ,marchBill, aprilBill);
            } 
            else if (presentMonth == 5) {
              updateData(mayKwH, aprilBill, mayBill);
            } 
            else if (presentMonth == 6) {
              updateData(juneKwH, mayBill, juneBill);
            } 
            else if (presentMonth == 7) {
              updateData(julyKwH, juneBill, julyBill);
            } 
            else if (presentMonth == 8) {
              updateData(augustKwH, julyBill, augustBill);
            } 
            else if (presentMonth == 9) {
              updateData(septemberKwH, julyBill, septemberBill);
            } 
            else if (presentMonth == 10) {
              updateData(octoberKwH, septemberBill, octoberBill);
            } 
            else if (presentMonth == 11) {
              updateData(novemberKwH, octoberBill, novemberBill);
            } 
            else if (presentMonth == 12) {
              updateData(decemberKwH, novemberBill, decemberBill);
            } 
          } else {
            console.log('Consumer data not found for the logged-in user.');
          }
        }).catch(error => {
          console.error('Error fetching consumer device number:', error);
        });
      } else {
        console.log('User is not logged in.');
      }
    });

    return () => unsubscribeAuth();
  }, [januaryBill, februaryBill, marchBill, aprilBill,
      mayBill, juneBill, julyBill, augustBill, septemberBill,
      octoberBill, novemberBill, decemberBill]);

  useEffect(() => {
    const configCollection = collection(db, "Configurations");
    const unsubscribe = onSnapshot(configCollection, (snapshot) => {
      if (!snapshot.empty) {
        const configData = snapshot.docs[0].data(); 
        setKwh(configData.kwh); 
      } else {
        console.log("No configurations found!");
      }
    }, (error) => {
      console.error("Error fetching configurations:", error);
    });

    return () => unsubscribe(); 
  }, []);

  //Fetch Continuous Data for KwH consumption
  const fetchContinuousData = (devEUI) => {
    const kwhDocRef = doc(db, `/deviceContinuousData/${devEUI}/continuousData/KwH`);
    onSnapshot(kwhDocRef, (kwhDocSnap) => {
        if (kwhDocSnap.exists()) {
            // If the document exists, use the existing data
            setContinuousKwH(kwhDocSnap.data().Positive_Active_Energy_Total_1);
        } else {
            // If the document does not exist, handle appropriately
            console.log(`No KwH Hour data found`);
        }
    }, (error) => {
        console.error(`Error fetching kWh data:`, error);
    });
};
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch the consumer's device number first
        getDocs(query(collection(db, "Consumers"), where("uid", "==", user.uid))).then(querySnapshot => {
          if (!querySnapshot.empty) {
            const devEUI = querySnapshot.docs[0].data().device_no;
            // Fetch kWh data for each month using the device number
            fetchContinuousData(devEUI);
          } else {
            console.log('Consumer data not found for the logged-in user.');
          }
        }).catch(error => {
          console.error('Error fetching consumer device number:', error);
        });
      } else {
        console.log('User is not logged in.');
      }
    });

    // Clean-up function
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const consumerQuery = query(collection(db, "Consumers"), where("uid", "==", user.uid));
        const unsubscribe = onSnapshot(consumerQuery, (snapshot) => {
          if (!snapshot.empty) {
            const docData = snapshot.docs[0].data();
            setDevEUI(docData.device_no)
            setUserKwhConsumption(docData.kwh);
            setUserVoltage(docData.voltage);
            setUserCurrent(docData.current);
            setUserCurrentBill(docData.monthly_bill);
            setUserPrevBill(docData.previous_bill);
            setUserTargetMonthlyBill(docData.target_monthly_bill);
            setUserTargetKwhConsumption(docData.target_kwh_Consumption);
            
            const percentage = parseFloat((docData.monthly_bill / docData.target_monthly_bill) * 100).toFixed(2);
            if (percentage >= 50 && percentage < 75) {
              setPercentageMessage(`You have reached ${percentage}% of your target monthly bill.`);
            } else if (percentage >= 75 && percentage < 100) {
              setPercentageMessage(`You have reached ${percentage}% of your target monthly consumption.`);
            } else if (percentage >= 100) {
              setPercentageMessage(`You have exceeded your target monthly bill.`);
            } else {
              setPercentageMessage('');
            }
          } else {
            console.log("No consumer data available");
          }
        }, (error) => {
          console.error("Error fetching consumer data:", error);
        });
        return unsubscribe; 
      }
    });
    return () => {
      unsubscribeAuth(); 
    };
  }, []);


  useEffect(() => {
    switch (selectedTimePeriod) {
      case "monthly":
        setLabels([
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ]);
        break;
      case "daily":
        if (selectedMonth !== null) {
          const daysInMonth = new Date(2024, selectedMonth + 1, 0).getDate();
          setLabels(Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()));
        } else {
          setLabels([]);
        }
        break;
        case "weekly":
          setShowMonthDropdown(true);
          if (selectedMonth !== null) {
            const weeksInMonth = getWeeksInMonth(selectedMonth);
            setLabels(Array.from({ length: weeksInMonth }, (_, i) => `Week ${i + 1}`));
          } else {
            setLabels([]);
          }
          break;
        default:
          break;   
      }
    }, [selectedTimePeriod, selectedMonth]);

  const getWeeksInMonth = (month) => {
    const year = 2024; 
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstWeek = firstDay.getDay();
    const lastWeek = lastDay.getDay();
    const totalWeeks = Math.ceil((daysInMonth + firstWeek) / 7);
    return totalWeeks;
  };

  const handleMonthSelection = (month) => {
    setSelectedMonth(month);
  };

  const options = {
    responsive: true,
    tension: 0.3,
    scales: {
      x: {
        grid: {
          display: false, 
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Bills Chart",
      },
    },
  };

  let currentUser = null; // Hold the reference to the current user globally or in a broader scope

// Auth state listener to keep track of the current user
const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
  if (user) {
    // Set the currentUser to the authenticated user
    currentUser = user;
  } else {
    // Reset currentUser when no user is logged in
    currentUser = null;
  }
});

const acceptNewMonthlyBill = async () => {
  if (!currentUser) {
    console.log("No user logged in!");
    return;
  }

  // Query to find the user document by UID
  const consumerQuery = query(collection(db, "Consumers"), where("uid", "==", currentUser.uid));

  try {
    const querySnapshot = await getDocs(consumerQuery);
    if (querySnapshot.empty) {
      console.log("No matching documents found for user!");
      return;
    }
    // One document will match the given UID
    const userDoc = querySnapshot.docs[0];

    // Update the targetMonthlyBill field in the found document
    await updateDoc(userDoc.ref, {
      target_monthly_bill: targetMonthlyBill,
    });

    toast({
      title: "Updated",
      description: "Target Monthly bill successfully set!",
    });
  } catch (error) {
    console.error("Error updating monthly bill:", error);
  }

  // Close the editing mode
  setIsEditingMonthlyBill(false);
};

// Make sure to clean up the listener when the component unmounts or when appropriate
useEffect(() => {
  return () => unsubscribeAuth(); // This will unsubscribe when the component unmounts
}, []);

  const rejectNewMonthlyBill = () => {
    // Reset logic here if needed
    setIsEditingMonthlyBill(false);
  };

  // Accept and reject editing functions for targetConsumption
  const acceptNewConsumption = async () => {
    if (!currentUser) {
      console.log("No user logged in!");
      return;
    }
  
    // Query to find the user document by UID
    const consumerQuery = query(collection(db, "Consumers"), where("uid", "==", currentUser.uid));
  
    try {
      const querySnapshot = await getDocs(consumerQuery);
      if (querySnapshot.empty) {
        console.log("No matching documents found for user!");
        return;
      }
      // One document will match the given UID
      const userDoc = querySnapshot.docs[0];
  
      // Update the targetMonthlyBill field in the found document
      await updateDoc(userDoc.ref, {
        target_kwh_Consumption: targetConsumption,
      });
      toast({
        title: "Updated",
        description: "Target kWh consumption successfully set!",
      });
    } catch (error) {
      console.error("Error updating monthly bill:", error);
    }
    setIsEditingConsumption(false);
  };
  // Make sure to clean up the listener when the component unmounts or when appropriate
useEffect(() => {
  return () => unsubscribeAuth(); // This will unsubscribe when the component unmounts
}, []);

  const rejectNewConsumption = () => {
    // Reset logic here if needed
    setIsEditingConsumption(false);
  };

  const monthlyBill = [
    januaryBill > 0 ? januaryBill : 0,
    februaryBill > 0 ? februaryBill : 0,
    marchBill > 0 ? marchBill : 0,
    aprilBill > 0 ? aprilBill : 0,
    mayBill > 0 ? mayBill : 0,
    juneBill > 0 ? juneBill : 0
  ];

  const data = {
    labels ,
    datasets: [
      {
        label: "Bill PHP",
        data: monthlyBill, // Use the predefined data here
        borderColor: "rgb(37, 99, 235)",
        backgroundColor: "rgb(37, 99, 235)",
      },
    ],
  };

  const getVoltageStatus = (voltage) => {
    if (voltage >= 208 && voltage <= 252) {
      return { message: 'Functional', color: 'bg-green-500 text-white' };
    } else if (voltage <= 207 && voltage>= 1) {
      return { message: 'Undervoltage', color: 'bg-orange-500 text-white' };
    } else if (voltage >= 253) {
      return { message: 'Overvoltage', color: 'bg-red-500 text-white' };
    } else {
      return { message: 'Zero', color: 'bg-gray-500 text-white' };
    }
    return { message: 'Check Voltage', color: 'bg-gray-500 text-white' }; 
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="grid lg:grid-cols-4 grid-cols-1 lg:gap-8 gap-4">
        <Card className="p-8 space-y-2">
          <h1>{userKwhConsumption} </h1>
          <div className="flex gap-2 items-center">
            <FaBolt className="w-6 h-6 text-yellow-500" />
            <span className="text-xs">Current Consumption</span>
          </div>
        </Card>
        
        <Card className="p-8 space-y-2">
          <h1>{currency(userCurrentBill)}</h1>
          <div className="flex gap-2 items-center">
            <BanknotesIcon className="w-8 h-8 text-green" />
            <span className="text-xs">Current Bill</span>
          </div>
        </Card>
        <Card className="p-8 space-y-2">
          <h1>{currency(userPrevBill)}</h1>
          <div className="flex gap-2 items-center">
            <BanknotesIcon className="w-8 h-8 text-green" />
            <span className="text-xs">Previous Bill</span>
          </div>
        </Card>
        <Card className="p-8 space-y-2">
          <h1>
            {parseFloat(continuousKwH).toFixed(2)}
          </h1>
          <div className="flex gap-2 items-center">
            <BoltIcon className="w-8 h-8" />
            <span className="text-xs">Total kWh consumption</span>
          </div>
        </Card>
      </div>
      <div>
      <div className="max-w-7xl mx-auto space-y-4">
      <div>
        <Card className="p-8 ">
          <div className="flex space-x-4">
            <Select
              value={selectedTimePeriod}
              onValueChange={(value) => {
                setSelectedTimePeriod(value);
                if (value === "daily") {
                  setShowMonthDropdown(true);
                } else {
                  setShowMonthDropdown(false);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a time period" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem> */}
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            {showMonthDropdown && (
              <Select
                onValueChange={handleMonthSelection}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a month" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(12).keys()].map((month) => (
                    <SelectItem key={month} value={month}>
                      {new Date(2024, month, 1).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Bar
            className="max-h-[400px] h-full"
            options={options}
            data={data}
          />
        </Card>
      </div>
    </div>
      </div>
      <div className="grid lg:grid-cols-4 grid-cols-1 lg:gap-2 gap-4">
        <Card className="p-8">
          <div className="flex items-center justify-center w-full">
            <Gauge value={userVoltage} min={0} max={250} label="Voltage" units="" />
          </div>
          <div className="text-center space-y-0.5">
            <div className="text-center text-sm">Realtime Voltage Meter</div>
            <p className="text-xs w-full">
              Your Voltage is{" "}
              <span className={`px-0.5 py-0.5 rounded-lg ${getVoltageStatus(userVoltage).color}`}>
                {getVoltageStatus(userVoltage).message}
              </span>
            </p>
          </div>
        </Card>
        <Card className="p-8">
          <div className="flex items-center justify-center w-full">
            <Gauge value={userCurrent} min={0} max={30} label="Amperes" units="" />
          </div>
          <div className="text-center space-y-0.5">
            <div className="text-center text-sm">Your Realtime Amp Meter</div>
          </div>
        </Card>
        <Card className="p-8  gap-4 flex flex-col items-center justify-center">
          <h1 className="text-7xl">
            {currency(kwhRate)}
            <span className="text-sm font-normal">/kWh</span>
          </h1>
          <div className="flex gap-2 items-center">
            <FaBolt className="w-8 h-8 text-yellow-500" />
            <p className="text-sm w-full">kWh Rate of Casureco II</p>
          </div>
        </Card>
        {/* Card for Target Monthly Bill with buttons underneath */}
        <Card className="p-8 gap-4 flex flex-col items-center justify-center">
          <h1 className="text-4xl">
            {currency(userTargetMonthlyBill)}
            <hr className="border rounded-full mt-1" />
          </h1>
          <div className="flex flex-col gap-2 items-center w-full">
            <input
              type="number"
              placeholder="Set Target Monthly Bill"
              onFocus={() => setIsEditingMonthlyBill(true)}
              onChange={(e) => setTargetMonthlyBill(parseFloat(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-center"
            />
            {isEditingMonthlyBill && (
              <div className="flex justify-center gap-2">
                <button onClick={acceptNewMonthlyBill}>
                  <CheckIcon className="w-6 h-6 text-green-600" />
                </button>
                <button onClick={rejectNewMonthlyBill}>
                  <XMarkIcon className="w-6 h-6 text-red-600" />
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
          <FlagIcon className="w-6 h-6 text-green-600" />
          <p className="text-sm w-full text-center">Target Monthly Bill</p>
          </div>
          {percentageMessage && (
            <div className="mt-2 text-center text-sm font-medium text-red-600">
              {percentageMessage}
            </div>
          )}
        </Card>

        {/* Card for Target Consumption with buttons underneath */}
        {/* <Card className="p-8 gap-4 flex flex-col items-center justify-center">
          <h1 className="text-4xl">
            {userTargetKwhConsumption} 
            <span className="text-sm font-normal"> Kilowatts</span>
            <hr className="border rounded-full mt-2" />
          </h1>
          <div className="flex flex-col gap-2 items-center w-full">
            <input
              type="number"
              placeholder="Target kWh Consumption"
              onFocus={() => setIsEditingConsumption(true)}
              onChange={(e) => setConsumption(parseFloat(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-center"
            />
            {isEditingConsumption && (
              <div className="flex justify-center gap-2">
                <button onClick={acceptNewConsumption}>
                  <CheckIcon className="w-6 h-6 text-green-600" />
                </button>
                <button onClick={rejectNewConsumption}>
                  <XMarkIcon className="w-6 h-6 text-red-600" />
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
          <FlagIcon className="w-6 h-6 text-red-600" />
          <p className="text-sm w-full text-center">Target Consumption</p>
          </div>
        </Card> */}
        
      </div>
    </div>
  );
}

export default Dashboard;