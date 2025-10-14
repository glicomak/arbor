import { GoogleGenAI } from "@google/genai"
import { db } from "~/../src/db/db";
import { coursesTable, targetsTable, weeksTable } from "~/../src/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const idString = event.context.params?.id;

  if (!idString) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Course ID is missing from the request path."
    });
  }

  const courseId = parseInt(idString, 10);
  if (isNaN(courseId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Invalid course ID format: ${idString}. Must be an integer.`
    });
  }

  let course;
  try {
    course = await db.query.coursesTable.findFirst({
      where: eq(coursesTable.id, courseId)
    });

    if (!course) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: `Course with ID ${courseId} not found.`
      });
    }
  } catch (error: any) {
    if (error.statusCode) {
        throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Failed to retrieve course data from the database."
    });
  }

  try {
    const courseData = `
Name: ${course.name}
Description: ${course.description}
Credits: ${course.credits}
    `;

    const body = await readBody(event);
    const requirements = ((body.requirements ?? []) as { question: string; answer: string }[])
      .map(item => `Question: ${item.question}\nAnswer: ${item.answer}\n`)
      .join('\n');

    const prompt = `
You are an AI course (collection of weeks, each week being a collection of targets) designer in an online university.
Generate a program to satisfy user requirements, which are given as a series of QnAs.

${courseData}

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
Target source should either be a chapter in a particular book (preferably the course book, in which case mention that it is the course book without the name of the book) or an online resource.
Credits is the number of weeks divided by 4, so it should vary between 1 and 3 ideally.
Week name must not contain the word 'week' or the index of the week.
Every concept that the user must learn should be listed as a separate target.
The schema for the course object is given below.

{
  course: {
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

    const rawResponseText = rawResponse?.text ?? "";
    const parts = rawResponseText.match(/```json\s*([\s\S]*?)\s*```/);
    let text;
    if (parts && parts[1]) {
        text = parts[1].trim();
    } else {
        text = rawResponseText.trim();
    }
    const response = JSON.parse(text);

    if ("questions" in response) {
      return response;
    } else if ("course" in response) {
      const { weeks } = response.course;

      await db
        .update(coursesTable)
        .set({ status: "pending" })
        .where(eq(coursesTable.id, courseId));

      for (const [index, weekWithTargets] of weeks.entries()) {
        const { targets, ...week } = weekWithTargets;

        const completeWeek = { ...week, courseId, serial: index+1 }
        const [newWeek] = await db
          .insert(weeksTable)
          .values(completeWeek)
          .returning({ id: weeksTable.id });
        
        const completeTargets = (targets as { text: string, source: string }[])
          .map((target, index) => ({ ...target, weekId: newWeek.id, serial: index+1 }));
        await db
          .insert(targetsTable)
          .values(completeTargets)
      }

      return { id: courseId };
    }
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to counsel a new course.",
      message: "An LLM error occurred."
    });
  }
})
