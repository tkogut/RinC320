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
import type { IoGroup } from "@/types";
import { useAppContext } from "@/context/AppContext";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nazwa musi mieć co najmniej 2 znaki." }),
  description: z.string().optional(),
  deviceId: z.string({ required_error: "Urządzenie I/O jest wymagane." }),
});

type GroupFormProps = {
  setModalOpen: (isOpen: boolean) => void;
  editingGroup?: IoGroup | null;
};

const GroupForm = ({ setModalOpen, editingGroup }: GroupFormProps) => {
  const { devices, addGroup, updateGroup } = useAppContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: editingGroup || {
      name: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (editingGroup) {
      updateGroup(editingGroup.id, values);
      showSuccess("Grupa I/O zaktualizowana pomyślnie");
    } else {
      addGroup(values);
      showSuccess("Grupa I/O dodana pomyślnie");
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
                <Input placeholder="np. Sterowanie mieszalnikiem" {...field} />
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
          name="deviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Urządzenie I/O</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz urządzenie I/O" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {devices.length > 0 ? (
                    devices.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.ipAddress})</SelectItem>)
                  ) : (
                    <SelectItem value="disabled" disabled>Brak dostępnych urządzeń I/O</SelectItem>
                  )}
                </SelectContent>
              </Select>
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

export default GroupForm;