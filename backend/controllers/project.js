import Backlog from "../models/backlog.js";
import Project from "../models/project.js";
import Workspace from "../models/workspace.js";

const createProject = async (req, res) => {
    try {
        const {workspaceId} = req.params;
        const {title, description, status, startDate, dueDate, tags, members} = req.body;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: 'Workspace not found',
            });
        }

        const isMember = workspace.members.some((member) =>
            member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: 'You are not a member of this workspace',
            });
        }

        const tagArray = tags ? tags.split(',') : [];

        // Create projec asociate to workspace
        const newProject = await Project.create({
            title,
            description,
            workspace: workspaceId,
            status,
            startDate,
            dueDate,
            backlog: null, // temporal
            tags: tagArray,
            members,
            createdBy: req.user._id,
        });

        // Create backlog asociate to project
        const newBacklog = await Backlog.create({
            project: newProject._id ,
            activities: [],
            sprints: [],
            storyPointsToDo: 0,
            storyPointsInProgress: 0,
            storyPointsDone: 0,
        })

        // Update project whit backlog ID
        newProject.backlog = newBacklog._id;
        await newProject.save();

        // Add project to workspace
        workspace.projects.push(newProject._id);
        await workspace.save();

        return res.status(201).json(newProject);

    } catch (error) {
        console.log(error);
        res.status(500).json({
        message: "Internal server error",
        });
    }
}

export {
    createProject
};