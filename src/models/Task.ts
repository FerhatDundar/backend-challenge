import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Workflow } from './Workflow';
import {TaskStatus} from "../workers/taskRunner";

export enum TaskType {
    DataAnalysis = 'analysis',
    EmailNotification = 'notification',
    PolygonArea = 'polygonArea',
    Report = 'report'
}


@Entity({ name: 'tasks' })
export class Task {
    @PrimaryGeneratedColumn('uuid')
    taskId!: string;

    @Column()
    clientId!: string;

    @Column('text')
    geoJson!: string;

    @Column()
    status!: TaskStatus;

    @Column({ nullable: true, type: 'text' })
    progress?: string | null;

    @Column({ nullable: true })
    resultId?: string;

    @Column()
    taskType!: TaskType;

    @Column({ default: 1 })
    stepNumber!: number;

    @ManyToOne(() => Workflow, workflow => workflow.tasks)
    workflow!: Workflow;

    @ManyToMany(() => Task, p => p.dependents, { cascade: false })
    @JoinTable({name: 'task_dependencies'})
    dependsOn!: Task[];

    @ManyToMany(() => Task, p => p.dependsOn)
    dependents!: Task[];

    @Column({ nullable: true, type: 'text'  })
    errorMessage?: string | null;

    @Column({ nullable: true })
    requeuedAt?: Date;
}