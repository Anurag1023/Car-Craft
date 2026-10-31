"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/providers/toast-provider";
import { MessageSquare, X, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InquiryModalProps {
  vehicle: {
    id: string;
    brand: string;
    model: string;
    variant?: string | null;
    dealership?: { name: string } | null;
  };
}

export function VehicleInquiryModal({ vehicle }: InquiryModalProps) {
  const { data: session } = useSession();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    `Hi, I am interested in this ${vehicle.brand} ${vehicle.model} listed at ${vehicle.dealership?.name || "your dealership"}. Please share test drive availability and best finance offers.`
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          name,
          email,
          phone,
          message,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        toast.success("Inquiry Submitted", data.message);
      } else {
        toast.error("Submission Failed", data.error || "Please verify your input");
      }
    } catch {
      toast.error("Error", "Could not send inquiry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsSuccess(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
      >
        <MessageSquare className="w-5 h-5" />
        <span>Contact Dealer & Inquire</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Inquiry Received!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thank you! An authorized dealership consultant from{" "}
                  <strong>{vehicle.dealership?.name}</strong> has received your inquiry for the{" "}
                  <strong>{vehicle.brand} {vehicle.model}</strong> and will call you shortly.
                </p>
                <Button onClick={handleClose} className="mt-4">
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Vehicle Inquiry</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Express interest in {vehicle.brand} {vehicle.model} ({vehicle.dealership?.name})
                  </p>
                </div>

                <div>
                  <Label htmlFor="inq-name">Your Full Name</Label>
                  <Input
                    id="inq-name"
                    required
                    placeholder="Arjun Verma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="inq-email">Email Address</Label>
                    <Input
                      id="inq-email"
                      type="email"
                      required
                      placeholder="arjun@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="inq-phone">Mobile Number</Label>
                    <Input
                      id="inq-phone"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="inq-msg">Your Message / Questions</Label>
                  <textarea
                    id="inq-msg"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isLoading} className="gap-2">
                    <Send className="w-4 h-4" />
                    Submit Inquiry
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
