import { DataTable } from "@/components/data-table";
import Header from "@/components/header";
import { Card } from "@/components/ui/card";
import { faker } from "@faker-js/faker";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { columns } from "./columns";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "/src/firebase/config";
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
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Consumption() {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [labels, setLabels] = useState([]);
  
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
  const januaryKwH = parseFloat((usageJanuary - usageDecember).toFixed(2));
  const februaryKwH = parseFloat((usageFebruary - usageJanuary).toFixed(2));
  const marchKwH = parseFloat((usageMarch - usageFebruary).toFixed(2));
  const aprilKwH = parseFloat((usageApril - usageMarch).toFixed(2));
  const mayKwH = parseFloat((usageMay - usageApril).toFixed(2));
  const juneKwH = parseFloat((usageJune - usageMay).toFixed(2));
  const julyKwH = parseFloat((usageJuly - usageJune).toFixed(2));
  const augustKwH = parseFloat((usageAugust - usageJuly).toFixed(2));
  const septemberKwH = parseFloat((usageSeptember - usageAugust).toFixed(2));
  const octoberKwH = parseFloat((usageOctober - usageSeptember).toFixed(2));
  const novemberKwH = parseFloat((usageNovember - usageOctober).toFixed(2));
  const decemberKwH = parseFloat((usageDecember - usageNovember).toFixed(2));
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


  

  const fetchKwhDataForMonth = async (deviceNo, month, setter) => {
    const kwhDocRef = doc(db, `/deviceMonthlyData/${deviceNo}/${month}/KwH`);
    try {
      const kwhDocSnap = await getDoc(kwhDocRef);
      if (kwhDocSnap.exists()) {
        // If the document exists, use the existing data
        setter(kwhDocSnap.data().Positive_Active_Energy_Total_1);
      } else {
        // If the document does not exist, create it and set the initial value
        console.log(`No kWh data found for ${month} for device ${deviceNo}, creating new entry.`);
        await setDoc(kwhDocRef, { Positive_Active_Energy_Total_1: 0 }, { merge: true });
        setter(0);
      }
    } catch (error) {
      console.error(`Error fetching kWh data for ${month}:`, error);
    }
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
  const fetchMonthlyConsumption = async (deviceNo, month, setter) => {
    const kwhDocRef = doc(db, `/deviceMonthlyData/${deviceNo}/${month}/KwH`);
    try {
      const kwhDocSnap = await getDoc(kwhDocRef);
      if (kwhDocSnap.exists()) {
        // If the document exists, use the existing data
        setter(kwhDocSnap.data().current_bill);
      } else {
        // If the document does not exist, create it and set the initial value
        console.log(`No kWh data found for ${month} for device ${deviceNo}, creating new entry.`);
        await setDoc(kwhDocRef, { current_bill: 0 }, { merge: true });
        setter(0);
      }
    } catch (error) {
      console.error(`Error fetching kWh data for ${month}:`, error);
    }
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

  const months = [
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
  ];

  useEffect(() => {
    switch (selectedTimePeriod) {
      case "monthly":
        setLabels(months);
        break;
      case "daily":
        if (selectedMonth !== null) {
          const daysInMonth = new Date(2024, months.indexOf(selectedMonth) + 1, 0).getDate();
          setLabels(Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()));
        } else {
          setLabels([]);
        }
        break;
      case "weekly":
        setLabels(months);
        break;
      default:
        break;
    }
  }, [selectedTimePeriod, selectedMonth]);

  const getWeeksInMonth = (month) => {
    const weeks = [];
    const currentDate = new Date();
    currentDate.setMonth(month);
    currentDate.setDate(1);
    const firstDayOfMonth = currentDate.getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), month + 1, 0).getDate();
    let week = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      week.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      weeks.push(week);
    }
    return weeks.map((_, i) => `Week ${i + 1}`);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Consumption kWh",
      },
    },
  };

  const kwhConsumption = [
    januaryKwH > 0 ? januaryKwH : 0,
    februaryKwH > 0 ? februaryKwH : 0,
    marchKwH > 0 ? marchKwH : 0,
    aprilKwH > 0 ? aprilKwH : 0,
    mayKwH > 0 ? mayKwH : 0,
    juneKwH > 0 ? juneKwH : 0,
  ];
  
  const monthlyConsumption = [
    januaryBill > 0 ? januaryBill : 0,
    februaryBill > 0 ? februaryBill : 0,
    marchBill > 0 ? marchBill : 0,
    aprilBill > 0 ? aprilBill : 0,
    mayBill > 0 ? mayBill : 0,
    juneBill > 0 ? juneBill : 0  
  ];
  
  const consumptionData = months.map((month,index) => ({
    id: index,
    month: month,
    kwh: kwhConsumption[index],
    monthly_bill: monthlyConsumption[index]  // Example of a condition, adjust as needed
  }));
  const data = {
    labels: selectedTimePeriod === "weekly" ? getWeeksInMonth(months.indexOf(selectedMonth)) : labels,
    datasets: [
      {
        label: "KWH",
        data: kwhConsumption,
        backgroundColor: "rgb(37, 99, 235)",
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Header title="My Consumption" userType="Consumer" />
      <div className="mt-4 space-y-2">
        <div className="relative">
          <div className="absolute top-5 left-2 flex justify-center space-x-4">
            <select
              value={selectedTimePeriod}
              onChange={(e) => setSelectedTimePeriod(e.target.value)}
              className="select bg-transparent text-black-700 text-sm px-4 py-1 rounded border border-gray-300 ml-6"
            >
              {/* <option value="daily">Daily</option> */}
              <option value="monthly">Monthly</option>
              {/* <option value="weekly">Weekly</option> */}
            </select>
            {(selectedTimePeriod === "daily" || selectedTimePeriod === "weekly") && (
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="select bg-transparent text-black-700 text-sm px-4 py-1 rounded border border-gray-300"
              >
                {months.map((month, index) => (
                  <option key={index} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            )}
          </div>
          <Card className="p-8">
            <Bar
              className="max-h-[400px] h-full"
              options={options}
              data={data}
            />
          </Card>
        </div>
        <DataTable columns={columns} data={consumptionData} />
      </div>
    </div>
  );
}

export default Consumption;
