import { baseURL } from "@/baseUrl";
import {
  GOOGLE_MAPS_API_URL,
  NODE_ENV,
  OWNRIGHT_API_URL,
  OWNRIGHT_CLIENT_URL,
  POSTHOST_CSP,
} from "@/lib/constants";

import { getAppsSdkCompatibleHtml } from "@/lib/utils";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";

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

// Shared input schema for both tools
export const timeDataInputSchema = z.object({
  type: z
    .enum(["date", "time"])
    .describe(
      "The type of time data to display. Options: date (for the current date), time (for the current time)."
    ),
});

// Shared output schema for both tools
export const timeDataOutputSchema = z.object({
  input: timeDataInputSchema.describe("The input data for the time data"),
  time: z.string().optional().describe("The current time"),
  date: z.string().optional().describe("The current date"),
});

const registerDisplayTimeDataTools = async (server: McpServer) => {
  const html = await getAppsSdkCompatibleHtml(
    baseURL,
    "/widgets/display-time-data"
  );

  // Shared widget configuration
  const displayTimeDataWidget: ContentWidget = {
    id: "display-date-or-time-data",
    title: "Display Date or Time Data",
    templateUri: "ui://widget/display-time-data.html",
    invoking: "Loading date or time data...",
    invoked: "Date or time data loaded",
    html: html,
    description: "Widget for displaying date or time data",
    widgetDomain: baseURL,
    prefersBorder: true,
    accessible: true,
    resultCanProduceWidget: true,
  };

  const widgetTemplateDescription = `
      Displays the current date or time.
      `;

  // Register the shared widget resource
  server.registerResource(
    "display-date-or-time-data-widget",
    displayTimeDataWidget.templateUri,
    {
      title: "Display Date or Time Data",
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
            "openai/widgetCSP":
              NODE_ENV === "production"
                ? {
                    connect_domains: [
                      baseURL,
                      POSTHOST_CSP,
                      GOOGLE_MAPS_API_URL,
                      OWNRIGHT_API_URL,
                      OWNRIGHT_CLIENT_URL,
                    ],
                    resource_domains: [baseURL, GOOGLE_MAPS_API_URL],
                  }
                : undefined,
          },
        },
      ],
    })
  );

  // ============================================================================
  // TOOL 1: display-time-data
  // ============================================================================
  const startInquiryDescription = `
    Display the current date or time in a beautifully formatted, interactive widget.
    This tool retrieves and presents temporal information based on the user's request.
    
    Use this tool ONLY when:
    - User explicitly asks for the current date
    - User explicitly asks for the current time
    - User wants to know what day it is today
    - User asks "What time is it?" or similar time-related questions
    - User needs to display temporal information in a visual widget format
    - User wants to see the date or time rendered in an interactive UI component
    - User asks about today's date for scheduling, planning, or reference purposes
    - User needs to confirm the current time for time-sensitive tasks
    - User wants a formatted display of date or time information
    - User asks questions like "What's today's date?", "Tell me the time", "What day is it?"
    
    DO NOT use this tool when:
    - User asks about a specific date in the past or future (this tool only shows CURRENT date/time)
    - User wants to convert between time zones (this tool shows local time only)
    - User wants to calculate time differences or durations
    - User wants to schedule events or set reminders (this is display-only)
    - User asks about historical dates or future predictions
    - User wants to compare dates or perform date arithmetic
    - User needs calendar functionality beyond simple date display
    - User wants countdown timers or elapsed time calculations
    - User asks about sunrise/sunset times or astronomical data
    - User needs date formatting in a specific custom format not provided by this tool
    
    This tool provides a simple, elegant way to display the current moment in time.
    The result is rendered as an interactive widget that can be embedded in the conversation.
    
    Technical Details:
    - Date format: Locale-aware date string (e.g., "1/9/2026" for US locale)
    - Time format: Locale-aware time string (e.g., "3:45:30 PM" for US locale)
    - The widget is accessible and supports screen readers
    - Results are generated at the moment of the tool call
    
    Parameters
    ----------
    - **type** (required): The type of temporal data to display
      - "date": Returns the current date in locale-aware format
      - "time": Returns the current time in locale-aware format
    
    Returns
    -------
    - input: Echo of the input parameters for reference
      - type: The requested type ("date" or "time")
    - time: The current time string (only present when type is "time")
    - date: The current date string (only present when type is "date")
    - A visual widget displaying the requested temporal information

    Examples
    -------
    - Use Case 1: User asks for the current time
      - User message: "What time is it right now?"
      - Parameters: {type: "time"}
      - Expected output: Current time displayed in a widget (e.g., "3:45:30 PM")

    - Use Case 2: User asks for today's date
      - User message: "What's today's date?"
      - Parameters: {type: "date"}
      - Expected output: Current date displayed in a widget (e.g., "1/9/2026")

    - Use Case 3: User needs the date for a document
      - User message: "I need to put today's date on this form, what is it?"
      - Parameters: {type: "date"}
      - Expected output: Current date for the user to reference

    - Use Case 4: User checking time for a meeting
      - User message: "Show me the current time, I have a meeting soon"
      - Parameters: {type: "time"}
      - Expected output: Current time displayed so user can check their schedule

    - Use Case 5: Casual time inquiry
      - User message: "Hey, what day is today?"
      - Parameters: {type: "date"}
      - Expected output: Current date in a friendly widget display

    - Use Case 6: Time check with urgency
      - User message: "Quick, what time is it?"
      - Parameters: {type: "time"}
      - Expected output: Immediate display of current time
  `;

  server.registerTool(
    "display-date-or-time-data",
    {
      title: "Display Date or Time Data",
      description: startInquiryDescription,
      inputSchema: timeDataInputSchema.shape,
      outputSchema: timeDataOutputSchema.shape,

      _meta: widgetMeta(displayTimeDataWidget),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
    },
    async ({ type }) => {
      let time = undefined;
      let date = undefined;
      if (type === "time") {
        time = new Date().toLocaleTimeString();
      } else if (type === "date") {
        date = new Date().toLocaleDateString();
      }

      const textResponse =
        type === "time"
          ? "The current time is " + time
          : "The current date is " + date;

      return {
        content: [
          {
            type: "text" as const,
            text: textResponse,
          },
        ],
        structuredContent: {
          input: { type },
          time,
          date,
        },

        _meta: widgetMeta(displayTimeDataWidget),
      };
    }
  );
};

export const dateTimeThreeRegister = async (server: McpServer) => {
  await registerDisplayTimeDataTools(server);
};
