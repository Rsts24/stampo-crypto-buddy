import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { profileFormSchema } from "./PersonalInfoForm";

interface LanguagePreferencesProps {
  form: UseFormReturn<z.infer<typeof profileFormSchema>>;
}

export const LanguagePreferences = ({ form }: LanguagePreferencesProps) => {
  return (
    <FormField
      control={form.control}
      name="preferred_language"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Preferred Language</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};