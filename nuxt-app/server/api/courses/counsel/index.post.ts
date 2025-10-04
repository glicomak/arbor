import { GoogleGenAI } from "@google/genai"
import { db } from "~/../src/db/db";
import { coursesTable, programsTable, targetsTable, weeksTable } from "~/../src/db/schema";
import { asc, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const requirements = body.requirements.map(item => 
      `Question: ${item.question}\nAnswer: ${item.answer}\n`
    ).join('\n');

    const prompt = `
You are an AI course (collection of weeks, each week being a collection of targets) designer in an online university.
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

If you believe that you have a reasonable amount of information already, generate the course object.
Description should not exceed 20-30 words.
Course source should be a specific book that would cover most of the course's concepts.
Target source should either be a chapter in a particular book (preferably the course book, in which case mention that it is the course book without the name of the book) or an online resource.
Credits is the number of weeks divided by 4, so it should vary between 1 and 3 ideally.
Week name must not contain the word 'week' or the index of the week.
Every concept that the user must learn should be listed as a separate target.
The schema for the course object is given below.

{
  course: {
    name: string,
    description: string,
    source: string,
    credits: integer,
    weeks: [{
      name: string,
      targets: [{
        text: string,
        source: string
      }]
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
    } else if ("course" in response) {
      const { weeks, ...course } = response.course;

      const defaultProgram = await db.query.programsTable.findFirst({
        where: eq(programsTable.isDefault, true),
      });
      const completeCourse = { ...course, programId: defaultProgram.id, status: "pending" };
      const [newCourse] = await db
        .insert(coursesTable)
        .values(completeCourse)
        .returning({ id: coursesTable.id });

      for (const [index, weekWithTargets] of weeks.entries()) {
        const { targets, ...week } = weekWithTargets;

        const completeWeek = { ...week, courseId: newCourse.id, serial: index+1 }
        const [newWeek] = await db
          .insert(weeksTable)
          .values(completeWeek)
          .returning({ id: weeksTable.id });
        
        const completeTargets = targets.map((target, index) => ({ ...target, weekId: newWeek.id, serial: index+1 }));
        await db
          .insert(targetsTable)
          .values(completeTargets)
      }

      return newCourse;
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to counsel a new course.",
      message: "An LLM error occurred."
    });
  }
})
