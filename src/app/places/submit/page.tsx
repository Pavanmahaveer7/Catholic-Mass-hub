"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubmitPlacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "restaurant",
    description: "",
    addressStreet: "",
    addressCity: "",
    addressRegion: "",
    addressPostal: "",
    country: "United States",
    phone: "",
    email: "",
    website: "",
    ownerName: "",
    ownerEmail: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      toast.success("Submission received! We will review your listing soon.");
      router.push("/places");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading text-3xl">List Your Business</h1>
      <p className="mt-2 text-muted-foreground">
        Register your Catholic-owned or Catholic-themed venue. All submissions are reviewed before publishing.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Business details</CardTitle>
          <CardDescription>Fields marked with * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business name *</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v ?? "restaurant" })}>
                <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="pub">Pub</SelectItem>
                  <SelectItem value="cafe">Café</SelectItem>
                  <SelectItem value="bookstore">Bookstore</SelectItem>
                  <SelectItem value="gift_shop">Gift Shop</SelectItem>
                  <SelectItem value="hangout">Hangout</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" required value={form.addressCity} onChange={(e) => setForm({ ...form, addressCity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">State/Region</Label>
                <Input id="region" value={form.addressRegion} onChange={(e) => setForm({ ...form, addressRegion: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Street address</Label>
              <Input id="street" value={form.addressStreet} onChange={(e) => setForm({ ...form, addressStreet: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Your name *</Label>
                <Input id="ownerName" required value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Your email *</Label>
                <Input id="ownerEmail" type="email" required value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Submitting…" : "Submit for review"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
