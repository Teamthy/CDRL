import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT || 4000);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// rate limiter for contact submissions: default 6 requests per minute per IP
const rateLimiter = new RateLimiterMemory({ points: Number(process.env.RATE_LIMIT_POINTS || 6), duration: Number(process.env.RATE_LIMIT_DURATION || 60) });

// setup optional email transporter if SMTP env is present
let transporter: nodemailer.Transporter | null = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/v1/courses', async (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const track = typeof req.query.track === 'string' ? req.query.track : '';
    const courses = await prisma.course.findMany({
        where: {
            published: true,
            ...(track ? { track } : {}),
            ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { subtitle: { contains: search, mode: 'insensitive' } }] } : {}),
        },
        orderBy: { sortOrder: 'asc' },
    });
    res.json(courses);
});

app.get('/api/v1/courses/:slug', async (req, res) => {
    const course = await prisma.course.findUnique({ where: { slug: req.params.slug } });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
});

app.get('/api/v1/content/:page', async (req, res) => {
    const content = await prisma.siteContent.findUnique({ where: { pageKey: req.params.page } });
    if (!content) return res.status(404).json({ message: 'Content not found' });
    res.json(content.content);
});

const contactSchema = z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    organization: z.string().optional(),
    interest: z.string().min(1),
    message: z.string().min(1),
});

app.post('/api/v1/contact', async (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    try {
        await rateLimiter.consume(String(ip));
    } catch {
        return res.status(429).json({ message: 'Too many requests' });
    }
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
    const enquiry = await prisma.contactEnquiry.create({ data: parsed.data });

    // send optional notification email to site owner
    if (transporter) {
        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || 'no-reply@cdrl.local',
                to: process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
                subject: `New contact enquiry: ${parsed.data.interest}`,
                text: `Name: ${parsed.data.name}\nEmail: ${parsed.data.email || 'N/A'}\nOrganization: ${parsed.data.organization || 'N/A'}\nMessage:\n${parsed.data.message}`,
            });
        } catch (e) {
            console.error('Failed to send contact notification', e);
        }
    }
    res.status(201).json(enquiry);
});

app.get('/api/v1/learning-plan', async (req, res) => {
    const sessionId = req.headers['x-session-id'] as string | undefined;
    if (!sessionId) return res.json({ items: [] });
    const plan = await prisma.learningPlan.findUnique({ where: { sessionId }, include: { items: true } });
    res.json({ items: plan?.items ?? [] });
});

app.post('/api/v1/learning-plan/items', async (req, res) => {
    const sessionId = req.headers['x-session-id'] as string | undefined;
    const courseId = typeof req.body?.courseId === 'string' ? req.body.courseId : '';
    if (!sessionId || !courseId) return res.status(400).json({ message: 'Invalid request' });

    let plan = await prisma.learningPlan.findUnique({ where: { sessionId } });
    if (!plan) {
        plan = await prisma.learningPlan.create({ data: { sessionId } });
    }

    try {
        const item = await prisma.learningPlanItem.create({ data: { learningPlanId: plan.id, courseId } });
        res.status(201).json(item);
    } catch {
        res.status(409).json({ message: 'Course already exists in learning plan' });
    }
});

app.delete('/api/v1/learning-plan/items/:courseId', async (req, res) => {
    const sessionId = req.headers['x-session-id'] as string | undefined;
    if (!sessionId) return res.status(404).json({ message: 'Plan not found' });
    const plan = await prisma.learningPlan.findUnique({ where: { sessionId } });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    await prisma.learningPlanItem.deleteMany({ where: { learningPlanId: plan.id, courseId: req.params.courseId } });
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});
