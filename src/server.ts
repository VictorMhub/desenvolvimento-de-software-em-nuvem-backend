import { PrismaClient } from '@prisma/client';
import fastify from "fastify";
import cors from '@fastify/cors'
import { z } from 'zod'

const app = fastify();

app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
})

const prisma = new PrismaClient()

app.get("/tasks", async () => {
  const tasks = await prisma.task.findMany()

  return { tasks }
});

app.get("/tasks/:id", async (req, reply) => {
  const getTaskSchema = z.object({
    id: z.coerce.number().int().positive() // Converte para número
  })
  
  const { id } = getTaskSchema.parse(req.params)
  const task = await prisma.task.findUnique({ where: { id } })

  return task || reply.status(404).send({ message: 'Tarefa não encontrada' })
})

app.post("/tasks", async (req, reply) => {
  const createTaskSchema = z.object({
    title: z.string().min(1).max(50),
    description: z.string().min(1).max(255),
  })
  
  const { title, description } = createTaskSchema.parse(req.body)

  await prisma.task.create({
    data: { title, description }
  })

  return reply.status(201).send()
})

// Rota PUT (Atualizar tarefa)
app.put("/tasks/:id", async (req, reply) => {
  const paramsSchema = z.object({
    id: z.coerce.number().int().positive()
  })
  
  const bodySchema = z.object({
    title: z.string().min(1).max(50).optional(),
    description: z.string().min(1).max(255).optional(),
    isCompleted: z.boolean().optional()
  })

  const { id } = paramsSchema.parse(req.params)
  const updateData = bodySchema.parse(req.body)

  try {
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData
    })
    
    return updatedTask
  } catch (error) {
    return reply.status(404).send({ message: 'Tarefa não encontrada' })
  }
})

// Rota DELETE (Excluir tarefa)
app.delete("/tasks/:id", async (req, reply) => {
  const deleteTaskSchema = z.object({
    id: z.coerce.number().int().positive()
  })
  
  const { id } = deleteTaskSchema.parse(req.params)


  try {
    await prisma.task.delete({ where: { id } })
    return reply.status(204).send()
  } catch (error) {
    return reply.status(404).send({ message: 'Tarefa não encontrada' })
  }
})



app.listen({
  host: '0.0.0.0',
  port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(() => {
  console.log('Http Server Running');
  
})