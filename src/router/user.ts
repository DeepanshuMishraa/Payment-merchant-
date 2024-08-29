
import { JWT_SECRET } from "../config";
import { userAuthMiddleware } from "../middleware";
import prisma from "../utils/db";
import {Router}  from 'express';
import jwt from "jsonwebtoken";

export const userRouter = Router();

userRouter.post("/signup",async(req,res)=>{
        try{
            const {name,username,password} = req.body;
    // Validate the request body
    if(!name || !username || !password){
        return res.status(400).json({message:"Invalid request body"});
    }

    await prisma.$transaction(async tx=>{
        const user = await tx.user.create({
            data:{
                name,
                username,
                password,
            }
        })

        await tx.userAccount.create({
            data:{
                userId:user.id
            }
        })
    })

        return res.status(200).json({message:"User created successfully"});
    }catch(err){
        return res.status(500).json({message:"Internal server error"});
    }
});


userRouter.post("/signin", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Invalid request body" });
        }
        const user = await prisma.user.findFirst({
            where: {
                username,
                password
            }
        });
        if (!user) {
            return res.status(403).json({ message: "Unable to find your account" });
        }
        if (password !== user.password) {
            return res.status(403).json({ message: "Invalid Password" });
        }
        const token = jwt.sign({
            id: user.id,
        }, JWT_SECRET, { expiresIn: '1h' });  // Add an expiration time
        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Signin error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


userRouter.post("/transfer/merchant",userAuthMiddleware,async(req,res)=>{
    try{

        const {amount,mechantId} = req.body;

        if(!amount || !mechantId){
        return res.status(400).json({message:"Invalid request body"});

    // decremenet the user balance

    }

    }catch(err){
        return res.status(500).json({message:"Internal server error"});
    }

})


userRouter.post("/onramp",async(req,res)=>{
    const {userId,amount} = req.body;

    const account = await prisma.userAccount.update({
        where:{
            userId:userId
        },
        data:{
            balance:{
                increment:amount
            }
        }
    })

    return res.status(200).json({message:"Onramp successful",data:account});
})


userRouter.post("/transfer",userAuthMiddleware,async(req,res)=>{
    const {merchantId,amount} = req.body;
    //@ts-ignore
    const userId = req.id

    // very safe basically not double spending

  const paymentDone =   await prisma.$transaction(async tx=>{

        const userAccount = await tx.userAccount.findFirst({
            where:{
                userId:userId
            }
        })

        if((userAccount?.balance||0) < amount){
            return false;
        }

        await tx.userAccount.update({
            where:{
                userId:userId
            },
            data:{
                balance:{
                    decrement:amount
                }
            }
        })


        await tx.merchantAccount.update({
            where:{
                merchantId
            },
            data:{
                balance:{
                    increment:amount
                }
            }
        })

        return true;
    })

    if(paymentDone){
        return res.status(200).json({message:"Payment successful"});
    }

    return res.status(403).json({message:"Insufficient balance"});
})
