"use client";

import React from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { showSuccess } from "@/utils/toast";
import type { Host } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nazwa musi mieć co najmniej 2 znaki." }),
  description: z.string().optional(),
  ipAddress: z.string().ip({ version: "v4", message: "Nieprawidłowy adres IP." }),
  port: z.coerce.number().int().min(1, "Port musi być większy od 0.").max(65535, "Port nie może być większy niż 65535."),
  isActive: z.boolean().default(true),
});

type HostFormProps = {
  setModalOpen: (isOpen: boolean) => void;
  onAddHost: (hostData: Omit<Host, "id">) => void;
  onUpdateHost: (id: string, hostData: Omit<Host, "id">) => void;
  editingHost?: Host | null;
};

const HostForm = ({ setModalOpen, onAddHost, onUpdateHost, editingHost }: HostFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: editingHost || {
      name: "",
      description: "",
      ipAddress: "192.168.1.",
      port: 4001,
      isActive: true,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (editingHost) {
      onUpdateHost(editingHost.id, values);
      showSuccess("Host zaktualizowany pomyślnie");
    } else {
      onAddHost(values);
      showSuccess("Host dodany pomyślnie");
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
                <Input placeholder="np. MOXA NP-301 Magazyn" {...field} />
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
                <Input placeholder="Opcjonalny opis hosta" {...field} />
              </FormControl>
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
                <Input placeholder="np. 192.168.1.10" {...field} />
              </FormControl>
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
              <FormControl>
                <Input type="number" placeholder="np. 4001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Aktywny
                </FormLabel>
                <FormDescription>
                  Zaznacz, jeśli host jest aktywny i gotowy do użycia.
                </FormDescription>
              </div>
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

export default HostForm;