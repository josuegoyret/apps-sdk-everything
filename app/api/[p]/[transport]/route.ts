// app/api/[p]/[transport]/route.ts (e.g.: /api/ownright/mcp)

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpHandler } from "mcp-handler";
import type { NextRequest } from "next/server";
import { dateTimeThreeRegister } from "@/mcp/date-time-three";

const propertyRegisterHandler = async (server: McpServer, property: string) => {
  switch (property) {
    case "date-time-three":
      await dateTimeThreeRegister(server);
      break;
  }
};

const getServerOptions = (p: string) => {
  switch (p) {
    case "date-time-three":
      return {
        serverInfo: {
          name: "Date Time Three",
          version: "0.1.0",
        },
      };
  }
};
const getConfig = (p: string) => {
  const config = {
    basePath: `/api/${p}`,
  };
  return config;
};

const handler = async (
  req: NextRequest,
  { params }: { params: Promise<{ p: string; transport: string }> }
) => {
  const { p } = await params;

  return createMcpHandler(
    async (server) => {
      await propertyRegisterHandler(server, p);
    },
    getServerOptions(p),
    getConfig(p)
  )(req);
};

export const GET = handler;
export const POST = handler;
