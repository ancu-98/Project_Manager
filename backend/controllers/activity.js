import { recordHistory } from "../libs/app.js";
import Activity from "../models/activity.js";
import Backlog from "../models/backlog.js";
import Comment from "../models/comment.js";
import HistoryLog from "../models/history.js";
import Project from "../models/project.js";
import Sprint from "../models/sprint.js";
import Workspace from "../models/workspace.js";

const createActivity = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { typeOf, title, description, status, priority, dueDate, assignees } =
      req.body;

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
    });

    backlog.activities.push(newActivity._id);
    await backlog.save();

    res.status(201).json(newActivity);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getActivityById = async (req, res) => {
  try {
    const { activityId } = req.params;

    const activity = await Activity.findById(activityId)
      .populate("assignees", "name profilePicture")
      .populate("watchers", "name profilePicture")
      .populate({
        path: "relatedActivities",
      });

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    const backlog = await Backlog.findById(activity.backlog)
      .populate({
        path: "activities",
        populate: {
          path: "relatedActivities",
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
          populate: {
            path: "relatedActivities",
          },
        },
      });

    if (!backlog) {
      return res.status(404).json({
        message: "Backlog not found",
      });
    }

    const project = await Project.findById(backlog.project).populate(
      "members.user",
      "name profilePicture"
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json({
      activity,
      backlog,
      project,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateActivityTitle = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { title } = req.body;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    const backlog = await Backlog.findById(activity.backlog);

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

    const oldTitle = activity.title;

    activity.title = title;
    await activity.save();

    // record History
    await recordHistory(
      req.user._id,
      "updated_activity",
      "Activity",
      activityId,
      {
        description: `updated activity title from ${oldTitle} to ${title}`,
      }
    );

    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateActivityDescription = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { description } = req.body;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    const backlog = await Backlog.findById(activity.backlog);

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

    const oldDescription =
      activity.description.substring(0, 50) +
      (activity.description.length > 50 ? "..." : "");

    const newDescription =
      activity.description.substring(0, 50) +
      (activity.description.length > 50 ? "..." : "");

    activity.description = description;
    await activity.save();

    // record History
    await recordHistory(
      req.user._id,
      "updated_activity",
      "Activity",
      activityId,
      {
        description: `updated activity description from ${oldDescription} to ${newDescription}`,
      }
    );

    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateActivityStatus = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { status } = req.body;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    const backlog = await Backlog.findById(activity.backlog);

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

    const oldStatus = activity.status;
    const newStatus = status;

    activity.status = status;
    await activity.save();

    // record History
    await recordHistory(
      req.user._id,
      "updated_activity",
      "Activity",
      activityId,
      {
        description: `updated activity status from ${oldStatus} to ${newStatus}`,
      }
    );

    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateActivityAssignees = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { assignees } = req.body;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    const backlog = await Backlog.findById(activity.backlog);

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

    const oldAssignees = activity.assignees;

    activity.assignees = assignees;
    await activity.save();

    // record History
    await recordHistory(
      req.user._id,
      "updated_activity",
      "Activity",
      activityId,
      {
        description: `updated activity assignees from ${oldAssignees.length} to ${assignees.length}`,
      }
    );

    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateActivityPriority = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { priority } = req.body;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    const backlog = await Backlog.findById(activity.backlog);

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

    const oldPriority = activity.priority;
    const newPriority = priority;

    activity.priority = priority;
    await activity.save();

    // record History
    await recordHistory(
      req.user._id,
      "updated_activity",
      "Activity",
      activityId,
      {
        description: `updated activity priority from ${oldPriority} to ${newPriority}`,
      }
    );

    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addSubTask = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { title } = req.body;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    const backlog = await Backlog.findById(activity.backlog);

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

    const newSubTask = {
      title,
      completed: false,
    };

    activity.subtasks.push(newSubTask);
    await activity.save();

    // record History
    await recordHistory(
      req.user._id,
      "created_subtask",
      "Activity",
      activityId,
      {
        description: `created subtask ${title}`,
      }
    );

    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateSubTask = async (req, res) => {
  try {
    const { activityId, subTaskId } = req.params;
    const { completed } = req.body;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    const backlog = await Backlog.findById(activity.backlog);

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

    const subTask = activity.subtasks.find(
      (subtask) => subtask._id.toString() === subTaskId
    );

    if (!subTask) {
      return res.status(404).json({
        message: "SubTask not found",
      });
    }

    subTask.completed = completed;
    await activity.save();

    // record History

    await recordHistory(
      req.user._id,
      "updated_subtask",
      "Activity",
      activityId,
      {
        description: `updated subtask ${subTask.title}`,
      }
    );

    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getHistoryByResourceId = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const history = await HistoryLog.find({ resourceId })
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getCommentsByActivityId = async (req, res) => {
  try {
    const { activityId } = req.params;

    const comments = await Comment.find({ activity: activityId })
      .populate("author", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { text } = req.body;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    const backlog = await Backlog.findById(activity.backlog);

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

    const newComment = await Comment.create({
      text,
      activity: activityId,
      author: req.user._id,
    });

    activity.comments.push(newComment._id);
    await activity.save();

    // record History

    await recordHistory(req.user._id, "added_comment", "Activity", activityId, {
      description: `added comment ${
        text.substring(0, 50) + (text.length > 50 ? "..." : "")
      }`,
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const watchActivity = async (req, res) => {
  try {
    const { activityId } = req.params;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    const backlog = await Backlog.findById(activity.backlog);

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

    const isWatching = activity.watchers.includes(req.user._id);

    if (!isWatching) {
      activity.watchers.push(req.user._id);
    } else {
      activity.watchers = activity.watchers.filter(
        (watcher) => watcher.toString() !== req.user._id.toString()
      );
    }

    await activity.save();

    // record History

    await recordHistory(
      req.user._id,
      "updated_activity",
      "Activity",
      activityId,
      {
        description: `${
          isWatching ? "stoped watching" : "started watching"
        } activity ${activity.title}`,
      }
    );

    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const achievedActivity = async (req, res) => {
  try {
    const { activityId } = req.params;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    const backlog = await Backlog.findById(activity.backlog);

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

    //Si la actividad se encuentra en el Backlog, removemos directamente

    //Indicar estado archived
    const isAchieved = activity.isArchived;

    activity.isArchived = !isAchieved;
    await activity.save();

    // Remover actividad del backlog
    backlog.activities = backlog.activities.filter(
      (id) => !id.equals(activityId)
    );
    await backlog.save();

    //Si la actividad se encuentra en el el Sprint, remover
    if (activity.isOnSprint) {
      const sprint = await Sprint.findById(activity.sprint);

      if (!sprint) {
        return res.status(404).json({
          message: "Sprint not found",
        });
      }

      // Remover actividad del backlog
      sprint.activities = sprint.activities.filter(
        (id) => !id.equals(activityId)
      );
      await sprint.save();
    }

    // record History

    await recordHistory(
      req.user._id,
      "updated_activity",
      "Activity",
      activityId,
      {
        description: `${isAchieved ? "unachieved" : "achieved"} activity ${
          activity.title
        }`,
      }
    );

    //TODO: Revisar si debo crear un nuevo arreglo para actividades acrhivadas

    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({
      assignees: { $in: [req.user._id] },
    })
      .populate({
        path: "backlog",
        select: "project",
        populate: {
          path: "project",
          select: "title workspace",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(activities);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTypeOfActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { typeOf } = req.body;

    // Verificar información de las actividades relacionadas
    const activity = await Activity.findById(activityId).populate("relatedActivities");

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    if (activity.relatedActivities && activity.relatedActivities.length < 0) {
      const relatedTitles = activity.relatedActivities
        .map((a) => a.title)
        .join(", ");
      return res.status(400).json({
        message:
          `Cannot change activity type because it has related activities: ${relatedTitles}.
          Please remove all related activities first.`,
      });
    }

    const backlog = await Backlog.findById(activity.backlog);

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

    const oldTypeOf = activity.typeOf;
    const newTypeOf = typeOf;

    activity.typeOf = typeOf;
    await activity.save();

    // record History
    await recordHistory(
      req.user._id,
      "updated_activity",
      "Activity",
      activityId,
      {
        description: `updated activity typeOf from ${oldTypeOf} to ${newTypeOf}`,
      }
    );

    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getPrincipalActivity = async (req, res) => {
  try {
    const { activityId } = req.params;

    // 1. Buscar la actividad y popular el campo 'principal'
    const activity = await Activity.findById(activityId)
      .populate('principal', 'title typeOf status description priority createdBy createdAt updatedAt')
      .populate('createdBy', 'name email profilePicture');

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    // 2. Si no tiene actividad principal, retornar null
    if (!activity.principal) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "This activity doesn't have a principal activity"
      });
    }

    // 3. Retornar la actividad principal
    res.status(200).json({
      success: true,
      data: activity.principal
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addRelatedActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { relatedActivityId } = req.body;

    // 1. Verificar que la actividad principal existe
    const mainActivity = await Activity.findById(activityId);
    if (!mainActivity) {
      return res.status(404).json({
        message: "Main activity not found",
      });
    }

    // 2. Verificar que la actividad a relacionar existe
    const relatedActivity = await Activity.findById(relatedActivityId);
    if (!relatedActivity) {
      return res.status(404).json({
        message: "Related activity not found",
      });
    }

    // 3. Validar la jerarquía de tipos
    const hierarchy = {
      Epic: ["Story"],
      Story: ["Task"],
      Task: ["Subtask"],
    };

    const allowedTypes = hierarchy[mainActivity.typeOf];
    if (!allowedTypes) {
      return res.status(400).json({
        message: `Activities of type ${mainActivity.typeOf} cannot have related activities`,
      });
    }

    if (!allowedTypes.includes(relatedActivity.typeOf)) {
      return res.status(400).json({
        message: `Activities of type ${
          mainActivity.typeOf
        } can only relate to activities of type: ${allowedTypes.join(", ")}`,
      });
    }

    // 4. Verificar que no existe ya la relación
    const alreadyRelated = mainActivity.relatedActivities.some(
      (id) => id.toString() === relatedActivityId
    );

    if (alreadyRelated) {
      return res.status(400).json({
        message: "Activity is already related to this activity",
      });
    }

    // 5. Actualizar la actividad principal
    mainActivity.relatedActivities.push(relatedActivityId);
    await mainActivity.save();

    // 6. Actualizar la actividad relacionada (establecer principal y isRelatedActivity)
    relatedActivity.principal = activityId;
    relatedActivity.isRelatedActivity = true; // ✅ NUEVO: Marcar como actividad relacionada
    await relatedActivity.save();

    // 7. Poblar las actividades actualizadas para la respuesta
    const updatedMainActivity = await Activity.findById(activityId)
      .populate("relatedActivities", "title typeOf status isRelatedActivity")
      .populate("principal", "title typeOf");

    // 8. Registrar en el historial
    await Promise.all([
      recordHistory(
        req.user._id,
        "added_related_activity",
        "Activity",
        activityId,
        {
          description: `Added related activity: ${relatedActivity.title} (${relatedActivity.typeOf})`,
          targetActivity: relatedActivityId,
        }
      ),
      recordHistory(
        req.user._id,
        "set_as_principal_activity",
        "Activity",
        relatedActivityId,
        {
          description: `Set as related activity to: ${mainActivity.title} (${mainActivity.typeOf})`,
          targetActivity: activityId,
        }
      ),
    ]);

    res.status(200).json({
      message: "Related activity added successfully",
      data: updatedMainActivity,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const removeRelatedActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { relatedActivityId } = req.body;

    // Buscar las actividades
    const mainActivity = await Activity.findById(activityId);
    const relatedActivity = await Activity.findById(relatedActivityId);

    if (!mainActivity || !relatedActivity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    // Remover de relatedActivities
    mainActivity.relatedActivities = mainActivity.relatedActivities.filter(
      (id) => id.toString() !== relatedActivityId
    );
    await mainActivity.save();

    // Limpiar principal de la actividad relacionada
    if (relatedActivity.principal?.toString() === activityId) {
      relatedActivity.principal = undefined;
      relatedActivity.isRelatedActivity = false; // ✅ Resetear esta propiedad
      await relatedActivity.save();
    }

    // Registrar en historial
    await Promise.all([
      recordHistory(
        req.user._id,
        "removed_related_activity",
        "Activity",
        activityId,
        {
          description: `Removed related activity: ${relatedActivity.title}`,
          targetActivity: relatedActivityId,
        }
      ),
      recordHistory(
        req.user._id,
        "removed_from_principal",
        "Activity",
        relatedActivityId,
        {
          description: `Removed from principal activity: ${mainActivity.title}`,
          targetActivity: activityId,
        }
      ),
    ]);

    // Poblar la respuesta
    const updatedActivity = await Activity.findById(activityId).populate(
      "relatedActivities"
    );

    res.status(200).json({
      message: "Related activity removed successfully",
      data: updatedActivity,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createActivity,
  getActivityById,
  updateActivityTitle,
  updateActivityDescription,
  updateActivityStatus,
  updateActivityAssignees,
  updateActivityPriority,
  addSubTask,
  updateSubTask,
  getHistoryByResourceId,
  getCommentsByActivityId,
  addComment,
  watchActivity,
  achievedActivity,
  getMyActivities,
  addRelatedActivity,
  removeRelatedActivity,
  updateTypeOfActivity,
  getPrincipalActivity
};
