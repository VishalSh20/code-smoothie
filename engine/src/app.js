import express from 'express';
import cors from 'cors';
import StatusRoutes from './routes/status.routes.js';
import SubmissionRoutes from './routes/submission.routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/status", StatusRoutes);
app.use("/submission", SubmissionRoutes);

export default app;