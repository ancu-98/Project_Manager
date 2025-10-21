import Activity from "../models/activity.js";
import Backlog from "../models/backlog.js";
import Project from "../models/project.js";
import Sprint from "../models/sprint.js";
import Workspace from "../models/workspace.js";

const createActivity = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { typeOf, title, description, status, priority, dueDate, assignees } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
            });
        }

        const workspace = await Workspace.findById(project.workspace)

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

        const backlog = await Backlog.findById(project.backlog);

        if (!backlog) {
            return res.status(404).json({
                message: 'Backlog not found',
            });
        }

        const newActivity = await Activity.create({
            typeOf,
            title,
            description,
            // relatedActivities: [],
            backlog: backlog._id,
            status,
            priority,
            // principal: ObjectId,
            assignees,
            // watchers: [],
            dueDate,
            // completedAt,
            // sprint: ObjectId,
            // storyPointEstimate,
            // estimatedHours,
            // actualHours,
            // tags: [],
            // subtasks: [],
            // comments: [],
            // attachments: [],
            createdBy: req.user._id,
            // isArchived,
        })

        backlog.activities.push(newActivity._id);
        await backlog.save();

        res.status(201).json(newActivity);
    } catch (error) {
        console.log(error);
        return  res.status(500).json({
            message: 'Internal server error'
        });
    }
}


export { createActivity };