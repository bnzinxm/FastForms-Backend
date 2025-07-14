import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../../config/database';

const FormController: any = {
    // GET /:formId

    getFormById: async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            const [rows] = await db.query("SELECT * FROM forms WHERE id = ?", [id]);

            if ((rows as any[]).length === 0) {
                return res.status(404).json({
                    status: "fail",
                    code: 404,
                    message: "Formulário não encontrado.",
                });
            };

            return res.status(200).json({
                status: 'success',
                code: 200,
                data: (rows as any[])[0]
            })
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                status: "error",
                code: 500,
                message: "Erro ao buscar o formulário.",
                errorDetails: error instanceof Error ? error.message : "Erro desconhecido",
            });
        }
    },

    // POST /

    createForm: async (req: Request, res: Response) => {
        const { title, description, userId, questions } = req.body;

        if (!title || !userId || !Array.isArray(questions)) {
          return res.status(400).json({
            status: "fail",
            code: 400,
            message: "Título, userId e questões são obrigatórios.",
          });
        }

        const connection = await db.getConnection(); // <-- await aqui

        try {
          await connection.beginTransaction();

          const id = uuidv4();
          await connection.query(
            "INSERT INTO forms (id, title, description, user_id) VALUES (?, ?, ?, ?)",
            [id, title, description, userId]
          );

          for (const question of questions) {
            const questionId = uuidv4();
            const questionText = question.content || question.content_text

            if (!questionText) {
                throw new Error("Uma das questões está sem texto (question_text).");
            }

            await connection.query(
              "INSERT INTO questions (id, form_id, question_text) VALUES (?, ?, ?)",
              [questionId, id, questionText]
            );
          }

          await connection.commit();

          return res.status(201).json({
            status: "success",
            code: 201,
            message: "Formulário criado com sucesso.",
            data: {
              id,
              title,
              description,
              userId,
              questions,
              createdAt: new Date().toISOString(),
            },
          });
        } catch (error) {
          await connection.rollback(); // rollback em caso de erro!
          console.error(error);
          return res.status(500).json({
            status: "error",
            code: 500,
            message: "Erro ao criar o formulário.",
            errorDetails: error instanceof Error ? error.message : "Erro desconhecido",
          });
        } finally {
          connection.release(); // importante liberar a conexão
        }
    },

    // DELETE /forms/:formId
    deleteForm: async (req: Request, res: Response) => {
        const { formId } = req.query;

        try {
            const [result] = await db.query("DELETE FROM forms WHERE id = ?", [formId]);

            if ((result as any).affectedRows === 0) {
                return res.status(404).json({
                status: "fail",
                code: 404,
                message: "Formulário não encontrado.",
                });
            }

            return res.status(200).json({
                status: "success",
                code: 200,
                message: "Formulário deletado com sucesso.",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: "error",
                code: 500,
                message: "Erro ao deletar o formulário.",
                errorDetails: error instanceof Error ? error.message : "Erro desconhecido",
            });
        }
    },
};

export default FormController;