import { Job } from "./Job";
import { Task, TaskType } from "../models/Task";
import { Result } from "../models/Result";
import { AppDataSource } from "../data-source";
import { TaskStatus } from "../workers/taskRunner";
import { Workflow } from "../models/Workflow";

export class ReportGenerationJob implements Job{
    async run(task: Task, dependencyResults: Result[]): Promise<string> {
        console.log("Starting report generation job");
        
        const resultRepository = AppDataSource.getRepository(Result);
        const workflowRepository = AppDataSource.getRepository(Workflow);

        const workflow = await workflowRepository.findOne({ 
            where: { workflowId: task.workflow.workflowId },
            relations: ['tasks']
        });
        if (!workflow) {
            throw new Error(`Workflow not found for workflowId: ${task.workflow.workflowId}`);
        }

        const tasks = workflow.tasks.filter(_task => _task.taskType != TaskType.Report);

        const hasNotCompletedTasks = tasks.some(_task => _task.status != TaskStatus.Completed);

        if (hasNotCompletedTasks) {
            throw new Error("Workflow has not completed tasks");
        }

        const report = { } as any;
        report.workflowId = workflow.workflowId;
        report.tasks = [];
        report.finalResult = "";

        for (const _task of tasks) {
            const taskResult = await resultRepository.findOne({
                where: { taskId: _task.taskId }
            });
            
            if (taskResult) {
                report.tasks.push({
                    taskId: _task.taskId,
                    type: _task.taskType,
                    output: taskResult.data,
                    status: _task.status,
                    errorMessage: _task.errorMessage
                });
                report.finalResult += `${taskResult.data}\n`;
            }
        }

        // Update the workflow's finalResult field as documented
        workflow.finalResult = report.finalResult;
        await workflowRepository.save(workflow);

        console.log("End of report generation job");
        
        // Return a string representation of the report as required by the interface
        return JSON.stringify(report);
    }
}