"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FormSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

// Hardcoded user for demonstration purposes
const SERVER_ACCOUNTS = [
    { username: "mythical_user", password: "password123", mythicalCoins: 100 },
    { username: "gallery_fan", password: "secure_password", mythicalCoins: 50 },
];

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    
    setTimeout(() => {
      const foundUser = SERVER_ACCOUNTS.find(
        (acc) => acc.username === data.username && acc.password === data.password
      );

      if (foundUser) {
        // Don't store password in session storage
        const { password, ...userToStore } = foundUser;
        sessionStorage.setItem('user', JSON.stringify(userToStore));
        // Dispatch custom event to notify header
        window.dispatchEvent(new CustomEvent('sessionStorageChange'));
        toast({
          title: "Login Successful",
          description: `Welcome back, ${userToStore.username}!`,
        });
        router.push('/gallery');
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid username or password. Please try again.",
        });
        setIsLoading(false);
        form.reset();
      }
    }, 500);
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary mb-4">
                <ShieldCheck className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your vault.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                        <Input
                        placeholder="e.g. mythical_user"
                        {...field}
                        disabled={isLoading}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full h-11 text-lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
                </Button>
            </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
