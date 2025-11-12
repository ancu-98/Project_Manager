import Activity from "../models/activity.js";
import Backlog from "../models/backlog.js";
import Project from "../models/project.js";
import Sprint from "../models/sprint.js";
import Workspace from "../models/workspace.js";

const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description, status, startDate, dueDate, tags, members } = req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const tagArray = tags ? tags.split(",") : [];

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
      project: newProject._id,
      activities: [],
      sprints: [],
      storyPointsToDo: 0,
      storyPointsInProgress: 0,
      storyPointsDone: 0,
    });

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
};

const getProjectBacklogDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const backlog = await Backlog.findById(project.backlog);

    res.status(200).json({
      project,
      backlog,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectBacklogActivities = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("members.user");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const backlog = await Backlog.findById(project.backlog)
      .populate({
        path: "activities",
        populate: {
          path: "assignees",
          select: "name profilePicture",
        },
      })
      .populate({
        path: "sprints",
        populate: {
          path: "activities",
          populate: {
            path: "assignees",
            select: "name profilePicture",
          },
        },
        options: { sort: { createdAt: -1 } },
      });

    if (!backlog) {
      return res.status(404).json({
        message: "Backlog not found",
      });
    }

    res.status(200).json({
      project,
      backlog,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const returnSprintActivitytoProjectBacklog = async (req, res) => {
  try {
    const { projectId, activityId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const backlog = await Backlog.findById(project.backlog);

    if (!backlog) {
      return res.status(404).json({
        message: "Backlog not found",
      });
    }

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const sprint = await Sprint.findById(activity.sprint);

    if (!sprint) {
      return res.status(404).json({
        message: "Sprint not found",
      });
    }

    // Especificar que la actividad ya no esta en el sprint
    activity.isOnBacklog = true;
    activity.isOnSprint = false;
    await activity.save();

    // Agregar actividad al backlog
    backlog.activities.push(activityId);
    await backlog.save();

    // Remover actividad del sprint
    sprint.activities = sprint.activities.filter(
      (id) => !id.equals(activityId)
    );
    await sprint.save();

    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  createProject,
  getProjectBacklogDetails,
  getProjectBacklogActivities,
  returnSprintActivitytoProjectBacklog,
};
