import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.get("/movies", async (req, res)=>{
    const movies = await prisma.movie.findMany({
        where: { id: 4 }
        //to select multiple elements
        //where: { id: { in: [1, 4, 12] } } 
    });
    res.json(movies);
});

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
});