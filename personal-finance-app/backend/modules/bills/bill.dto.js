const { z } = require("zod");

const colors = [
  "--green",
  "--cyan",
  "--yellow",
  "--navy",
  "--red",
  "--purple",
  "--turquoise",
  "--brown",
  "--magenta",
  "--blue",
  "--army",
  "--gold",
  "--orange",
];

const billDto = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Bill name is required")
    .max(100)
    .transform((name) => name.replace(/\s+/g, " ")),
  amount: z.coerce.number().finite().positive("Amount must be greater than 0"),
  dueDay: z.coerce
    .number()
    .int()
    .min(1, "Due day must be between 1 and 31")
    .max(31, "Due day must be between 1 and 31"),
  color: z.enum(colors),
  isPaid: z.boolean().default(false),
});

const billStatusDto = z.object({
  isPaid: z.boolean(),
});

module.exports = { billDto, billStatusDto };
