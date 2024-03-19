import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

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
app.post("/movies", async (req, res)=>{
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;
    //variaveis = parametros que vem da requisição
    try{
        //verifica se o filme a ser criado já existe na tabela
        const moviWithSameTitle = await prisma.movie.findFirst({
            where: { title: {equals: title, mode: "insensitive"} }
            //mode: "insensitive" faz com que nao haja diferenciação entre maiusculas e minusculas
        });
        if(moviWithSameTitle) return res.status(409).send({message: "ja existe esse filme cadastrado"});

        await prisma.movie.create({
            data: { 
                title: title, 
                genre_id,
                //é possivel omitir o genre_id: pois as variaveis tem o mesmo nome dos parametros
                language_id,
                oscar_count,
                release_date: new Date(release_date)
            }
        });
    }catch(error){
        return res.status(500).send({messsage: "falha ao cadastrar filme"});
    }
    
    res.status(201).send();
});

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
});