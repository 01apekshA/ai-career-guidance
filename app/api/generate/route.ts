import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// 🔹 OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// 🔹 Supabase SERVER client (SERVICE ROLE KEY REQUIRED)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { education, skills, interest } = await req.json();

    if (!education || !skills || !interest) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔹 AI PROMPT
    const prompt = `
You are an AI career guidance expert.

Education: ${education}
Skills: ${skills}
Interest: ${interest}

Provide:
1. Career options
2. Required skills
3. Salary range
4. Learning roadmap
`;

    // 🔹 OPENAI CALL
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const ai_response =
      completion.choices[0]?.message?.content ?? "No response generated";

    // 🔹 INSERT INTO SUPABASE
    const { error } = await supabase.from("user_requests").insert({
      education,
      skills,
      interest,
      ai_response,
    });

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json(
        { error: "Failed to save data to database" },
        { status: 500 }
      );
    }

    // 🔹 RETURN TO FRONTEND
    return NextResponse.json({ ai_response });
  } catch (error: any) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
