import Activity from "../models/activity.js";
import Backlog from "../models/backlog.js";
import Project from "../models/project.js";
import Sprint from "../models/sprint.js";
import Workspace from "../models/workspace.js";

const createSprint = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const workspace = await Workspace.findById(project.workspace);

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

    const backlog = await Backlog.findById(project.backlog);

    if (!backlog) {
      return res.status(404).json({
        message: "Backlog not found",
      });
    }

    const newSprint = await Sprint.create({
      backlog: backlog._id,
      storyPointsToDo: 0,
      storyPointsInProgress: 0,
      storyPointsDone: 0,
      activities: [],
      createdBy: req.user._id,
    });

    //Save sprint in backlog
    backlog.sprints.push(newSprint._id);
    await backlog.save();
    res.status(201).json(newSprint);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateStartSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const { sprintName, duration, startDay, finishDay, sprintGoal } = req.body;

    const sprint = await Sprint.findById(sprintId);

    if (!sprint) {
      return res.status(404).json({
        message: "Sprint not found",
      });
    }

    const backlog = await Backlog.findById(sprint.backlog);

    if (!backlog) {
      return res.status(404).json({
        message: "Backlog not found",
      });
    }

    const project = await Project.findById(backlog.project);

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

    if (sprint.activities.length === 0) {
      return res.status(403).json({
        message: 'No activities on Sprint to work.'
      })
    }

    sprint.sprintName = sprintName;
    sprint.duration = duration;
    sprint.startDay = startDay;
    sprint.finishDay = finishDay;
    sprint.sprintGoal = sprintGoal;
    sprint.startedBy = req.user._id;
    sprint.isStarted = true;
    await sprint.save();

    res.status(200).json(sprint);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addBacklogActivityToSprint = async (req, res) => {
  try {
    const { sprintId, activityId } = req.params;

    const sprint = await Sprint.findById(sprintId);

    if (!sprint) {
      return res.status(404).json({
        message: "Sprint not found",
      });
    }

    const backlog = await Backlog.findById(sprint.backlog);

    if (!backlog) {
      return res.status(404).json({
        message: "Backlog not found",
      });
    }

    const project = await Project.findById(backlog.project);

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

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Especificar que la actividad ya no esta en el backlog
    activity.sprint = sprintId;
    activity.isOnBacklog = false;
    activity.isOnSprint = true;
    await activity.save();

    // Agregar actividad al sprint
    sprint.activities.push(activityId);
    await sprint.save();

    // Remover actividad del backlog
    backlog.activities = backlog.activities.filter(
      (id) => !id.equals(activityId)
    );
    await backlog.save();

    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const achievedSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;

    const sprint = await Sprint.findById(sprintId);

    if (!sprint) {
      return res.status(404).json({
        message: "Sprint not found",
      });
    }

    const backlog = await Backlog.findById(sprint.backlog);

    if (!backlog) {
      return res.status(404).json({
        message: "Backlog not found",
      });
    }

    const project = await Project.findById(backlog.project);

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

    //Comprobar que no hay actividades en el sprint
    if(sprint.activities.length !== 0){
      return res.status(403).json({
        message: 'Return activities to backlog or achieved activities'
      })
    }

    //Cambiar estado del sprint a achieved
    sprint.isArchived = true;
    await sprint.save();

    //Remover sprint del backlog
    backlog.sprints = backlog.sprints.filter((id) => !id.equals(sprintId));
    await backlog.save();

    res.status(200).json(sprint);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const finishStartedSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;

    const sprint = await Sprint.findById(sprintId);

    if (!sprint) {
      return res.status(404).json({
        message: "Sprint not found",
      });
    }

    const backlog = await Backlog.findById(sprint.backlog);

    if (!backlog) {
      return res.status(404).json({
        message: "Backlog not found",
      });
    }

    const project = await Project.findById(backlog.project);

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

    //Comprobar que el sprint si ha sido inicializado
    if (!sprint.isStarted) {
      return res.status(403).json({
        message: "Sprint has never been started",
      });
    }

    //Cambiar estado del sprint a achieved
    sprint.isFinished = true;
    sprint.finishedBy = req.user._id;
    sprint.isArchived = true;
    sprint.isStarted = false;
    await sprint.save();

    //Remover sprint del backlog y agregarlo a sprints finalizados
    backlog.sprints = backlog.sprints.filter((id) => !id.equals(sprintId));
    backlog.finishedSprints.push(sprint._id)
    await backlog.save();

    res.status(200).json(sprint);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  createSprint,
  updateStartSprint,
  addBacklogActivityToSprint,
  achievedSprint,
  finishStartedSprint
};
