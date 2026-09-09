import bcrypt from "bcrypt";
import { prisma } from "../prisma/client.js";
import type { Request, Response } from "express";
import { registerUserSchema } from "../schemas/user.schema.js";
import { sendValidationError } from "../utils/http-responses.js";
import { isPrismaDuplicate } from "../utils/prisma-errors.js";

export async function registerUser(req: Request, res: Response): Promise<void> {
  //  step 1: validate input with Zod

  const parsed = registerUserSchema.safeParse(req.body);
  if(!parsed.success){
    sendValidationError(res, parsed.error);
    return;
  }

  const { email, password } = parsed.data;

  //  step 2: hash password with bcrypt

  const hashedPassword = await bcrypt.hash(password, 10);
  
  //  step 3: register user in the database with Prisma

  try {
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword
      },
      select: { id: true, email: true, createdAt: true }
    })

    res.status(201).json(user);
  } catch (error) {
    if(isPrismaDuplicate(error)){
      res.status(409).json({
        message: "An account with this email already exists."
      })
      return;
    }
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error"  
    })
  }
}