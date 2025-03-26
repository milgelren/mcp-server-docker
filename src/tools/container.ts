import {DockerManager} from "../utils/docker-manager.js";

export const createImageSchema = {
    name: "create_image",
    description: "Create a Docker Image",
    inputSchema: {
        type: "object",
        properties: {
            name: { type: "string" },
            image: { type: "string" },
            tag: { type: "string" },
        },
        required: ["name", "image"],
    },
} as const;

export async function createImage(
    dockerManager: DockerManager,
    input: {
        name: string;
        image: string;
        tag?: string;
    }
) {
    const response = await dockerManager
        .getCore()
        .image
        .create({}, {
            name: input.name,
            fromImage: input.image,
            tag: input.tag? input.tag:"latest",
        })
        .catch((error: any) => {
            console.error("Image creation error:", {
                status: error.response?.statusCode,
                message: error.response?.body?.message || error.message,
                details: error.response?.body,
            });
            throw error;
        });
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(
                    {
                        imageName: response.toString(),
                        status: "created",
                    },
                    null,
                    2
                ),
            },
        ],
    };
}