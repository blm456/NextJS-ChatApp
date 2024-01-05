import { z } from "zod";

export const removeFriendValidator = z.object({
    delete: z.string(),
    chatId: z.string()
})
