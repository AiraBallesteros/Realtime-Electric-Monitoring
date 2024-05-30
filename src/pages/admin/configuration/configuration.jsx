import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import React, { useEffect, useState } from 'react';
import { db } from "/src/firebase/config";
import { collection, query, onSnapshot, doc, updateDoc, getDocs, getDoc } from "firebase/firestore";

const formSchema = z.object({
  kwh: z.number(),
  genSys: z.number(),
  oga: z.number(),
  xMissionSys: z.number(),
  otca: z.number(),
  systemLoss: z.number(),
  osla: z.number(),
  distSystem: z.number(),
  supplySys: z.number(),
  mtringSys: z.number(),
  retCust: z.number(),
  iccsAd: z.number(),
  lifeLineRate: z.number(),
  iceraGram: z.number(),
  rfscCapex: z.number(),
  snrCtznSubsKwh: z.number(),
  olra: z.number(),
  osrRa: z.number(),
  reinsPPDAd: z.number(),
  missElect: z.number(),
  fitAllowance: z.number(),
  strandedDebt: z.number(),
  vatGen: z.number(),
  vatSL: z.number(),
  vatIcera: z.number(),
  vatDr: z.number(),
  vatTr: z.number(),
  realPropTax: z.number(),
  franchiseTax: z.number(),
});

function Configuration() {

  const [configs, setConfigs] = useState(null); // State to hold dynamic data

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      //WILL REVIEW LATER WHETHER THIS IS NEEDED OR NOT
      kwh: '',
      genSys: '',
      oga: '',
      xMissionSys: '',
      otca: '',
      systemLoss: '',
      osla: '',
      distSystem: '',
      supplySys: '',
      mtringSys: '',
      retCust: '',
      iccsAd: '',
      lifeLineRate: '',
      iceraGram: '',
      rfscCapex: '',
      snrCtznSubsKwh: '',
      olra: '',
      osrRa: '',
      reinsPPDAd: '',
      missElect: '',
      fitAllowance: '',
      strandedDebt: '',
      vatGen: '',
      vatSL: '',
      vatIcera: '',
      vatDr: '',
      vatTr: '',
      realPropTax: '',
      franchiseTax: '',
    },
  });
  
  useEffect(() => {
    const q = query(collection(db, 'Configurations'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const configs = [];
      querySnapshot.forEach((doc) => {
        configs.push({ id: doc.id, ...doc.data() });
      });
      if (configs.length > 0) {
        // Use the first configuration to set the form values
        setConfigs(configs[0]);
        form.reset(configs[0]); // This will update the form with fetched values
      }
      console.log(configs); //FOR TESTING ONLY
    });    
    return () => unsubscribe();
  }, [form]);

  
  const onSubmit = async (values, documentId) => {
    try {
      const docRef = doc(db, 'Configurations', 'JaGs1AtPFuoMRG3YRxW1');
      await updateDoc(docRef, {
          kwh: values.kwh,
          genSys: values.genSys,
          oga: values.oga,
          xMissionSys: values.xMissionSys,
          otca: values.otca,
          systemLoss: values.systemLoss,
          osla: values.osla,
          distSystem: values.distSystem,
          supplySys: values.supplySys,
          mtringSys: values.mtringSys,
          retCust: values.retCust,
          iccsAd: values.iccsAd,
          lifeLineRate: values.lifeLineRate,
          iceraGram: values.iceraGram,
          rfscCapex: values.rfscCapex,
          snrCtznSubsKwh: values.snrCtznSubsKwh,
          olra: values.olra,
          osrRa: values.osrRa,
          reinsPPDAd: values.reinsPPDAd,
          missElect: values.missElect,
          fitAllowance: values.fitAllowance,
          strandedDebt: values.strandedDebt,
          vatGen: values.vatGen,
          vatSL: values.vatSL,
          vatIcera: values.vatIcera,
          vatDr: values.vatDr,
          vatTr: values.vatTr,
          realPropTax: values.realPropTax,
          franchiseTax: values.franchiseTax,
      });const configSnapshot = await getDoc(docRef);
      const kwhRate = configSnapshot.data().kwh;

      // Query all consumers to update their monthly bill
      const consumersQuery = query(collection(db, 'Consumers'));
      const querySnapshot = await getDocs(consumersQuery);

      // Update each consumer's monthly bill
      const updates = querySnapshot.docs.map((doc) => {
          const consumerData = doc.data();
          const newBill = consumerData.kwh * kwhRate; // Assuming 'kwhConsumption' is the field name
          return updateDoc(doc.ref, { monthly_bill: newBill });
      });

      // Wait for all updates to complete
      await Promise.all(updates);

      toast({
          title: "Updated",
          description: "Configurations and consumer bills are successfully updated."
      });
  } catch (error) {
      console.error("Error updating Configurations and consumer bills:", error);
      toast({
          title: "Error",
          description: error.message,
          status: "error",
      });
  }
};

  return (
    <div>
      <Header title="Configuration" />
      <Card className="p-8 mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-4 gap-2 md:gap-4 grid-cols-2">
              <FormField
                control={form.control}
                name="kwh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilowatt Hour</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="KwH" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="genSys"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gen Sys</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="Gen Sys" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="oga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OGA</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="OGA" {...field}
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="xMissionSys"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>XmissionSys</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="XmissionSys" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="otca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTCA</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="OTCA" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="systemLoss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Loss</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="System Loss" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="osla"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OSLA</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="OSLA" {...field}
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"  
                    />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="distSystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dist System</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="Dist System" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplySys"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supply Sys</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="Supply Sys" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mtringSys"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mtring Sys</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="Mtring Sys" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="retCust"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RetCust (MC)</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="RetCust" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="iccsAd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ICCS Ad</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="iccsAd" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lifeLineRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LifeLineRate</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="LifeLineRate" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="iceraGram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ICERA-GRAM</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="ICERA-GRAM" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rfscCapex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RFSC - CAPEX</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="RFSC - CAPEX" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="snrCtznSubsKwh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SnrCtzn Subs KWH</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="SnrCtzn Subs KWH" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="olra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OLRA</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="OLRA" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="osrRa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OSrRA</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="OSrRA" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reinsPPDAd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ReinsPPD Ad</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="reinsPPD Ad" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="missElect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Miss Elect</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="reinsPPD Ad" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fitAllowance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FIT Allowance</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="fitAllowance" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="strandedDebt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stranded Debt</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="Stranded Debt" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vatGen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vat (Gen)</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="Vat (Gen)" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vatSL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vat (SL) - V</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="Vat (SL) - VA" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vatIcera"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vat (ICERA)</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="Vat (ICERA)" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vatDr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vat (DR) - VA</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="Vat (DR) - VA" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vatTr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vat (Tr) - VA</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="Vat (TR) - VA" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="realPropTax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Real Prop Tax</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="Real Prop Tax" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="franchiseTax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Franchise Tax</FormLabel>
                    <FormControl>
                      <Input 
                      placeholder="Franchise Tax" {...field} 
                      type="number" //Added type to allow number input
                      onChange={(e) => field.onChange(Number(e.target.value))} //Added onchange, to bypass the error "Expected number, received string"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default Configuration;
