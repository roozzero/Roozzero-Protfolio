import { Router, Request, Response } from "express";
import { query } from "../db/pool";

const router = Router();

// -------------------------------------------------------------
// GET /api/certificates/verify/:token (Public)
// -------------------------------------------------------------
router.get("/verify/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const [rows]: [any[], any] = await query(`
      SELECT c.certificate_number, c.student_name, c.course_title, c.gpa, c.issue_date, c.status, c.created_at
      FROM certificates c
      WHERE c.verification_token = ? OR c.certificate_number = ?
      LIMIT 1
    `, [token, token]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "CERTIFICATE_NOT_FOUND",
          message: "No verified certificate matching this identifier was found in our registry."
        }
      });
    }

    const cert = rows[0];
    return res.json({
      success: true,
      data: {
        verified: cert.status === "Approved",
        certificateNumber: cert.certificate_number,
        studentName: cert.student_name,
        courseTitle: cert.course_title,
        gpa: cert.gpa,
        issueDate: cert.issue_date,
        status: cert.status
      }
    });
  } catch (err: any) {
    console.error("[Certificate Verification Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to verify certificate." } });
  }
});

export default router;
