import app from './app.js';
import { connectDB } from './config/db.js';
import { startExportWorker } from './queues/exportQueue.js';
import {
  startDeadlineReminderWorker,
  scheduleDeadlineReminders,
} from './queues/deadlineReminderQueue.js';

const PORT = process.env.PORT || 5000;

await connectDB();
startExportWorker();
startDeadlineReminderWorker();
await scheduleDeadlineReminders();
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
