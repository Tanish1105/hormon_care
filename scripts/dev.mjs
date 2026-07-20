import { execSync, spawn } from "node:child_process";
import os from "node:os";

function getLocalNetworkIPs() {
  const ips = [];
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const addr of iface ?? []) {
      const isIPv4 = addr.family === "IPv4" || addr.family === 4;
      if (isIPv4 && !addr.internal) {
        ips.push(addr.address);
      }
    }
  }
  return ips;
}

execSync("npx prisma generate", { stdio: "inherit" });

const ips = getLocalNetworkIPs();
console.log("\n----------------------------------------");
console.log("  Hormon Care — Network URLs");
console.log("  Laptop:  http://localhost:3001");
for (const ip of ips) {
  console.log(`  Phone:   http://${ip}:3001`);
}
console.log("  (Phone ane laptop same WiFi par hova joye)");
console.log("----------------------------------------\n");

const child = spawn("npx", ["next", "dev", "-H", "0.0.0.0", "-p", "3001"], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
