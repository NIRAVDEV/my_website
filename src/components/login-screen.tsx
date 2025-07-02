"use client";

import { useState } from 'react';
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
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Loader2 } from 'lucide-react';

const FormSchema = z.object({
  secretCode: z.string().min(1, { message: "Secret code is required." }),
});

type LoginScreenProps = {
  onLogin: (code: string) => boolean;
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      secretCode: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    // Simulate network delay for better UX
    setTimeout(() => {
      const success = onLogin(data.secretCode);
      if (!success) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "The secret code is incorrect. Please try again.",
        });
        setIsLoading(false);
        form.reset();
      }
      // On success, parent component handles view change, so we don't need to setIsLoading(false) here.
    }, 500);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary mb-4">
            <ShieldCheck className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Green Vault
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter your secret code to access your private gallery.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="secretCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Secret Code</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="text-center text-lg h-12"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-12 text-lg bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Unlock Vault'}
            </Button>
          </form>
        </Form>
        <p className="text-center text-xs text-muted-foreground">
          Your session is private and secure.
        </p>
      </div>
    </div>
  );
}
