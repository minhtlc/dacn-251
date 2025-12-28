"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function StudentSettings() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">Settings</h1>
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm text-gray-700">Email notifications</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm text-gray-700">Certificate expiry reminders</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700">Marketing communications</span>
              </label>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Privacy</h3>
            <Button variant="outline" className="w-full">
              Manage Privacy Settings
            </Button>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Account</h3>
            <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

