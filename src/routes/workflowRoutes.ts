import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { WorkflowFactory, WorkflowStatus } from '../workflows/WorkflowFactory';
import { Workflow } from '../models/Workflow';
import { TaskStatus } from '../workers/taskRunner';

const router = Router()
const workflowRepository = AppDataSource.getRepository(Workflow);

router.get('/:id/status', async (req, res) => {
    const id = req.params.id;
    try {
        const workflow = await workflowRepository.findOne({ where: { workflowId: id }, relations: ['tasks'] });
        if (!workflow) {
            res.status(404).json({ message: `Workflow with id: ${id} not found` });
            return;
        }
        const completedTasks = workflow.tasks.filter(task => task.status === TaskStatus.Completed);
        const totalTasks = workflow.tasks.length;
        res.status(200).json({
            workflowId: workflow.workflowId,
            status: workflow.status,
            completedTasks: completedTasks.length,
            totalTasks: totalTasks
        });
    } catch (error: any) {
        console.error('Error getting workflow status:', error);
        res.status(500).json({ message: 'Failed to get workflow status' });
    }
});

router.get('/:id/results', async (req, res) => {
    const id = req.params.id;
    try {
        const workflow = await workflowRepository.findOne({ where: { workflowId: id } });
        if (!workflow) {
            res.status(404).json({ message: `Workflow with id: ${id} not found` });
            return;
        }

        if (workflow.status === WorkflowStatus.Completed) {
            res.status(200).json({
                workflowId: workflow.workflowId,
                status: workflow.status,
                finalResult: workflow.finalResult
            });
        } else {
            res.status(400).json({
                workflowId: workflow.workflowId,
                status: workflow.status
            });
        }
    } catch (error: any) {
        console.error('Error getting workflow results:', error);
        res.status(500).json({ message: 'Failed to get workflow results' });
    }
});

export default router;