"use client";

import password from "@/app/password.json";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React, { useState } from "react";
import 'react-calendar/dist/Calendar.css';

let passwordIsGood: boolean = false;

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Votre mot de passe doit contenir 6 chiffres.",
  }),
});

export default function Home() {

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "Authentification:",
      description: (
        <p className="text-white text-xl">
          {data.pin === password.password
            ? "Vous avez été authentifié. ✅"
            : "Le mot de passe n'est pas bon. ❌"}
        </p>
      ),
    });

    if (data.pin === password.password) passwordIsGood = true;
    else passwordIsGood = false;
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-7xl items-center justify-between lg:flex">

          {passwordIsGood ? (
            <>
              <Calendar
                mode="single"
                className="border rounded-sm border-primary"
              />
            </>
            
          ) : (
            <Form {...form}>
              <p className="text-3xl">
                Bonjour, veuillez entrer un
                <span className="bg-gradient-to-r from-primary to-accent inline-block bg-clip-text text-transparent font-bold">
                  mot de passe
                </span>
                :
              </p>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-2/3 space-y-6"
              >
                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe:</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="rounded-md hover:-translate-y-1 transition ease-in-out"
                >
                  Submit
                </Button>
              </form>
              <img src="./icon.png" alt="icon" className="w-[300px]" />
            </Form>
          )}
        </div>
      </main>
    </>
  );
}
