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

// Mock data for dropdowns
const mockGroups = ["Grupa A", "Grupa B", "Grupa C"];
const mockHosts = ["Host 1", "Test Host"];
const mockDepartments = ["Produkcja", "Magazyn"];
const mockPrinters = ["Drukarka Zebra 1", "Drukarka Etykiet"];
const mockModels = ["Rinstrum C320", "Generic ASCII"];

const formSchema = z.object({
  name: z.string().min(2, { message: "Nazwa musi mieć co najmniej 2 znaki." }),
  groups: z.array(z.string()).optional(),
  description: z.string().optional(),
  host: z.string().optional(),
  department: z.string().optional(),
  printer: z.string().optional(),
  groupMeasurements: z.boolean().default(false),
  sendInterval: z.coerce.number().int().positive().default(10),
  measurementUnit: z.string().default("Kilogramy"),
  model: z.string().optional(),
  measurementRegex: z.string().optional(),
  communicationMode: z.string().default("Pomiary wysyłane z wagi"),
  connectionType: z.string().default("Ethernet"),
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
      description: "",
      groupMeasurements: false,
      sendInterval: 10,
      measurementUnit: "Kilogramy",
      communicationMode: "Pomiary wysyłane z wagi",
      connectionType: "Ethernet",
      ipAddress: "192.168.127.200",
      port: 4002,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Scale Form submitted:", values);
    showSuccess("Waga zapisana (symulacja)");
    setModalOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <ScrollArea className="pr-6">
          <div className="space-y-6 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa</FormLabel>
                  <FormControl><Input placeholder="np. Waga na produkcji" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Multi-select placeholder */}
            <FormItem>
              <FormLabel>Grupy</FormLabel>
              <Select>
                <SelectTrigger><SelectValue placeholder="Wybierz grupy" /></SelectTrigger>
                <SelectContent>
                  {mockGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormDescription>Funkcjonalność multi-select w budowie.</FormDescription>
            </FormItem>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis</FormLabel>
                  <FormControl><Input placeholder="Opcjonalny opis" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger></FormControl>
                    <SelectContent>{mockHosts.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Oddział</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger></FormControl>
                    <SelectContent>{mockDepartments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="printer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drukarka</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger></FormControl>
                    <SelectContent>{mockPrinters.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="groupMeasurements"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel>Grupuj wysyłane pomiary</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sendInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interwał wysyłania pomiarów</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <span className="text-sm text-gray-600">w sekundach</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="measurementUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jednostka pomiaru</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="Kilogramy">Kilogramy</SelectItem><SelectItem value="Gramy">Gramy</SelectItem></SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger></FormControl>
                    <SelectContent>{mockModels.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="measurementRegex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Regex dla pomiaru</FormLabel>
                  <FormControl><Input placeholder="Opcjonalny regex" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="communicationMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tryb komunikacji</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="Pomiary wysyłane z wagi">Pomiary wysyłane z wagi</SelectItem><SelectItem value="Pomiary odpytywane">Pomiary odpytywane</SelectItem></SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="connectionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typ połączenia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="Ethernet">Ethernet</SelectItem><SelectItem value="Serial">Serial</SelectItem></SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ipAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adres IP</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
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