import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { description } = await req.json();

  if (!description) return NextResponse.json({ error: "No content provided" }, { status: 400 });

  const prompt = `Summarize the following project description in one sentence:\n\n${description}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 60,
    });

    const summary = completion.choices[0].message.content;
    return NextResponse.json({ summary });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Summarization failed." }, { status: 500 });
  }
}
