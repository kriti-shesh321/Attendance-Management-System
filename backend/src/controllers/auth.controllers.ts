import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { Role } from "@prisma/client";

import { loginSchema, registerSchema, } from "../validations/auth.validations";
import { comparePassword, hashPassword, } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { validateInstitution } from "../utils/institution";

// @desc Register a new user
// @route POST /api/v1/auth/register
// @access Public
export const register = async (req: Request, res: Response) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const existingUser =
            await prisma.user.findUnique({
                where: {
                    email: validatedData.email,
                },
            });

        if (existingUser) {
            return res.status(400).json({
                message:
                    "Invalid credentials.",
            });
        }

        let institutionId = validatedData.institution_id || null;

        // Global roles cannot have institution_id
        if (
            validatedData.role === Role.programme_manager ||
            validatedData.role === Role.monitoring_officer
        ) {
            institutionId = null;
        }

        // Institution-bound roles must have valid institution
        if (
            validatedData.role === Role.student ||
            validatedData.role === Role.trainer ||
            validatedData.role === Role.institution
        ) {
            if (!institutionId) {
                return res.status(400).json({
                    message: "institution_id is required for this role.",
                });
            }

            const institution =
                await validateInstitution(
                    institutionId
                );

            if (!institution) {
                return res.status(404).json({
                    message: "Institution not found.",
                });
            }
        }

        const hashedPassword = await hashPassword(validatedData.password);

        const user =
            await prisma.user.create({
                data: {
                    name: validatedData.name,
                    email:
                        validatedData.email,
                    password_hash:
                        hashedPassword,
                    role: validatedData.role,
                    institution_id:
                        institutionId,
                },
            });

        return res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            institution_id: user.institution_id,
            created_at: user.created_at,
            updated_at: user.updated_at
        });
    } catch (error: any) {
        console.error("Error registering: ", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

// @desc Login user and return JWT token
// @route POST /api/v1/auth/login
// @access Public
export const login = async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const user =
            await prisma.user.findUnique({
                where: {
                    email: validatedData.email,
                },
            });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const isPasswordValid =
            await comparePassword(
                validatedData.password,
                user.password_hash
            );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const token = generateToken(
            {
                userId: user.id,
                role: user.role
            }
        );

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                institution_id: user.institution_id,
                created_at: user.created_at,
                updated_at: user.updated_at
            },
        });
    } catch (error: any) {
        console.error("Error during logging in: ", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

// @desc Get current logged in user
// @route GET /api/v1/auth/me
// @access Private
export const getMe = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                institution: {
                    omit: {
                        created_at: true,
                        updated_at: true,
                    }
                },
            },
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        return res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            institution: user.institution,
            created_at: user.created_at,
            updated_at: user.updated_at
        });
    } catch (error) {
        console.error("Error fetching user: ", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};