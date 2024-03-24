import express from "express";
import { PrismaClient } from "@prisma/client";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

app.put("/movies/:id", async (req, res) => {
    //pegar o id do registro que vai ser atualizado
    const id = Number(req.params.id);

    try{
        //verificar se o id existe na tabela
        const movie = await prisma.movie.findUnique({
            where: { id }
        });

        if(!movie){ 
            return res.status(404).send({ message: "fiilme nao encontrado" });
        }

        const data = { ...req.body };
        console.log(data);
        //verifica se vem uma date ou nao na requisição
        data.release_date = data.release_date ? new Date(data.release_date) : undefined;
        
        //pegar os dados do filme que sera atualizado e atualizar ele no prisma
        await prisma.movie.update({
            where: { id },
            data: data
        }); 
    }catch(error){
        return res.status(500).send({ message: "falha ao atualizar o regstro do filme"});
    }
    //retorna o status correto informando que o filme foi atualizado
    res.status(200).send("atualizacao de certo");
});

app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try{
        const movie = await prisma.movie.findUnique({ where: { id } });

        if(!movie){ 
            return res.status(404).send({ message: "filme nao encontrado" });
        }

        await prisma.movie.delete({ where: { id } });
        
    }catch(error){
        return res.status(500).send({ message: "nao foi possivel remover o filme" });
    }

    res.status(200).send();
});

app.get("/movies/:genreName", async (req, res)=>{
    try{
        //receber o nome do genero pelos parametros da rota
        const genreName = req.params.genreName;

        //filtrar os filmes do banco de dados pelo genero
        const moviesFilteredByGenre = await prisma.movie.findMany({
            include:{
                genres: true,
                languages: true
            },
            where: {
                genres:{
                    name: { 
                        equals: genreName,
                        mode: "insensitive"
                    }
                }
            }
        });
        res.status(200).send(moviesFilteredByGenre);
    }catch(error){
        return res.status(500).send({ message: "falha ao filtrar os filmes" });
    } 
});

app.get("/movies/:language", async (req, res)=>{
   
    //receber o nome do genero pelos parametros da rota
    const languageName = req.params.language;
    console.log(languageName);
        
    //filtrar os filmes do banco de dados pelo genero
    const moviesFilteredByLanguage = await prisma.movie.findMany({
        include:{
            genres: true,
            languages: true
        },
        where: {
            languages:{
                name: { 
                    equals: languageName,
                    mode: "insensitive"
                }
            }
        }
    });
    res.status(200).send(moviesFilteredByLanguage);
   
});

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
});