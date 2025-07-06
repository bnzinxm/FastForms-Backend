// controllers/users/user.controller.ts
import { Request, Response } from "express";
import db from "../../config/database";

export const UserController: any = {
  // GET /:userId
  getUserById: async (req: Request, res: Response) => {
    const { userId } = req.query;

    try {
      // Buscar usuário no banco
      const [rows] = await db.query(
        "SELECT id, full_name, email, created_at FROM users WHERE id = ?",
        [userId]
      );

      if (!rows || (Array.isArray(rows) && rows.length === 0)) {
        return res.status(404).json({
          status: "fail",
          code: 404,
          message: "Usuário não encontrado.",
        });
      }

      const user: any = Array.isArray(rows) ? rows[0] : rows;

      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Dados do usuário carregados com sucesso.",
        data: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          createdAt: user.created_at,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "error",
        code: 500,
        message: "Erro ao buscar dados do usuário.",
        errorDetails: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  },
};