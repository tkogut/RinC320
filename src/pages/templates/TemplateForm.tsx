"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccess } from "@/utils/toast";
import { PlusCircle, Trash2 } from "lucide-react";
import type { IoGroupTemplate, TemplatePin } from "@/types";
import { useAppContext } from "@/context/AppContext";

const formPinSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana."),
  type: z.enum(['input', 'output']),
});

const formSchema = z.object({
  name: z.string().min(2, { message: "Nazwa musi mieć co najmniej 2 znaki." }),
  description: z.string().optional(),
  pins: z.array(formPinSchema),
});

type TemplateFormProps = {
  setModalOpen: (isOpen: boolean) => void;
  editingTemplate?: IoGroupTemplate | null;
};

const TemplateForm = ({ setModalOpen, editingTemplate }: TemplateFormProps) => {
  const { addTemplate, updateTemplate } = useAppContext();

  const getDefaultValues = () => {
    if (!editingTemplate) {
      return { name: "", description: "", pins: [] };
    }
    const inputsAsFormPins = editingTemplate.inputs.map(p => ({ name: p.name, type: 'input' as const }));
    const outputsAsFormPins = editingTemplate.outputs.map(p => ({ name: p.name, type: 'output' as const }));
    return {
      name: editingTemplate.name,
      description: editingTemplate.description || "",
      pins: [...inputsAsFormPins, ...outputsAsFormPins],
    };
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pins",
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const finalInputs: TemplatePin[] = [];
    const finalOutputs: TemplatePin[] = [];

    values.pins.forEach(pin => {
      if (pin.type === 'input') {
        finalInputs.push({ name: pin.name, pinNumber: finalInputs.length + 1 });
      } else {
        finalOutputs.push({ name: pin.name, pinNumber: finalOutputs.length + 1 });
      }
    });

    const templateData = {
      name: values.name,
      description: values.description,
      inputs: finalInputs,
      outputs: finalOutputs,
    };

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, templateData);
      showSuccess("Szablon zaktualizowany pomyślnie");
    } else {
      addTemplate(templateData);
      showSuccess("Szablon dodany pomyślnie");
    }
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
                  <FormLabel>Nazwa szablonu</FormLabel>
                  <FormControl><Input placeholder="np. Dozowanie 3 składnikowe" {...field} /></FormControl>
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
                  <FormControl><Input placeholder="Opcjonalny opis szablonu" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="relative mt-4">
              <div className="absolute -top-3 left-4 bg-white px-2 text-sm font-medium text-gray-600 border border-b-0 rounded-t-md">Wejścia/Wyjścia</div>
              <div className="border rounded-md p-4 pt-8 space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[1fr_auto_auto] items-end gap-3">
                    <FormField
                      control={form.control}
                      name={`pins.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nazwa</FormLabel>
                          <FormControl><Input placeholder={`np. Wyjście ${index + 1}`} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`pins.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Typ</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="w-[180px]"><SelectValue placeholder="Wybierz typ" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="output">Wyjście</SelectItem>
                              <SelectItem value="input">Wejście</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" className="w-full" onClick={() => append({ name: "", type: "output" })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Dodaj
                </Button>
              </div>
            </div>
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

export default TemplateForm;