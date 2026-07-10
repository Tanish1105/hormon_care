import type { NextConfig } from "next";
import os from "os";

function getLocalNetworkIPs(): string[] {
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
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getLocalNetworkIPs(),
};

export default nextConfig;
