import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { emailFormSchema, phoneFormSchema } from "./AuthForm";

interface AuthFormFieldsProps {
  type: "email" | "phone";
  isSignUp: boolean;
  form: UseFormReturn<z.infer<typeof emailFormSchema> | z.infer<typeof phoneFormSchema>>;
}

export const AuthFormFields = ({ type, isSignUp, form }: AuthFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name={type === "email" ? "email" : "phone"}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700">
              {type === "email" ? "Email" : "Phone Number"}
            </FormLabel>
            <FormControl>
              <Input
                type={type === "email" ? "email" : "tel"}
                placeholder={
                  type === "email" ? "Enter your email" : "+1234567890"
                }
                className="bg-white/50"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isSignUp && (
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your full name"
                  className="bg-white/50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700">Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Enter your password"
                className="bg-white/50"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};