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
import { showSuccess } from "@/utils/toast";
import { PlusCircle, Trash2 } from "lucide-react";
import type { IoGroupTemplate } from "@/types";
import { useAppContext } from "@/context/AppContext";

const pinSchema = z.object({
  pinNumber: z.coerce.number().int().min(1, "Pin musi być > 0").max(16, "Pin musi być <= 16"),
  name: z.string().min(2, "Nazwa musi mieć min. 2 znaki."),
});

const formSchema = z.object({
  name: z.string().min(2, { message: "Nazwa musi mieć co najmniej 2 znaki." }),
  description: z.string().optional(),
  inputs: z.array(pinSchema).optional(),
  outputs: z.array(pinSchema).optional(),
});

type TemplateFormProps = {
  setModalOpen: (isOpen: boolean) => void;
  editingTemplate?: IoGroupTemplate | null;
};

const TemplateForm = ({ setModalOpen, editingTemplate }: TemplateFormProps) => {
  const { addTemplate, updateTemplate } = useAppContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: editingTemplate || {
      name: "",
      description: "",
      inputs: [],
      outputs: [],
    },
  });

  const { fields: inputFields, append: appendInput, remove: removeInput } = useFieldArray({
    control: form.control,
    name: "inputs",
  });

  const { fields: outputFields, append: appendOutput, remove: removeOutput } = useFieldArray({
    control: form.control,
    name: "outputs",
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const templateData = {
      ...values,
      inputs: values.inputs || [],
      outputs: values.outputs || [],
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
                  <FormControl><Input placeholder="np. Standardowy mieszalnik" {...field} /></FormControl>
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

            <div>
              <h3 className="text-sm font-medium mb-2">Wejścia (Inputs)</h3>
              <div className="space-y-3">
                {inputFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`inputs.${index}.pinNumber`}
                      render={({ field }) => (
                        <FormItem className="w-20">
                          <FormControl><Input type="number" placeholder="Pin" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`inputs.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl><Input placeholder="Nazwa wejścia" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeInput(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendInput({ pinNumber: inputFields.length + 1, name: "" })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Dodaj wejście
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Wyjścia (Outputs)</h3>
              <div className="space-y-3">
                {outputFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`outputs.${index}.pinNumber`}
                      render={({ field }) => (
                        <FormItem className="w-20">
                          <FormControl><Input type="number" placeholder="Pin" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`outputs.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl><Input placeholder="Nazwa wyjścia" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOutput(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendOutput({ pinNumber: outputFields.length + 1, name: "" })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Dodaj wyjście
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