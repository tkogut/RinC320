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
import { showSuccess } from "@/utils/toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nazwa musi mieć co najmniej 2 znaki." }),
  description: z.string().optional(),
  host: z.string({ required_error: "Host jest wymagany." }),
  ipAddress: z.string().regex(/^192\.168\.\d{1,3}\.\d{1,3}$/, {
    message: "Wymagany format to 192.168.x.x",
  }),
});

type IoDeviceFormProps = {
  setModalOpen: (isOpen: boolean) => void;
};

const IoDeviceForm = ({ setModalOpen }: IoDeviceFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted:", values);
    showSuccess("Urządzenie I/O zapisane (symulacja)");
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
          name="host"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Host</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="host1">Host 1</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
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