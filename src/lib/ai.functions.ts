import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

async function run(prompt: string, system?: string) {
  try {
    const { text } = await generateText({
      model: getModel(),
      system,
      prompt,
    });
    return { text };
  } catch (err: unknown) {
    const e = err as { statusCode?: number; status?: number; message?: string };
    const status = e?.statusCode ?? e?.status;
    if (status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (status === 402)
      throw new Error("AI credits exhausted. Add credits in your workspace billing settings.");
    throw new Error(e?.message ?? "AI request failed");
  }
}

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      recipient: z.string().min(1),
      subject: z.string().min(1),
      purpose: z.string().min(1),
      tone: z.enum(["formal", "friendly", "persuasive"]),
    }),
  )
  .handler(async ({ data }) => {
    const prompt = `Generate a ${data.tone} email based on:

Recipient: ${data.recipient}
Subject: ${data.subject}
Purpose: ${data.purpose}

Requirements:
- Professional language
- Clear structure
- Appropriate greeting and closing
- Concise and actionable

Return the email body only (no preamble, no markdown fences). Start with the greeting line.`;
    return run(prompt, "You are a professional business communication assistant.");
  });

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator(z.object({ notes: z.string().min(10) }))
  .handler(async ({ data }) => {
    const prompt = `Summarize the following meeting notes.

Extract:
1. Key discussion points
2. Decisions made
3. Action items
4. Deadlines

Format as a clean Markdown document with those four section headings.

Meeting Notes:
${data.notes}`;
    return run(prompt, "You are an expert meeting summarizer.");
  });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      tasks: z.string().min(1),
      hours: z.string().min(1),
      priority: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const prompt = `Create a productive daily schedule.

Tasks:
${data.tasks}

Available Hours:
${data.hours}

Priority Notes:
${data.priority}

Requirements:
- Prioritize important tasks first
- Include short breaks
- Estimate task durations
- Format as a time-block schedule: "HH:MM - HH:MM   Task name" (one per line)
- Add a "Notes" section at the end with brief productivity tips`;
    return run(prompt, "You are an expert productivity coach and scheduler.");
  });

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator(z.object({ topic: z.string().min(2) }))
  .handler(async ({ data }) => {
    const prompt = `Analyze the following topic.

Provide a Markdown report with these sections:
1. Summary
2. Key Insights
3. Opportunities
4. Recommendations

Topic:
${data.topic}`;
    return run(prompt, "You are an expert research analyst providing executive briefings.");
  });
