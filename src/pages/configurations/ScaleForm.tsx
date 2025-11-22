"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { showSuccess } from "@/utils/toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nazwa jest wymagana." }),
  groups: z.array(z.string()).optional(),
  description: z.string().optional(),
  host: z.string().optional(),
  department: z.string().optional(),
  printer: z.string().optional(),
  groupMeasurements: z.boolean().default(false),
  sendInterval: z.coerce.number().int().positive().default(10),
  measurementUnit: z.string().default("kg"),
  model: z.string().optional(),
  measurementRegex: z.string().optional(),
  communicationMode: z.string().default("from_scale"),
  connectionType: z.string().default("ethernet"),
  ipAddress: z.string().ip({ version: "v4", message: "Nieprawidłowy adres IP." }).default("192.168.127.200"),
  port: z.coerce.number().int().min(1).max(65535).default(4002),
});

type ScaleFormProps = {
  setModalOpen: (isOpen: boolean) => void;
};

const ScaleForm = ({ setModalOpen }: ScaleFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      groupMeasurements: false,
      sendInterval: 10,
      measurementUnit: "kg",
      communicationMode: "from_scale",
      connectionType: "ethernet",
      ipAddress: "192.168.127.200",
      port: 4002,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Scale form submitted:", values);
    showSuccess("Konfiguracja wagi zapisana (symulacja)");
    setModalOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ScrollArea className="h-[70vh] pr-6">
          <div className="space-y-6 p-1">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Nazwa</FormLabel><FormControl><Input placeholder="Waga produkcyjna #1" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            {/* Placeholder for multi-select */}
            <FormItem><FormLabel>Grupy</FormLabel><FormControl><Select><SelectTrigger><SelectValue placeholder="Wybierz grupy" /></SelectTrigger></Select></FormControl><FormMessage /></FormItem>
            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Opis</FormLabel><FormControl><Input placeholder="Opcjonalny opis" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="host" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Host</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger></FormControl><SelectContent><SelectItem value="host1">Host 1</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField name="department" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Oddział</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger></FormControl><SelectContent><SelectItem value="prod">Produkcja</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField name="printer" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Drukarka</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger></FormControl><SelectContent><SelectItem value="zebra1">Zebra ZT410</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField name="groupMeasurements" control={form.control} render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Grupuj wysyłane pomiary</FormLabel></FormItem>
            )} />
            <FormField name="sendInterval" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Interwał wysyłania pomiarów (w sekundach)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="measurementUnit" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Jednostka pomiaru</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="kg">Kilogramy</SelectItem><SelectItem value="g">Gramy</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField name="model" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Model</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger></FormControl><SelectContent><SelectItem value="rinstrum_c320">Rinstrum C320</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField name="measurementRegex" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Regex dla pomiaru</FormLabel><FormControl><Input placeholder="Opcjonalny regex" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="communicationMode" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Tryb komunikacji</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="from_scale">Pomiary wysyłane z wagi</SelectItem><SelectItem value="to_scale">Pomiary odpytywane</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField name="connectionType" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Typ połączenia</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="ethernet">Ethernet</SelectItem><SelectItem value="serial">Szeregowy</SelectItem></SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField name="ipAddress" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Adres IP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="port" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Port</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-6 border-t mt-6">
          <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
            Anuluj
          </Button>
          <Button type="submit">Zapisz</Button>
        </div>
      </form>
    </Form>
  );
};

export default ScaleForm;