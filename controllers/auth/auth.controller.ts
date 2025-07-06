import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_supersecreto';

const AuthController: any = {
  register: async (req: Request, res: Response) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Dados inválidos para cadastro.',
        description: 'O email e a senha são campos obrigatórios para criar uma conta no FastForms.',
        received: { fullName, email, password: password ? '***' : undefined },
        errors: [
          !fullName && {
            field: 'fullName',
            message: 'O campo "fullName" não pode estar vazio e deve conter um nome válido.',
            example: 'Márcio Barbosa dos Santos'
          },
          !email && {
            field: 'email',
            message: 'O campo "email" não pode estar vazio e deve conter um email válido.',
            example: 'exemplo@fastforms.com'
          },
          !password && {
            field: 'password',
            message: 'O campo "password" é obrigatório e deve ter no mínimo 6 caracteres.',
            example: 'suaSenha123'
          }
        ].filter(Boolean),
        suggestion: 'Por favor, preencha todos os campos corretamente e tente novamente.',
        helpLinks: [
          { title: 'Como criar uma senha segura', url: 'https://fastforms.com/ajuda/senha-segura' },
          { title: 'Termos de uso FastForms', url: 'https://fastforms.com/termos' }
        ]
      });
    }

    try {
      const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if ((rows as any[]).length > 0) {
        return res.status(409).json({
          status: 'fail',
          code: 409,
          message: 'Conflito: usuário já cadastrado com este email.',
          description: 'O email informado já possui uma conta ativa no sistema FastForms.',
          suggestions: [
            'Use a opção de recuperação de senha para acessar sua conta.',
            'Cadastre-se com outro endereço de email válido.'
          ],
          helpLinks: [
            { title: 'Recuperar senha', url: 'https://fastforms.com/recuperar-senha' },
            { title: 'Suporte FastForms', url: 'https://fastforms.com/suporte' }
          ]
        });
      }

      const userId = uuidv4();

      const passwordHash = await bcrypt.hash(password, 10);
      await db.query('INSERT INTO users (id, full_name, email, password_hash) VALUES (?, ?, ?, ?)', [userId, fullName, email, passwordHash]);

      return res.status(201).json({
        status: 'success',
        code: 201,
        message: 'Conta criada com sucesso!',
        description: 'Seu cadastro foi realizado com sucesso no FastForms. Você já pode fazer login.',
        data: {
          id: userId,
          fullName,
          email,
          createdAt: new Date().toISOString()
        },
        nextSteps: [
          'Faça login na sua conta para acessar o painel FastForms.',
          'Configure seu perfil e preferências no menu de usuário.',
          'Confira a documentação para começar a criar formulários rapidamente.'
        ],
        helpLinks: [
          { title: 'Documentação FastForms', url: 'https://fastforms.com/docs' },
          { title: 'FAQ', url: 'https://fastforms.com/faq' }
        ]
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: 'error',
        code: 500,
        message: 'Erro interno do servidor.',
        description: 'Ocorreu um erro inesperado ao tentar cadastrar seu usuário. Por favor, tente novamente mais tarde.',
        errorDetails: error instanceof Error ? error.message : 'Erro desconhecido',
        suggestion: 'Se o problema persistir, entre em contato com o suporte.',
        helpLinks: [
          { title: 'Suporte FastForms', url: 'https://fastforms.com/suporte' }
        ]
      });
    }
  },

  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Dados inválidos para login.',
        description: 'É necessário informar email e senha para realizar o login.',
        received: { email, password: password ? '***' : undefined },
        errors: [
          !email && {
            field: 'email',
            message: 'O campo "email" não pode estar vazio.',
            example: 'exemplo@fastforms.com'
          },
          !password && {
            field: 'password',
            message: 'O campo "password" não pode estar vazio.',
            example: 'suaSenha123'
          }
        ].filter(Boolean),
        suggestion: 'Por favor, preencha os campos e tente novamente.',
        helpLinks: [
          { title: 'Esqueci minha senha', url: 'https://fastforms.com/recuperar-senha' },
          { title: 'Suporte FastForms', url: 'https://fastforms.com/suporte' }
        ]
      });
    }

    try {
      const [rows] = await db.query('SELECT id, password_hash FROM users WHERE email = ?', [email]);
      if ((rows as any[]).length === 0) {
        return res.status(401).json({
          status: 'fail',
          code: 401,
          message: 'Credenciais inválidas.',
          description: 'Nenhuma conta encontrada com o email informado.',
          suggestions: [
            'Verifique se digitou o email corretamente.',
            'Cadastre-se para criar uma nova conta.'
          ],
          helpLinks: [
            { title: 'Cadastro FastForms', url: 'https://fastforms.com/cadastro' },
            { title: 'Suporte FastForms', url: 'https://fastforms.com/suporte' }
          ]
        });
      }

      const user = (rows as any[])[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({
          status: 'fail',
          code: 401,
          message: 'Credenciais inválidas.',
          description: 'A senha informada está incorreta.',
          suggestions: [
            'Verifique sua senha.',
            'Use o link "Esqueci minha senha" para redefinir sua senha.'
          ],
          helpLinks: [
            { title: 'Redefinir senha', url: 'https://fastforms.com/recuperar-senha' },
            { title: 'Suporte FastForms', url: 'https://fastforms.com/suporte' }
          ]
        });
      }

      const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '1h' });

      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Login realizado com sucesso!',
        description: 'Token JWT gerado e válido por 1 hora. Use este token para acessar rotas protegidas.',
        data: {
          token,
          user: {
            id: user.id,
            email
          },
          expiresIn: '1h'
        },
        nextSteps: [
          'Guarde seu token de autenticação com segurança.',
          'Inclua o token no header Authorization nas próximas requisições.',
          'Explore o painel do FastForms e crie seus formulários personalizados.'
        ],
        helpLinks: [
          { title: 'Como usar o token JWT', url: 'https://fastforms.com/docs/jwt' },
          { title: 'Suporte FastForms', url: 'https://fastforms.com/suporte' }
        ]
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: 'error',
        code: 500,
        message: 'Erro interno do servidor.',
        description: 'Ocorreu um erro inesperado ao tentar realizar o login. Por favor, tente novamente mais tarde.',
        errorDetails: error instanceof Error ? error.message : 'Erro desconhecido',
        suggestion: 'Se o problema persistir, entre em contato com o suporte.',
        helpLinks: [
          { title: 'Suporte FastForms', url: 'https://fastforms.com/suporte' }
        ]
      });
    }
  }
};

export default AuthController;