"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { showSuccess } from "@/utils/toast";
import type { IoDevice } from "@/types";
import { useAppContext } from "@/context/AppContext";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nazwa musi mieć co najmniej 2 znaki." }),
  description: z.string().optional(),
  hostId: z.string({ required_error: "Host jest wymagany." }),
  ipAddress: z.string().ip({ version: "v4", message: "Nieprawidłowy adres IP." }),
});

type IoDeviceFormProps = {
  setModalOpen: (isOpen: boolean) => void;
  onAddDevice: (deviceData: Omit<IoDevice, "id">) => void;
  onUpdateDevice: (id: string, deviceData: Omit<IoDevice, "id">) => void;
  editingDevice?: IoDevice | null;
};

const IoDeviceForm = ({ setModalOpen, onAddDevice, onUpdateDevice, editingDevice }: IoDeviceFormProps) => {
  const { hosts } = useAppContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: editingDevice || {
      name: "",
      description: "",
      ipAddress: "192.168.1.",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (editingDevice) {
      onUpdateDevice(editingDevice.id, values);
      showSuccess("Urządzenie I/O zaktualizowane pomyślnie");
    } else {
      onAddDevice(values);
      showSuccess("Urządzenie I/O dodane pomyślnie");
    }
    setModalOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa</FormLabel>
              <FormControl>
                <Input placeholder="np. Moduł I/O #1" {...field} />
              </FormControl>
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
              <FormControl>
                <Input placeholder="Opcjonalny opis" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hostId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Host</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz hosta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {hosts.length > 0 ? (
                    hosts.map(h => <SelectItem key={h.id} value={h.id}>{h.name} ({h.ipAddress})</SelectItem>)
                  ) : (
                    <SelectItem value="disabled" disabled>Brak dostępnych hostów</SelectItem>
                  )}
                </SelectContent>
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
              <FormControl>
                <Input placeholder="192.168.1.10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
            Anuluj
          </Button>
          <Button type="submit">Zapisz</Button>
        </div>
      </form>
    </Form>
  );
};

export default IoDeviceForm;