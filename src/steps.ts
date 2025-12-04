import * as jsonc from 'jsonc-parser';
import { z } from 'zod';

const StepSchema = z.object({
  file: z.string(),
  content: z.string(),
  charsPerChange: z.number().optional(),
});

export type Step = z.infer<typeof StepSchema>;

export function parseSteps(content: string): Step[] {
  const parsed: unknown = jsonc.parse(content);
  const validationResult = StepSchema.array()
    .nonempty({ message: 'steps.json must contain at least one step' })
    .safeParse(parsed);

  if (!validationResult.success) {
    throw new Error(`Invalid steps.json: ${validationResult.error.message}`);
  }

  const steps = validationResult.data;

  return steps;
}
