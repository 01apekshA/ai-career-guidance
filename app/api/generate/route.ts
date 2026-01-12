import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

/* ------------------ SAFE INITIALIZERS ------------------ */

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  return new OpenAI({ apiKey });
}

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables are missing");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

/* ------------------ API HANDLER ------------------ */

export async function POST(req: NextRequest) {
  try {
    const { education, skills, interest } = await req.json();

    if (!education || !skills || !interest) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const openai = getOpenAI();
    const supabase = getSupabase();

    /* -------- AI PROMPT -------- */
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

    /* -------- OPENAI CALL -------- */
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const ai_response =
      completion.choices[0]?.message?.content ?? "No response generated";

    /* -------- SAVE TO SUPABASE -------- */
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

    return NextResponse.json({ ai_response });
  } catch (error: unknown) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
