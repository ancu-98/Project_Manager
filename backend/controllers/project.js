import { recordHistory } from "../libs/app.js";
import Activity from "../models/activity.js";
import Backlog from "../models/backlog.js";
import Comment from "../models/comment.js";
import Project from "../models/project.js";
import Sprint from "../models/sprint.js";
import Workspace from "../models/workspace.js";

const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description, status, startDate, dueDate, tags, members } =
      req.body;

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
    const project = await Project.findById(projectId)
      .populate({
        path: "members.user", // ← Popular el campo user dentro de members
        select: "name email profilePicture", // ← Seleccionar campos específicos
      });

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

//TODO: Revisar los roles de project members
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, startDate, dueDate, tags } = req.body;

    const project = await Project.findById(projectId);

    // Encontrar la información del miembro actual
    const userMemberInfo = project.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    // Verificar que el usuario es miembro del workspace
    if (!userMemberInfo) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    //Only owners and admins can make changes.
    if (!["manager", "contributor"].includes(userMemberInfo.role)) {
      return res.status(403).json({
        message: "You don't have permission to update this workspace.",
      });
    }

    const oldTitle = project.title;

    const oldDescription =
      project.description.substring(0, 50) +
      (project.description.length > 50 ? "..." : "");

    const newDescription =
      project.description.substring(0, 50) +
      (project.description.length > 50 ? "..." : "");

    const oldStatus = project.status;
    const oldStartDate = project.startDate;
    const oldDueDate = project.dueDate;
    const oldTags = project.tags;

    project.title = title;
    project.description = description;
    project.status = status;
    project.startDate = startDate;
    project.dueDate = dueDate;
    project.tags = tags;
    await project.save();

    // record History
    await recordHistory(req.user._id, "updated_project", "project", projectId, {
      description: `updated project from:
          - title: ${oldTitle} to ${title}
          - description: ${oldDescription} to ${newDescription}
          - status: ${oldStatus} to ${status}
          - startDay: ${oldStartDate} to ${startDate}
          - dueDate: ${oldDueDate} to ${dueDate}
          - tags: ${oldTags} to ${tags}
          `,
    });

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // 1. Verificar que el project exista
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // 2. Verificar que el usuario es el manager del project
    const managerMember = project.members.find(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.role === 'manager'
    );

    if (!managerMember) {
      return res.status(403).json({
        message: "Only the project manager can delete the workspace",
      });
    }

    // 3. Obtener todos los backlogs de estos proyectos
    const backlogs = await Backlog.find({ project: projectId });
    const backlogIds = backlogs.map(backlog => backlog._id);

    // 4. Obtener todas las actividades de estos backlogs
    const activities = await Activity.find({ backlog: { $in: backlogIds } });
    const activityIds = activities.map(activity => activity._id);

    // 5. Obtener todos los sprints de estos backlogs
    const sprints = await Sprint.find({ backlog: { $in: backlogIds } });
    const sprintIds = sprints.map(sprint => sprint._id);

    // 6. Obtener todos los comentarios de estas actividades
    const comments = await Comment.find({ activity: { $in: activityIds } });
    const commentIds = comments.map(comment => comment._id);

    // 7. Eliminar en cascada (en orden inverso para mantener referencias)
    await Promise.all([
      // Eliminar comentarios
      Comment.deleteMany({ _id: { $in: commentIds } }),

      // Eliminar actividades
      Activity.deleteMany({ _id: { $in: activityIds } }),

      // Eliminar sprints
      Sprint.deleteMany({ _id: { $in: sprintIds } }),

      // Eliminar backlogs
      Backlog.deleteMany({ _id: { $in: backlogIds } }),

      // Finalmente eliminar proyectos
      Project.deleteOne({ _id: projectId}),

      // Registrar en el historial
      recordHistory(
        req.user._id,
        "deleted_project",
        "Project",
        projectId,
        {
          description: `Deleted project: ${project.title} and all related data`,
        }
      )
    ]);

    res.status(200).json({
      message: "Project and all related data deleted successfully",
    });

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
  updateProject,
  deleteProject,
};
