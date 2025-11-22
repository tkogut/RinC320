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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { showSuccess } from "@/utils/toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nazwa musi mieć co najmniej 2 znaki." }),
  connectionType: z.enum(["tcp", "serial"], { required_error: "Typ połączenia jest wymagany." }),
  address: z.string().min(3, { message: "Adres jest wymagany." }),
  protocol: z.enum(["rinstrum_c320", "generic_ascii"], { required_error: "Protokół jest wymagany." }),
});

const ConfigurationForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      connectionType: "tcp",
      address: "",
      protocol: "rinstrum_c320",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: Send data to the backend API
    console.log("Form submitted:", values);
    showSuccess("Konfiguracja zapisana (symulacja)");
    navigate("/configurations");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Szczegóły Konfiguracji</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa Konfiguracji</FormLabel>
                  <FormControl>
                    <Input placeholder="np. Waga magazynowa" {...field} />
                  </FormControl>
                  <FormDescription>
                    Przyjazna nazwa do identyfikacji tej wagi.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="connectionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typ Połączenia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz typ połączenia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tcp">TCP/IP (Sieć)</SelectItem>
                      <SelectItem value="serial">Port Szeregowy (COM)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adres</FormLabel>
                  <FormControl>
                    <Input placeholder={form.watch("connectionType") === "tcp" ? "192.168.1.123:3001" : "COM1"} {...field} />
                  </FormControl>
                  <FormDescription>
                    {form.watch("connectionType") === "tcp"
                      ? "Adres IP i port konwertera (np. NP301)."
                      : "Nazwa portu szeregowego (np. COM1, /dev/ttyUSB0)."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="protocol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protokół Komunikacyjny</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz protokół" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="rinstrum_c320">Rinstrum C320 (ASCII)</SelectItem>
                      <SelectItem value="generic_ascii">Ogólny ASCII (odczyt linii)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Protokół używany przez wagę do komunikacji.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/configurations")}>
              Anuluj
            </Button>
            <Button type="submit">Zapisz Konfigurację</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ConfigurationForm;