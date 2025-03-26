import { Docker } from "node-docker-api";

export class DockerManager {
    private docker: Docker;

    constructor() {
        this.docker = new Docker({ socketPath: "/var/run/docker.sock" });
    }

    getCore() {
        return this.docker;
    }
}