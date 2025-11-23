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
import { useAppContext } from "@/context/AppContext";
import type { Protocol } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nazwa musi mieć co najmniej 2 znaki." }),
  description: z.string().optional(),
  hostId: z.string({ required_error: "Musisz wybrać hosta." }),
  protocol: z.enum(["rinstrum_c320", "generic_ascii"]),
  isEnabled: z.boolean().default(true),
  model: z.string().optional(),
  measurementRegex: z.string().optional(),
});

type ScaleFormProps = {
  setModalOpen: (isOpen: boolean) => void;
};

const ScaleForm = ({ setModalOpen }: ScaleFormProps) => {
  const { hosts, addConfiguration } = useAppContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      protocol: "rinstrum_c320",
      isEnabled: true,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addConfiguration(values);
    showSuccess("Konfiguracja wagi zapisana");
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
              name="hostId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host (Konwerter)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wybierz hosta" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {hosts.length > 0 ? (
                        hosts.map(h => <SelectItem key={h.id} value={h.id}>{h.name} ({h.ipAddress}:{h.port})</SelectItem>)
                      ) : (
                        <SelectItem value="disabled" disabled>Brak dostępnych hostów</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>Wybierz konwerter, z którym połączy się waga.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="protocol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protokół</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="rinstrum_c320">Rinstrum C320</SelectItem>
                      <SelectItem value="generic_ascii">Generic ASCII</SelectItem>
                    </SelectContent>
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
                  <FormControl><Input placeholder="np. Rinstrum C320" {...field} /></FormControl>
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
                  <FormControl><Input placeholder="Opcjonalny regex do wyciągania wagi" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="isEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel>Konfiguracja włączona</FormLabel>
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