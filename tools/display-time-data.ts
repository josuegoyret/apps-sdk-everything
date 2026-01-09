import { type ToolMetadata } from "xmcp";
import { baseURL } from "@/baseUrl";
import { getAppsSdkCompatibleHtml } from "@/lib/utils";

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "display-time-data",
  description: "Displays the current time",
  _meta: {
    openai: {
      toolInvocation: {
        invoking: "Loading time data...",
        invoked: "Time data loaded",
      },
    },
  },
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    openWorldHint: true,
  },
};

// Tool implementation
export default async function handler() {
  const html = await getAppsSdkCompatibleHtml(
    baseURL,
    "/widgets/display-time-data"
  );

  return html;
}
