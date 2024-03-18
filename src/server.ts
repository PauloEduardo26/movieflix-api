import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.get("/movies", async (_, res)=>{
    const movies = await prisma.movie.findMany({
        include:{
            genres: true,
            languages: true
        },
        //inclue as outras tabelas que tem relação com a movies
        
        orderBy:{
            title: "asc"
        }
        //ordena por ordem alfabetica
        //title: "desc" //decrescente

        //where: { id: 4 }
        //para selecionar multiplos elementos
        //where: { id: { in: [1, 4, 12] } } 
    });
    res.json(movies);
});

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
});