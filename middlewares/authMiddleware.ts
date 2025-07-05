import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    userId: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

const SECRET_KEY = process.env.JWT_SECRET;

export default function AuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): any {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token não fornecido." });
    }

    const [_, token] = authHeader.split(" ");

    if (!token) {
        return res.status(401).json({ message: "Token mal fornecido." });
    }

    try {
        const payload = jwt.verify(token, SECRET_KEY) as JwtPayload;
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token Inválido", error: error });
    }
}