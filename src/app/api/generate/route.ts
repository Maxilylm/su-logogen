import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { brandName, description, style, color } = await request.json();

    if (!brandName || !description) {
      return Response.json(
        { error: "Brand name and description are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Server configuration error: missing API key" },
        { status: 500 }
      );
    }

    const colorInstruction = color
      ? `Use ${color} as the primary color, with complementary colors.`
      : "Choose colors that match the brand personality.";

    const prompt = `Generate 3 different SVG logo concepts for a brand. Each must be valid SVG XML with viewBox="0 0 200 200" and width="200" height="200". Use ${style} style. ${colorInstruction}

Brand name: "${brandName}"
Brand description: "${description}"

CRITICAL RULES:
- Each SVG must be COMPLETE and SELF-CONTAINED
- Use shapes: circle, rect, path, polygon, text, line, ellipse
- Use gradients (linearGradient, radialGradient) with <defs> for visual richness
- Use transforms for creative positioning
- Include the brand name or initials as <text> elements with font-family="Arial, Helvetica, sans-serif"
- Make each logo CREATIVE, DISTINCT, and PROFESSIONAL
- NO external references, NO images, NO scripts
- Each SVG must start with <svg and end with </svg>
- Keep SVGs under 2000 characters each

Return ONLY a valid JSON array of 3 objects with this exact structure:
[{"name":"concept name","svg":"<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 200 200\\" width=\\"200\\" height=\\"200\\">...</svg>","description":"brief description of the concept"}]

Return ONLY the JSON array, no markdown, no code blocks, no explanation.`;

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are an expert SVG logo designer. You output ONLY valid JSON arrays containing SVG code. No markdown, no code blocks, no extra text. Every SVG must be well-formed XML.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.9,
          max_tokens: 4096,
        }),
      }
    );

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq API error:", errText);
      return Response.json(
        { error: "AI service error. Please try again." },
        { status: 502 }
      );
    }

    const data = await groqResponse.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return Response.json(
        { error: "Empty response from AI. Please try again." },
        { status: 502 }
      );
    }

    // Try to extract JSON from the response
    let logos;
    try {
      // Try direct parse first
      logos = JSON.parse(content);
    } catch {
      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        logos = JSON.parse(jsonMatch[0]);
      } else {
        console.error("Failed to parse AI response:", content);
        return Response.json(
          { error: "Could not parse AI response. Please try again." },
          { status: 502 }
        );
      }
    }

    // Sanitize SVGs - strip any script tags or event handlers
    const sanitized = logos.map(
      (logo: { name: string; svg: string; description: string }) => ({
        name: logo.name || "Untitled Concept",
        description: logo.description || "",
        svg: logo.svg
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/on\w+="[^"]*"/gi, "")
          .replace(/on\w+='[^']*'/gi, "")
          .replace(/javascript:/gi, ""),
      })
    );

    return Response.json({ logos: sanitized });
  } catch (error) {
    console.error("Generate error:", error);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
