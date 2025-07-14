// controllers/users/user.controller.ts
import { Request, Response } from "express";
import db from "../../config/database";
import bcrypt from 'bcrypt';



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

  // GET /users?id=user_id/forms
  getUserForms: async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        code: 400,
        message: "O campo 'ID' não deve estar vazio."
      })
    }

    try {
      const [rows] = await db.query(
        "SELECT id, title, description, created_at FROM forms WHERE user_id = ?",
        [id]
      );

      if ((rows as any[]).length === 0) {
        return res.status(200).json({
          status: 'success',
          code: 200,
          message: "Esse usuário não tem nenhum formulário!"
        });
      }

      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Formulários do usuário carregados com sucesso!",
        data: rows,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        status: "error",
        code: 500,
        message: "Erro ao buscar formulários."
      });
    }
  },

  // GET /users/:id/forms?id=?
  getUserFormById: async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { formId } = req.query;

    if (!userId || !formId) {
      return res.status(400).json({
        status: 'fail',
        code: 400,
        message: "Os campos 'id' e 'formId' devem estar preenchidos!"
      });
    }

    try {
      const [rows]: any = await db.query("SELECT id, title, description, created_at FROM forms WHERE user_id = ? AND id = ?", [userId, formId]);

      return res.status(200).json({
        status: 'success',
        code: 200,
        message: "Formulário foi encontrado com sucesso!",
        data: rows[0]
      })
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        status: 'error',
        code: 500,
        message: "Erro ao buscar formulário do usuário."
      })
    }
  },

  // GET /users/:id/responses?formId=?
  getUserResponses: async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { formId } = req.query;

    if (!userId || !formId) {
      return res.status(400).json({
        status: 'fail',
        code: 400,
        message: "Os campos 'userId' e 'formId' devem ser preenchidos!"
      });
    }

    try {
      const [rows]: any = await db.query(
        "SELECT "
      )
    } catch (error) {

    }
  },

  // PATCH /users/:id/password?newPassword=
  changeUserPassword: async (req: Request, res: Response) => {
    const { id, newPassword } = req.query;

    if (!id || !newPassword) {
      return res.status(400).json({
        status: 'fail',
        code: 400,
        message: "Os inputs 'id' e 'newPassword' devem estar preenchidos!",
      });
    }

    try {
      const newPasswordHash = await bcrypt.hash(String(newPassword), 10);

      const [rows] = await db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [newPasswordHash, id]
      )

      if ((rows as any[]).length === 0) {
        return res.status(404).json({
          status: 'not-found',
          code: 404,
          message: `O usuário com id '${id}' não foi encontrado!`
        });
      }

      return res.status(200).json({
        status: 'success',
        code: 200,
        message: "Senha do usuário mudada com sucesso!"
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        status: 'error',
        code: 500,
        message: "Erro ao mudar a senha do usuário."
      });
    }
  },
};