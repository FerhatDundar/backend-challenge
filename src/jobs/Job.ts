import { Result } from "../models/Result";
import {Task} from "../models/Task";


export interface Job {
    run(task: Task, dependencyResults: Result[]): Promise<any>;
}