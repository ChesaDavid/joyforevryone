import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { title } = await req.json();

  if (!title) return NextResponse.json({ error: "No title provided" }, { status: 400 });

  const prompt = `Write a short, clear project description for a project at our No-profit organization named JoyForEveryone
       that has diffrent projects with the children placed at a child shelter and this project is intitled: "${title}" 
       The description should be engaging, informative, and suitable for a general audience. if the title is in romanian, the description should be in romanian as well.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
    });

    const description = completion.choices[0].message.content;
    return NextResponse.json({ description });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "AI generation failed." }, { status: 500 });
  }
}
