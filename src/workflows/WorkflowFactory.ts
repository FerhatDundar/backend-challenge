import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { DataSource } from 'typeorm';
import { Workflow } from '../models/Workflow';
import { Task, TaskType } from '../models/Task';
import {TaskStatus} from "../workers/taskRunner";

export enum WorkflowStatus {
    Initial = 'initial',
    InProgress = 'in_progress',
    Completed = 'completed',
    Failed = 'failed'
}

interface WorkflowStep {
    taskType: string;
    stepNumber: number;
    dependsOn?: string[];
}

interface WorkflowDefinition {
    name: string;
    steps: WorkflowStep[];
}

export class WorkflowFactory {
    constructor(private dataSource: DataSource) {}

    /**
     * Creates a workflow by reading a YAML file and constructing the Workflow and Task entities.
     * @param filePath - Path to the YAML file.
     * @param clientId - Client identifier for the workflow.
     * @param geoJson - The geoJson data string for tasks (customize as needed).
     * @returns A promise that resolves to the created Workflow.
     */
    async createWorkflowFromYAML(filePath: string, clientId: string, geoJson: string): Promise<Workflow> {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const workflowDef = yaml.load(fileContent) as WorkflowDefinition;
        const workflowRepository = this.dataSource.getRepository(Workflow);
        const taskRepository = this.dataSource.getRepository(Task);
        const workflow = new Workflow();

        workflow.clientId = clientId;
        workflow.status = WorkflowStatus.Initial;

        const savedWorkflow = await workflowRepository.save(workflow);

        const tasks: Task[] = workflowDef.steps.map(step => {
            const task = new Task();
            task.clientId = clientId;
            task.geoJson = geoJson;
            task.status = TaskStatus.Queued;
            task.taskType = step.taskType as TaskType;
            task.stepNumber = step.stepNumber;
            task.workflow = savedWorkflow;
            task.dependsOn = [];
            task.dependents = [];
            return task;
        });

        for (const task of tasks) {
            const dependsOn = workflowDef.steps.find(step => step.taskType === task.taskType)?.dependsOn;
            if (dependsOn) {
                task.dependsOn = tasks.filter(t => dependsOn.includes(t.taskType));
                // Don't set up bidirectional relationships here to avoid duplicates
                // The dependents will be automatically managed by TypeORM
            }
        }

        const circularDependencies = tasks.filter(t1 => t1.dependsOn.some(t2 => t2.dependsOn.some(t3 => t3.taskType === t2.taskType)));
        if (circularDependencies.length > 0) {
            throw new Error(`Circular dependencies found: ${circularDependencies.map(t => t.taskType).join(', ')}`);
        }

        await taskRepository.save(tasks);

        return savedWorkflow;
    }
}