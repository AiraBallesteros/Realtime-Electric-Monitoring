import { DataTable } from "@/components/data-table";
import Header from "@/components/header";

import { Button } from "@/components/ui/button";
// import { consumerData } from "@/dummy.data";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { columns } from "./columns";
import { useState, useEffect } from 'react';
import { query, collection, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '/src/firebase/config';

function Consumers() {
  const [consumerData, setConsumers] = useState([]);
  const [kwhRate, setKwhRate] = useState(null);

  useEffect(() => {
    const fetchKwhRate = async () => {
      const configurationsDocRef = doc(db, 'Configurations', 'JaGs1AtPFuoMRG3YRxW1'); 
      const docSnap = await getDoc(configurationsDocRef);
      if (docSnap.exists()) {
        setKwhRate(docSnap.data().kwh);
      } else {
        console.log("No such document!");
      }
    };

    fetchKwhRate();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'Consumers'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setConsumers((currentConsumers) => {
        const consumerUpdates = new Map(currentConsumers.map(consumer => [consumer.id, consumer]));

        querySnapshot.docChanges().forEach((change) => {
          const consumerData = { id: change.doc.id, ...change.doc.data() };

          if (change.type === "added" || change.type === "modified") {
            consumerUpdates.set(consumerData.id, consumerData);

            if (change.type === "modified") {
              const oldKwh = change.oldDoc && change.oldDoc.data().kwh;
              const newKwh = change.doc.data().kwh;

              if (oldKwh !== newKwh && kwhRate !== null) {
                const newMonthlyBill = newKwh * kwhRate;
                consumerData.monthly_bill = newMonthlyBill;
                const consumerDocRef = doc(db, "Consumers", change.doc.id);
                updateDoc(consumerDocRef, { monthly_bill: newMonthlyBill });
              }
            }
          } else if (change.type === "removed") {
            consumerUpdates.delete(consumerData.id);
          }
        });

        return Array.from(consumerUpdates.values());
      });
    });

    return () => unsubscribe();
  }, [kwhRate]); // Added kwhRate to the dependency array
  

  return (
    <div className="w-full space-y-4">
      <Header title="Consumers" userType="Admin" />
      <div className="flex justify-end">
        <Link to="create">
          <Button className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            <span>Create Consumer</span>
          </Button>
        </Link>
      </div>
      <div>
        <DataTable columns={columns} data={consumerData} />
      </div>
    </div>
  );
}

export default Consumers;