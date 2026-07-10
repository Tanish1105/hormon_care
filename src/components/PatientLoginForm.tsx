"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";

export function PatientLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/patient/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    window.location.href = "/patient";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Heart className="mx-auto h-10 w-10 text-purple-600" />
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Hormon Care</h1>
          <p className="mt-1 text-sm text-slate-500">
            Doctor દ્વારા આપેલ ID અને Password થી login કરો
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Patient ID"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="PAT123456"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
