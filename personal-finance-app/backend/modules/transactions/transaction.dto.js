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

const createTransactionDto = z.object({
  receiverEmail: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid receiver email")),
  amount: z.coerce.number().finite().positive("Amount must be greater than 0"),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(50)
    .transform((category) => category.replace(/\s+/g, " ")),
  color: z.enum(colors),
});

module.exports = { createTransactionDto };
