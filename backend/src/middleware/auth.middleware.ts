import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

import jwt from "jsonwebtoken";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader =
            req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as {
            userId: string;
            role: Role;
        };

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token",
        });
    }
};