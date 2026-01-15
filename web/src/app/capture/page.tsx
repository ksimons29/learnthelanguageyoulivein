"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PhraseInput } from "@/components/capture";
import { BrandWidget } from "@/components/brand";

export default function CapturePage() {
  const router = useRouter();
  const [phrase, setPhrase] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!phrase.trim()) return;

    setIsSaving(true);
    // TODO: Save phrase to backend
    console.log("Saving phrase:", phrase);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSaving(false);
    router.push("/");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Dark overlay with close button */}
      <div
        className="flex-1 bg-black/50"
        onClick={handleClose}
        aria-label="Close capture"
      >
        {/* Brand widget in overlay */}
        <div className="flex justify-end p-4">
          <BrandWidget
            size="sm"
            variant="ghost"
            tooltipText="About LLYLI"
            className="text-white/80 hover:text-white"
          />
        </div>
      </div>

      {/* Bottom sheet modal */}
      <div className="bg-white rounded-t-3xl shadow-2xl">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-12 rounded-full bg-border" />
        </div>

        <div className="px-6 pb-8">
          {/* Header */}
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-foreground">Quick Capture</h1>
            <p className="text-muted-foreground">
              Add a phrase you want to remember
            </p>
          </div>

          {/* Input */}
          <div className="mb-6">
            <PhraseInput
              value={phrase}
              onChange={setPhrase}
              placeholder="Type or paste a phrase..."
            />
          </div>

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={!phrase.trim() || isSaving}
            className="w-full bg-primary py-6 text-lg font-semibold hover:bg-primary/90"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>

          {/* Helper text */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            You can add translation and context later
          </p>
        </div>

        {/* Safe area for iOS */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </div>
  );
}
