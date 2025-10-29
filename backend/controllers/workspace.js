import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Backlog from "../models/backlog.js";

const createWorkspace = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const workspace = await Workspace.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "owner",
          joinedAt: new Date(),
        },
      ],
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(workspaces);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

const getWorkspaceDetails = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById({
      _id: workspaceId,
    }).populate("members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    res.status(200).json(workspace);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
    }).populate("members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const projects = await Project.find({
      workspace: workspaceId,
      isArchived: false,
      members: { $elemMatch: { user: req.user._id } },
    })
      .populate("backlog.activities", "status")
      .sort({ createdAt: -1 });

    res.status(200).json({ projects, workspace });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

const getWorkspaceStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;

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
        message: "You are not member of this workspace",
      });
    }

    // Extraer todos los proyectos poblados
    const [totalProjects, projects] = await Promise.all([
      Project.countDocuments({ workspace: workspaceId }),
      Project.find({ workspace: workspaceId })
        .populate({
          path: "backlog",
          populate: [
            {
              path: "activities",
              select:
                "typeOf title status dueDate backlog isOnSprint updatedAt isArchived priority",
            },
            {
              path: "sprints",
              populate: {
                path: "activities",
                select:
                  "typeOf title status dueDate backlog isOnSprint updatedAt isArchived priority",
              },
            },
          ],
        })
        .sort({ createdAt: -1 }),
    ]);

    //Extraer todas las actividades del backlog y los sprints
    const allActivities = projects.flatMap((project) => {
      const backlogActivities = project.backlog?.activities || [];
      const sprintActivities =
        project.backlog?.sprints?.flatMap(
          (sprint) => sprint.activities || []
        ) || [];
      return [...backlogActivities, ...sprintActivities];
    });

    const totalActivities = allActivities.length;

    const totalProjectsInProgress = projects.filter(
      (project) => project.status === "In Progress"
    ).length;

    // const totalProjectsCompleted = projects.filter((project) => project.status === 'Completed')

    const totalActivitiesCompleted = allActivities.filter(
      (activity) => activity.status === "Done"
    ).length;

    const totalActivitiesToDo = allActivities.filter(
      (activity) => activity.status === "To Do"
    ).length;

    const totalActivitiesInProgress = allActivities.filter(
      (activity) => activity.status === "In Progress"
    ).length;

    //get upcoming activity in next 7 days

    const upcomingActivities = allActivities.filter((activity) => {
      const activityDate = new Date(activity.dueDate);
      const today = new Date();
      return (
        activityDate > today &&
        activityDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
    });

    const activityTrendData = [
      { name: "Sun", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Mon", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Tue", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Wed", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Thu", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Fri", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Sat", completed: 0, inProgress: 0, toDo: 0 },
    ];

    //get last 7 days date

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    //populate

    for (const activity of allActivities) {
      const activityDate = new Date(activity.updatedAt);

      const dayInDate = last7Days.findIndex(
        (date) =>
          date.getDate() === activityDate.getDate() &&
          date.getMonth() === activityDate.getMonth() &&
          date.getFullYear() === activityDate.getFullYear()
      );

      if (dayInDate !== -1) {
        const dayName = last7Days[dayInDate].toLocaleDateString("en-US", {
          weekday: "short",
        });

        const dayData = activityTrendData.find((day) => day.name === dayName);

        if (dayData) {
          switch (activity.status) {
            case "Done":
              dayData.completed++;
              break;
            case "In Progress":
              dayData.inProgress++;
              break;
            case "To Do":
              dayData.toDo++;
              break;
          }
        }
      }
    }

    //get project status distribution
    const projectStatusData = [
      { name: "Completed", value: 0, color: "#10b981" },
      { name: "In Progress", value: 0, color: "#3b82f6" },
      { name: "Completed", value: 0, color: "#f59e0b" },
    ];

    for (const project of projects) {
      switch (project.status) {
        case "Completed":
          projectStatusData[0].value++;
          break;
        case "In Progress":
          projectStatusData[1].value++;
          break;
        case "Planning":
          projectStatusData[2].value++;
          break;
      }
    }

    //get project status data
    const activityPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];

    for (const activity of allActivities) {
      switch (activity.priority) {
        case "High":
          activityPriorityData[0].value++;
          break;
        case "Medium":
          activityPriorityData[1].value++;
          break;
        case "Low":
          activityPriorityData[1].value++;
          break;
      }
    }

    const workspaceProductivityData = [];

    for (const project of projects) {
      // Actividades del backlog
      const backlogActivities = project.backlog?.activities || [];

      // Actividades de todos los sprints
      const sprintActivities =
        project.backlog?.sprints?.flatMap(
          (sprint) => sprint.activities || []
        ) || [];

      // Combinar todas las actividades del proyecto
      const allProjectActivities = [...backlogActivities, ...sprintActivities];

      // Filtrar actividades no archivadas
      const activeActivities = allProjectActivities.filter(
        (activity) => activity.isArchived === false
      );

      // Contar completadas
      const completedActivities = activeActivities.filter(
        (activity) => activity.status === "Done"
      );

      workspaceProductivityData.push({
        name: project.title,
        completed: completedActivities.length,
        total: activeActivities.length,
      });
    }

    const stats = {
      totalProjects,
      totalActivities,
      totalProjectsInProgress,
      // totalProjectsCompleted,
      totalActivitiesToDo,
      totalActivitiesInProgress,
      totalActivitiesCompleted,
    };

    res.status(200).json({
      stats,
      activityTrendData,
      projectStatusData,
      activityPriorityData,
      workspaceProductivityData,
      upcomingActivities,
      recentProjects: projects.slice(0, 5),
      workspaceProjects: projects
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};



export {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaceStats,
};
