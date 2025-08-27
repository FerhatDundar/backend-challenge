import { Job } from './Job';
import { Task } from '../models/Task';
import { Result } from '../models/Result';

export class EmailNotificationJob implements Job {
    async run(task: Task, dependencyResults: Result[]): Promise<void> {
        console.log(`Sending email notification for task ${task.taskId}...`);
        // Perform notification work
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Email sent!');
    }
}