import { Router, Request, Response } from "express";
import { z } from "zod";
import { query } from "../db/pool";
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(5, "Message must be at least 5 characters")
});

router.post(
  "/",
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many messages sent. Please wait before contacting again." }),
  async (req: Request, res: Response) => {
    try {
      const parsed = contactSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message }
        });
      }

      const { name, email, phone, subject, message } = parsed.data;

      await query(
        `INSERT INTO contact_messages (sender_name, sender_email, phone, subject, message, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, 0, NOW())`,
        [name, email, phone || null, subject || "General Inquiry", message]
      );

      // Create notification for admin
      const [admins]: [any[], any] = await query("SELECT id FROM users WHERE role_id = 1");
      for (const adm of admins) {
        await query(
          `INSERT INTO notifications (user_id, type, title, message, link)
           VALUES (?, 'Message', 'New Contact Message', ?, '#admin')`,
          [adm.id, `New message from ${name} (${email})`]
        );
      }

      return res.status(201).json({
        success: true,
        message: "Your message has been dispatched successfully. The academy team will reply shortly."
      });
    } catch (err: any) {
      console.error("[Contact Form Error]:", err);
      return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to submit message." } });
    }
  }
);

export default router;
