import { baseURL } from "@/baseUrl";

import { getAppsSdkCompatibleHtml } from "@/lib/utils";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
  widgetDomain: string;
  accessible: boolean;
  resultCanProduceWidget?: boolean;
  prefersBorder: boolean;
};

export function widgetMeta(widget: ContentWidget) {
  return {
    "openai/outputTemplate": widget.templateUri, // uri of the registered resource
    "openai/toolInvocation/invoking": widget.invoking, // text to display when the tool is invoked
    "openai/toolInvocation/invoked": widget.invoked, // text to display when the tool is invoked
    "openai/widgetAccessible": widget.accessible, // allows to execute tool calls from the widget (turn on if necessary)
    "openai/resultCanProduceWidget": widget.resultCanProduceWidget, // informs the modal that the result of the tool call can produce a widget
  } as const;
}

const registerDisplayTimeDataTools = async (server: McpServer) => {
  const html = await getAppsSdkCompatibleHtml(
    baseURL,
    "/widgets/display-time-data"
  );

  // Shared widget configuration
  const displayTimeDataWidget: ContentWidget = {
    id: "display-time-data",
    title: "Display Time Data",
    templateUri: "ui://widget/display-time-data.html",
    invoking: "Loading time data...",
    invoked: "Time data loaded",
    html: html,
    description: "Widget for displaying time data",
    widgetDomain: baseURL,
    prefersBorder: true,
    accessible: true,
    resultCanProduceWidget: true,
  };

  const widgetTemplateDescription = `
      Displays the current time and date.
      `;

  // Register the shared widget resource
  server.registerResource(
    "display-time-data-widget",
    displayTimeDataWidget.templateUri,
    {
      title: "Display Time Data",
      description: widgetTemplateDescription,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": widgetTemplateDescription,
        "openai/widgetPrefersBorder": displayTimeDataWidget.prefersBorder,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${displayTimeDataWidget.html}</html>`,
          _meta: {
            "openai/widgetPrefersBorder": displayTimeDataWidget.prefersBorder,
            "openai/widgetDomain": displayTimeDataWidget.widgetDomain,
            // "openai/widgetCSP":
            //   NODE_ENV === "production"
            //     ? {
            //         connect_domains: [
            //           baseURL,
            //           POSTHOST_CSP,
            //           GOOGLE_MAPS_API_URL,
            //           OWNRIGHT_API_URL,
            //           OWNRIGHT_CLIENT_URL,
            //         ],
            //         resource_domains: [baseURL, GOOGLE_MAPS_API_URL],
            //       }
            //     : undefined,
          },
        },
      ],
    })
  );

  // ============================================================================
  // TOOL 1: display-time-data
  // ============================================================================
  const startInquiryDescription = `
    Display the current time and date.
  `;

  server.registerTool(
    "display-time-data",
    {
      title: "Start Property Closing Inquiry",
      description: startInquiryDescription,
      // inputSchema: propertyClosingInquiryInputSchema,
      // outputSchema: propertyClosingInquiryOutputSchema,

      _meta: widgetMeta(displayTimeDataWidget),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: true,
      },
    },
    async () => {
      return {
        content: [
          {
            type: "text" as const,
            text: "The current time and date is " + new Date().toLocaleString(),
          },
        ],

        _meta: widgetMeta(displayTimeDataWidget),
      };
    }
  );
};

export const dateTimeThreeRegister = async (server: McpServer) => {
  await registerDisplayTimeDataTools(server);
};
