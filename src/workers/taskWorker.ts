import {AppDataSource} from '../data-source';
import {Task} from '../models/Task';
import {TaskRunner, TaskStatus} from './taskRunner';

export async function taskWorker() {
    const taskRepository = AppDataSource.getRepository(Task);
    const taskRunner = new TaskRunner(taskRepository);

    while (true) {
        const task = await taskRepository.findOne({
            where: { status: TaskStatus.Queued },
            order: { requeuedAt: 'ASC' },
            relations: ['workflow', 'dependsOn', 'dependents'] // Ensure workflow is loaded
        });

        if (task) {
            try {
                const hasCompletedDependencies = task.dependsOn.every(t => t.status === TaskStatus.Completed);
                if (!hasCompletedDependencies) {
                    console.log(`Task ${task.taskId} has not completed dependencies. Skipping...`);
                    task.requeuedAt = new Date();
                    await taskRepository.save(task);
                    continue;
                }

                await taskRunner.run(task);
            } catch (error) {
                console.error('Task execution failed. Task status has already been updated by TaskRunner.');
                console.error(error);
            }
        }

        // Wait before checking for the next task again
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}