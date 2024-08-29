import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./config";

export const userAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];  // Extract token after "Bearer "
    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        //@ts-ignore
        req.id = verified.id;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
}


export const merchantAuthMiddleware = (req:Request,res:Response,next:NextFunction)=>{

    const token =  req.headers["Authorization"] as unknown as string;

    const verified  = jwt.verify(token,JWT_SECRET);

    if(verified){
        //@ts-ignore
        req.id = verified.id;
        next();
    }else{
        return res.status(403).json({message:"Unauthorized"});
    }

}
