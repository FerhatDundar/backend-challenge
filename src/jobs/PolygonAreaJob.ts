import { Task } from "../models/Task";
import { TaskStatus } from "../workers/taskRunner";
import { Job } from "./Job";
import area from "@turf/area"
import { Result } from "../models/Result";

export class PolygonAreaJob implements Job{
    async run(task: Task, dependencyResults: Result[]): Promise<string> {

        try {
            const geoJson = JSON.parse(task.geoJson);
            const areaInSquareMeters = area(geoJson);
            console.log(`Polygon area calculated! ${areaInSquareMeters}`);
            return areaInSquareMeters.toString();
        } catch (error) {
            throw new Error(`Error calculating polygon area for task ${task.taskId}: ${error}`);
        }
    }
}