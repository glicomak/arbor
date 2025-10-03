import { GoogleGenAI } from "@google/genai"
import { db } from "~/../src/db/db";
import { coursesTable, programsTable } from "~/../src/db/schema";
import { asc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const requirements = body.requirements.map(item => 
      `Question: ${item.question}\nAnswer: ${item.answer}\n`
    ).join('\n');

    const prompt = `
You are an AI program (collection of courses) designer in an online university.
Generate a program to satisfy user requirements, which are given as a series of QnAs.

${requirements}

If you want more information about the user's requirements, generate a requirements object, which consists of a list of questions.
You must only include new additional questions, and not the ones that have already been answered.
The object must be returned as a string that can be parsed and nothing else.
Questions must be addressed directly to the user - the person taking the course.
Do not overwhelm the user with requirement questions - the process must ideally not take them more than 2 minutes.

{
  questions: [string]
}

If you believe that you have a reasonable amount of information already, generate the program object.
Course descriptions are short (20-30 words at max) and for the user, whereas prompts are longer.
Source should be a specific book that would cover most of the course's concepts.
Design prompts in such a way that when passed to the course designer, there is no significant overlap.
Credits is the number of weeks divided by 4, so it should vary between 1 and 3 ideally.
The schema for the program object is given below.

{
  program: {
    name: string,
    description: string,
    courses: [{
      name: string,
      description: string,
      prompt: string,
      source: string,
      credits: integer
    }]
  }
}
    `;

    const ai = new GoogleGenAI({});
    const rawResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const parts = rawResponse.text.match(/```json\s*([\s\S]*?)\s*```/);
    let text;
    if (parts && parts[1]) {
        text = parts[1].trim();
    } else {
        text = rawResponse.text.trim();
    }
    const response = JSON.parse(text);

    if ("questions" in response) {
      return response;
    } else if ("program" in response) {
      const { courses, ...program } = response.program;

      const [newProgram] = await db
        .insert(programsTable)
        .values(program)
        .returning({ id: programsTable.id });

      const coursesWithProgramId = courses.map((course) => ({ ...course, programId: newProgram.id }));
      await db
        .insert(coursesTable)
        .values(coursesWithProgramId)

      return newProgram;
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to counsel a new program.",
      message: "An LLM error occurred."
    });
  }
})
