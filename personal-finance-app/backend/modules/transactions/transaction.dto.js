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

const commonFields = {
  amount: z.coerce.number().finite().positive("Amount must be greater than 0"),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(50)
    .transform((category) => category.replace(/\s+/g, " ")),
  color: z.enum(colors),
};

const createTransactionDto = z.discriminatedUnion("transactionType", [
  z.object({
    ...commonFields,
    transactionType: z.literal("user"),
    receiverEmail: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Enter a valid receiver email")),
  }),
  z.object({
    ...commonFields,
    transactionType: z.literal("merchant"),
    counterpartyName: z
      .string()
      .trim()
      .min(1, "Shop or service name is required")
      .max(100)
      .transform((name) => name.replace(/\s+/g, " ")),
  }),
]);

module.exports = { createTransactionDto };
