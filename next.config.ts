import type { NextConfig } from "next";
import os from "os";

function getLocalNetworkIPs(): string[] {
  try {
    const ips = new Set<string>();
    for (const iface of Object.values(os.networkInterfaces())) {
      for (const addr of iface ?? []) {
        const isIPv4 = String(addr.family) === "IPv4";
        if (isIPv4 && !addr.internal) {
          ips.add(addr.address);
        }
      }
    }
    return [...ips];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  // Dev-only: avoid calling os.networkInterfaces() in production (can crash on some hosts).
  allowedDevOrigins:
    process.env.NODE_ENV === "development" ? getLocalNetworkIPs() : [],
};

export default nextConfig;
