import { Router } from "express";
import { z } from "zod";

export const aiRouter = Router();

const bioSchema = z.object({
  role: z.string().min(1, "Role is required"),
  skills: z.string().default(""),
  tone: z.enum(["Professional", "Creative", "Confident", "Friendly", "Minimalist"]).default("Professional"),
  company: z.string().default(""),
  name: z.string().default("")
});

// Template fragments by tone (fallback engine)
const openings: Record<string, string[]> = {
  Professional: [
    "A results-driven {role} with deep expertise in {skills}.",
    "Seasoned {role} specializing in {skills}, dedicated to delivering measurable impact.",
    "Accomplished {role} combining strategic vision with hands-on mastery of {skills}."
  ],
  Creative: [
    "Crafting meaningful experiences at the intersection of {skills} and human-centered design.",
    "A {role} who believes great {skills} can change how people feel, think, and connect.",
    "Turning bold ideas into reality — one pixel, one line, one {skills} project at a time."
  ],
  Confident: [
    "I build things that matter. {role} focused on {skills}.",
    "Relentlessly pushing boundaries in {skills}. {role} by craft, leader by choice.",
    "Top-tier {role} driving innovation across {skills} with proven execution."
  ],
  Friendly: [
    "Hey! I'm a {role} who loves working with {skills} and helping teams grow.",
    "Passionate {role} who geeks out over {skills} and genuinely enjoys solving hard problems.",
    "I'm a {role} at heart, always curious about {skills} and how to make things better."
  ],
  Minimalist: [
    "{role}. {skills}.",
    "{role} — {skills}.",
    "Building with {skills}."
  ]
};

const middles: Record<string, string[]> = {
  Professional: [
    "Known for architecting scalable solutions and mentoring high-performing teams.",
    "Passionate about operational excellence, continuous improvement, and data-driven decision-making.",
    "Bringing a track record of successful delivery across startups and enterprise environments."
  ],
  Creative: [
    "Inspired by minimalism, storytelling, and the details that make products unforgettable.",
    "Drawing from diverse influences to build experiences that resonate and delight.",
    "Believes that great work happens when curiosity meets craft."
  ],
  Confident: [
    "Trusted by industry leaders to deliver on ambitious timelines and complex requirements.",
    "Setting new standards in quality, speed, and strategic thinking.",
    "My work speaks for itself — shipped products, scaled teams, real outcomes."
  ],
  Friendly: [
    "When I'm not deep in code or design, you'll find me exploring new coffee spots or mentoring aspiring builders.",
    "I thrive in collaborative environments where everyone's ideas are heard.",
    "Always happy to chat about new projects, creative challenges, or just swap recommendations."
  ],
  Minimalist: [
    "Focus. Execution. Results.",
    "Less noise, more signal.",
    "Ship fast, learn faster."
  ]
};

const closings: Record<string, string[]> = {
  Professional: [
    "Let's connect and explore how we can create value together.",
    "Open to strategic collaborations and advisory opportunities.",
    "Reach out to discuss partnerships, projects, or speaking engagements."
  ],
  Creative: [
    "Always open to conversations about design, culture, and what's next.",
    "Let's create something beautiful together.",
    "If you've got a wild idea, I want to hear it."
  ],
  Confident: [
    "Ready to take on the next big challenge. Let's talk.",
    "Looking for impact, not incremental. Let's build.",
    "If you want the best, let's connect."
  ],
  Friendly: [
    "Feel free to reach out — I love meeting new people and exploring ideas!",
    "Drop me a message anytime, I'd love to hear from you.",
    "Let's grab a virtual coffee and chat!"
  ],
  Minimalist: [
    "Let's connect.",
    "Say hello.",
    "Open to work."
  ]
};

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value || key);
  }
  return result;
}

// Generate fallback options
function getFallbackOptions(data: z.infer<typeof bioSchema>): string[] {
  const tone = data.tone;
  const skills = data.skills || "technology and innovation";
  const vars = { role: data.role, skills, company: data.company, name: data.name };
  const results: string[] = [];

  const usedOpenings = new Set<number>();
  const usedMiddles = new Set<number>();
  const usedClosings = new Set<number>();

  for (let i = 0; i < 3; i++) {
    let oIdx: number, mIdx: number, cIdx: number;
    do { oIdx = Math.floor(Math.random() * openings[tone].length); } while (usedOpenings.has(oIdx) && usedOpenings.size < openings[tone].length);
    do { mIdx = Math.floor(Math.random() * middles[tone].length); } while (usedMiddles.has(mIdx) && usedMiddles.size < middles[tone].length);
    do { cIdx = Math.floor(Math.random() * closings[tone].length); } while (usedClosings.has(cIdx) && usedClosings.size < closings[tone].length);

    usedOpenings.add(oIdx);
    usedMiddles.add(mIdx);
    usedClosings.add(cIdx);

    const opening = fillTemplate(openings[tone][oIdx], vars);
    const middle = fillTemplate(middles[tone][mIdx], vars);
    const closing = fillTemplate(closings[tone][cIdx], vars);
    const companyLine = data.company ? ` Currently at ${data.company}.` : "";

    if (tone === "Minimalist") {
      results.push(`${opening}${companyLine} ${closing}`);
    } else {
      results.push(`${opening}${companyLine} ${middle} ${closing}`);
    }
  }
  return results;
}

// POST /api/ai/bio — Generate profile bios
aiRouter.post("/bio", async (request, response) => {
  try {
    const data = bioSchema.parse(request.body);
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `Write a short, engaging professional bio (max 3 sentences) for a digital profile page.
Details:
- Name: ${data.name || "A professional"}
- Role: ${data.role}
- Skills: ${data.skills || "technology and innovation"}
- Tone: ${data.tone}
${data.company ? `- Company: ${data.company}` : ""}

Return exactly three distinct variations. Place each variation on a new line. Do not prefix them with numbers or formatting.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const fetchRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (fetchRes.ok) {
          const resJson: any = await fetchRes.json();
          const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const options = text
            .split("\n")
            .map((s: string) => s.trim().replace(/^\d+\.\s*/, ""))
            .filter((s: string) => s.length > 10)
            .slice(0, 3);

          if (options.length > 0) {
            return response.json({
              tone: data.tone,
              role: data.role,
              options
            });
          }
        }
        console.warn("Gemini API returned error or empty response, falling back to templates.");
      } catch (err) {
        console.error("Gemini API call failed, falling back to templates:", err);
      }
    }

    // Fallback template builder
    const fallbackOptions = getFallbackOptions(data);
    response.json({
      tone: data.tone,
      role: data.role,
      options: fallbackOptions
    });

  } catch (error: any) {
    if (error.name === "ZodError") {
      return response.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("AI bio generation error:", error);
    response.status(500).json({ error: "Bio generation failed" });
  }
});
