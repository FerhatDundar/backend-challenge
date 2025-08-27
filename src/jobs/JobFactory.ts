import { Job } from './Job';
import { DataAnalysisJob } from './DataAnalysisJob';
import { EmailNotificationJob } from './EmailNotificationJob';
import { PolygonAreaJob } from './PolygonAreaJob';
import { ReportGenerationJob } from './ReportGenerationJob';
import { TaskType } from '../models/Task';

const jobMap: Record<TaskType, () => Job> = {
    'analysis': () => new DataAnalysisJob(),
    'notification': () => new EmailNotificationJob(),
    'polygonArea': () => new PolygonAreaJob(),
    'report': () => new ReportGenerationJob(),
};

export function getJobForTaskType(taskType: string): Job {
    const jobFactory = jobMap[taskType as TaskType];
    if (!jobFactory) {
        throw new Error(`No job found for task type: ${taskType}`);
    }
    return jobFactory();
}