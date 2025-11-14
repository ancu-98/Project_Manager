import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Backlog from "../models/backlog.js";
import WorkspaceInvite from "../models/workspace-invite.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { sendEmail } from '../libs/send.email.js';
import { recordHistory } from "../libs/app.js";
import WorkspaceJoinRequest from "../models/workspace-join-request.js";
import Activity from "../models/activity.js";
import Sprint from "../models/sprint.js"
import Comment from "../models/comment.js";
import { achievedSprint } from "./sprint.js";


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
      .populate({
        path: "backlog",
        select: "status",
        populate: {
          path: "activities",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ projects, workspace });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

const getAllWorkspaces = async (req, res) => {
  try {
    const { search } = req.query;

    let workspaces;

    if (search) {
      // 1. Buscar proyectos que coincidan con el título
      const projectsByTitle = await Project.find({
        isArchived: false,
        title: { $regex: search, $options: "i" },
      }).select("workspace");

      // 2. Buscar proyectos que coincidan con tags
      const projectsByTags = await Project.find({
        isArchived: false,
        tags: { $elemMatch: { $regex: search, $options: "i" } },
      }).select("workspace tags");

      const allMatchingProjects = [...projectsByTitle, ...projectsByTags];

      // Eliminar proyectos duplicados por _id
      const uniqueProjects = Array.from(
        new Map(allMatchingProjects.map((p) => [p._id.toString(), p])).values()
      );

      //Extraer Id,s de los proyectos
      const projectIds = uniqueProjects.map((project) => project._id);

      const workspaceIdsFromProjects = [
        ...new Set(uniqueProjects.map((p) => p.workspace.toString())),
      ];

      // 5. Buscar workspaces
      workspaces = await Workspace.find({
        "members.user": { $ne: req.user._id },
        isArchived: false,
        $or: [
          { name: { $regex: search, $options: "i" } },
          { _id: { $in: workspaceIdsFromProjects } },
        ],
      })
        .populate("owner", "name email profilePicture")
        .populate("members.user", "name email profilePicture")
        .populate({
          path: "projects",
          match: { isArchived: false, _id: { $in: projectIds } },
          select: "title tags createdAt",
        })
        .sort({ createdAt: -1 })
        .limit(50);

      const workspacesWithStats = workspaces.map((workspace) => {
        const stats = { matchingProjects: 0, matchingTags: 0 };

        if (workspace.projects?.length) {
          workspace.projects.forEach((project) => {
            const titleMatch = project.title
              ?.toLowerCase()
              .includes(search.toLowerCase());
            if (titleMatch) stats.matchingProjects++;

            if (project.tags) {
              stats.matchingTags += project.tags.filter((tag) =>
                tag.toLowerCase().includes(search.toLowerCase())
              ).length;
            }
          });
        }

        return {
          ...workspace.toObject(),
          matchingStats: stats,
        };
      });

      res.status(200).json({
        workspaces: workspacesWithStats,
      });
    } else {
      workspaces = await Workspace.find({
        "members.user": { $ne: req.user._id },
        isArchived: false,
      })
        .populate("owner", "name email profilePicture")
        .populate("members.user", "name email profilePicture")
        .populate({
          path: "projects",
          match: { isArchived: false },
          select: "title description tags status createdAt",
        })
        .sort({ createdAt: -1 })
        .limit(50);

      res.status(200).json({
        workspaces,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPublicWorkspaceDetails = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.find({
      _id: workspaceId,
      "members.user": { $ne: req.user._id },
      isArchived: false,
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

const getPublicWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": { $ne: req.user._id },
      isArchived: false,
    }).populate("members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const projects = await Project.find({
      workspace: workspaceId,
      isArchived: false,
    })
      .populate({
        path: "backlog",
        select: "status",
        populate: {
          path: "activities",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ workspace, projects });
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
      workspaceProjects: projects,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};


const inviteUserToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
      return res.status(403).json({
        message: "You are not authorized to invite members to this workspace",
      });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // Verificar si el usuario ya es miembro
    const isMember = workspace.members.some(
      (member) => member.user.toString() === existingUser._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "User already a member of this workspace",
      });
    }

    //Verificar si el usuario ya ha sido invitado
    const isInvited = await WorkspaceInvite.findOne({
      user: existingUser._id,
      workspaceId: workspaceId,
    });

    if (isInvited && isInvited.expiresAt > new Date()) {
      return res.status(400).json({
        message: "User already invited to this workspace",
      });
    }

    if (isInvited && isInvited.expiresAt < new Date()) {
      await WorkspaceInvite.deleteOne({ _id: isInvited._id });
    }

    const inviteToken = jwt.sign(
      {
        user: existingUser._id,
        workspaceId: workspaceId,
        role: role || "member",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await WorkspaceInvite.create({
      user: existingUser._id,
      workspaceId: workspaceId,
      token: inviteToken,
      role: role || "member",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const invitationLink = `${process.env.FRONTEND_URL}/workspace-invite/${workspace._id}?tk=${inviteToken}`;

    const emailContent = `
      <p>You have been invited to join ${workspace.name} workspace</p>
      <p>Click here to join: <a href="${invitationLink}">${invitationLink}</a></p>
    `;

    await sendEmail(
      email,
      "You have been invited to join a workspace",
      emailContent
    );

    res.status(200).json({
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptGenerateInvite = async (req, res) => {
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

    if (isMember) {
      return res.status(400).json({
        message: "You are already a member of this workspace",
      });
    }

    workspace.members.push({
      user: req.user._id,
      role: "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    await recordHistory(
      req.user._id,
      "joined_workspace",
      "Workspace",
      workspaceId,
      {
        description: `Joined ${workspace.name} workspace`,
      }
    );

    res.status(200).json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptInviteByToken = async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { user, workspaceId, role } = decoded;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === user.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "User already a member of this workspace",
      });
    }

    const inviteInfo = await WorkspaceInvite.findOne({
      user: user,
      workspaceId: workspaceId,
    });

    if (!inviteInfo) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    if (inviteInfo.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Invitation has expired",
      });
    }

    workspace.members.push({
      user: user,
      role: role || "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    await Promise.all([
      WorkspaceInvite.deleteOne({ _id: inviteInfo._id }),
      recordHistory(user, "joined_workspace", "Workspace", workspaceId, {
        description: `Joined ${workspace.name} workspace`,
      }),
    ]);

    res.status(200).json({
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const joinRequestToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    // 1. Verificar que el workspace exista
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // 2. Verificar que el usuario no sea ya miembro
    const isMember = workspace.members.some(
      (member) => member.user.toString() === userId.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "You are already a member of this workspace",
      });
    }

    // 3. Verificar si ya existe una solicitud pendiente y no expirada
    const existingRequest = await WorkspaceJoinRequest.findOne({
      user: userId,
      workspaceId: workspaceId,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending request to join this workspace",
      });
    }

    // 4. Eliminar solicitudes expiradas existentes
    await WorkspaceJoinRequest.deleteMany({
      user: userId,
      workspaceId: workspaceId,
      expiresAt: { $lte: new Date() }
    });

    // 5. Generar token JWT para la solicitud
    const requestToken = jwt.sign(
      {
        user: userId,
        workspaceId: workspaceId,
        // type: 'join_request'
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6. Crear la solicitud de unión
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    await WorkspaceJoinRequest.create({
      user: userId,
      workspaceId: workspaceId,
      token: requestToken,
      status: 'pending',
      expiresAt: expiresAt
    });

    // 7. Obtener los administradores (owner y admin) del workspace
    const adminMembers = workspace.members.filter(member =>
      member.role === 'admin' || member.role === 'owner'
    );

    // 8. Obtener los datos de usuario de los administradores
    const adminUserIds = adminMembers.map(member => member.user);
    const adminUsers = await User.find({ _id: { $in: adminUserIds } });

    // 9. Construir el enlace para que los admins gestionen la solicitud
    const requestLink = `${process.env.FRONTEND_URL}/workspace-join-requests/${workspace._id}?tk=${requestToken}`;

    // 10. Enviar correo a cada administrador
    const currentUser = await User.findById(userId);

    const emailPromises = adminUsers.map(adminUser => {
      const emailContent = `
        <p>User ${currentUser.name} (${currentUser.email}) has requested to join the workspace "${workspace.name}".</p>
        <p>Click here to review and manage the request: <a href="${requestLink}">${requestLink}</a></p>
        <p><strong>Workspace:</strong> ${workspace.name}</p>
        <p><strong>Requested by:</strong> ${currentUser.name} (${currentUser.email})</p>
        <p><strong>Request date:</strong> ${new Date().toLocaleDateString()}</p>
      `;

      return sendEmail(
        adminUser.email,
        `Join request for workspace: ${workspace.name}`,
        emailContent
      );
    });

    await Promise.all(emailPromises);

    res.status(200).json({
      message: "Join Request sent successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptJoinRequestByToken = async(req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { user, workspaceId } = decoded;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === user.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "User already a member of this workspace",
      });
    }

    const joinRequestInfo = await WorkspaceJoinRequest.findOne({
      user: user,
      workspaceId: workspaceId,
    }).populate('user', 'name email');

    if (!joinRequestInfo) {
      return res.status(404).json({
        message: "Request to join not found",
      });
    }

    if (joinRequestInfo.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Request to join has expired",
      });
    }

    workspace.members.push({
      user: user,
      role: "member",
      joinedAt: new Date(),
    });

    await Promise.all([
      workspace.save(),
      WorkspaceJoinRequest.deleteOne({ _id: joinRequestInfo._id }),
      recordHistory(
        joinRequestInfo.user._id,
        "joined_workspace",
        "Workspace",
        workspace._id,
        {
          description: `Joined ${workspace.name} workspace via accepted request`,
        }
      ),
      recordHistory(
        req.user._id,
        "accepted_join_request",
        "Workspace",
        workspace._id,
        {
          description: `Accepted ${joinRequestInfo.user.name}'s join request`,
          targetUser: joinRequestInfo.user._id
        }
      )
    ]);

    // Enviar correo de notificación al usuario
    const emailContent = `
      <p>Your request to join the workspace "${workspace.name}" has been accepted.</p>
      <p>You can now access the workspace at: <a href="${process.env.FRONTEND_URL}/workspaces/${workspace._id}">${workspace.name}</a></p>
    `;

    await sendEmail(
       joinRequestInfo.user.email,
      `Your request to join ${workspace.name} has been accepted`,
      emailContent
    );

    res.status(200).json({
      message: "Join request accepted successfully",
    });
  } catch (error) {
     console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

//TODO:Implement in Settings
const acceptJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    // Buscar la solicitud
    const joinRequest = await WorkspaceJoinRequest.findById(requestId).populate('user', 'name email');
    if (!joinRequest) {
      return res.status(404).json({ message: "Join request not found" });
    }

    // Verificar que el workspace exista
    const workspace = await Workspace.findById(joinRequest.workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Verificar que el usuario que acepta es admin u owner del workspace
    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Verificar que la solicitud esté pendiente
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({ message: "Join request is not pending" });
    }

    // Verificar que el usuario no sea ya miembro
    const isMember = workspace.members.some(
      (member) => member.user.toString() === joinRequest.user._id.toString()
    );

    if (isMember) {
      // Si ya es miembro, actualizar la solicitud y retornar error
      joinRequest.status = 'accepted';
      await joinRequest.save();
      return res.status(400).json({ message: "User is already a member" });
    }

    // Agregar el usuario como miembro
    workspace.members.push({
      user: joinRequest.user._id,
      role: "member", // Rol por defecto para usuarios que se unen por solicitud
      joinedAt: new Date(),
    });

    // Actualizar el estado de la solicitud
    joinRequest.status = 'accepted';

    await Promise.all([
      workspace.save(),
      joinRequest.save(),
      recordHistory(
        joinRequest.user._id,
        "joined_workspace",
        "Workspace",
        workspace._id,
        {
          description: `Joined ${workspace.name} workspace via accepted request`,
        }
      ),
      recordHistory(
        req.user._id,
        "accepted_join_request",
        "Workspace",
        workspace._id,
        {
          description: `Accepted ${joinRequest.user.name}'s join request`,
          targetUser: joinRequest.user._id
        }
      )
    ]);

    // Enviar correo de notificación al usuario
    const emailContent = `
      <p>Your request to join the workspace "${workspace.name}" has been accepted.</p>
      <p>You can now access the workspace at: <a href="${process.env.FRONTEND_URL}/workspaces/${workspace._id}">${workspace.name}</a></p>
    `;

    await sendEmail(
      joinRequest.user.email,
      `Your request to join ${workspace.name} has been accepted`,
      emailContent
    );

    res.status(200).json({
      message: "Join request accepted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const rejectJoinRequestByToken = async(req, res) => {
    try {
    const { token, reason } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { user, workspaceId } = decoded;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === user.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "User already a member of this workspace",
      });
    }

    const joinRequestInfo = await WorkspaceJoinRequest.findOne({
      user: user,
      workspaceId: workspaceId,
    }).populate('user', 'name email');

    if (!joinRequestInfo) {
      return res.status(404).json({
        message: "Request to join not found",
      });
    }

    if (joinRequestInfo.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Request to join has expired",
      });
    }

    await Promise.all([
      WorkspaceJoinRequest.deleteOne({ _id: joinRequestInfo._id }),
      recordHistory(
      req.user._id,
      "rejected_join_request",
      "Workspace",
      workspace._id,
      {
        description: `Rejected ${joinRequestInfo.user.name}'s join request${reason ? `: ${reason}` : ''}`,
        targetUser: joinRequestInfo.user._id,
        reason: reason
      }
      ),
    ]);

    // Enviar correo de notificación al usuario
    const emailContent = `
      <p>Your request to join the workspace "${workspace.name}" has been rejected.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>If you believe this was a mistake, you can submit another request or contact the workspace administrators.</p>
    `;

    await sendEmail(
      joinRequestInfo.user.email,
      `Your request to join ${workspace.name} has been rejected`,
      emailContent
    );

    res.status(200).json({
      message: "Join request rejected successfully",
    });
  } catch (error) {
     console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

//TODO:Implement in Settings
const rejectJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body; // Opcional: razón del rechazo

    // Buscar la solicitud
    const joinRequest = await WorkspaceJoinRequest.findById(requestId).populate('user', 'name email');
    if (!joinRequest) {
      return res.status(404).json({ message: "Join request not found" });
    }

    // Verificar que el workspace exista
    const workspace = await Workspace.findById(joinRequest.workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Verificar que el usuario que rechaza es admin u owner del workspace
    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Verificar que la solicitud esté pendiente
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({ message: "Join request is not pending" });
    }

    // Actualizar el estado de la solicitud
    joinRequest.status = 'rejected';
    await joinRequest.save();

    // Registrar en el historial
    await recordHistory(
      req.user._id,
      "rejected_join_request",
      "Workspace",
      workspace._id,
      {
        description: `Rejected ${joinRequest.user.name}'s join request${reason ? `: ${reason}` : ''}`,
        targetUser: joinRequest.user._id,
        reason: reason || null
      }
    );

    // Enviar correo de notificación al usuario
    const emailContent = `
      <p>Your request to join the workspace "${workspace.name}" has been rejected.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>If you believe this was a mistake, you can submit another request or contact the workspace administrators.</p>
    `;

    await sendEmail(
      joinRequest.user.email,
      `Your request to join ${workspace.name} has been rejected`,
      emailContent
    );

    res.status(200).json({
      message: "Join request rejected successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPendingJoinRequests = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Verificar que el workspace exista
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Verificar que el usuario es admin u owner del workspace
    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Obtener solicitudes pendientes con información del usuario
    const pendingRequests = await WorkspaceJoinRequest.find({
      workspaceId: workspaceId,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('user', 'name email profilePicture');

    res.status(200).json(pendingRequests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPendingJoinRequest = async (req, res) => {
    try {
    const { workspaceId } = req.params;

    // Verificar que el workspace exista
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Verificar que el usuario es admin u owner del workspace
    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Obtener solicitudes pendientes con información del usuario
    const pendingRequest = await WorkspaceJoinRequest.findOne({
      workspaceId: workspaceId,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('user', 'name email profilePicture');

    res.status(200).json(pendingRequest);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, color, description } = req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Encontrar la información del miembro actual
    const userMemberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    // Verificar que el usuario es miembro del workspace
    if (!userMemberInfo) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    //Only owners and admins can make changes.
    if (!["owner", "admin"].includes(userMemberInfo.role)) {
      return res.status(403).json({
        message: "You don't have permission to update this workspace.",
      });
    }

    const oldName = workspace.name;
    const oldColor = workspace.color;

    const oldDescription =
      workspace.description.substring(0, 50) +
      (workspace.description.length > 50 ? "..." : "");

    const newDescription =
      workspace.description.substring(0, 50) +
      (workspace.description.length > 50 ? "..." : "");

    workspace.name = name;
    workspace.color = color;
    workspace.description = description;
    await workspace.save();

    // record History
    await recordHistory(
      req.user._id,
      "updated_workspace",
      "Workspace",
      workspaceId,
      {
        description: `updated workspace from:
          - name: ${oldName} to ${name}
          - color: ${oldColor} to ${color}
          - description ${oldDescription} to ${newDescription}`,
      }
    );

    res.status(200).json(workspace);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

const transferWorkspaceOwner = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { newOwnerId } = req.body;

    // 1. Verificar que el workspace existe
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // 2. Verificar que el usuario actual es el owner
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the workspace owner can transfer ownership",
      });
    }

    // 3. Verificar que el nuevo owner existe y es miembro del workspace
    const newOwnerMember = workspace.members.find(
      member => member.user.toString() === newOwnerId
    );

    if (!newOwnerMember) {
      return res.status(400).json({
        message: "The selected user is not a member of this workspace",
      });
    }

    // 4. Verificar que no se está transfiriendo al mismo usuario
    if (newOwnerId === req.user._id.toString()) {
      return res.status(400).json({
        message: "You are already the owner of this workspace",
      });
    }

    // 5. Guardar el owner anterior para el historial
    const previousOwnerId = workspace.owner;

    // 6. Actualizar el owner del workspace
    workspace.owner = newOwnerId;

    // 7. Actualizar los roles en el array de miembros
    workspace.members = workspace.members.map(member => {
      if (member.user.toString() === newOwnerId) {
        // Nuevo owner se convierte en owner
        return { ...member.toObject(), role: 'owner' };
      } else if (member.user.toString() === req.user._id.toString()) {
        // Owner anterior se convierte en admin
        return { ...member.toObject(), role: 'admin' };
      }
      return member;
    });

    await workspace.save();

    // 8. Registrar en el historial
    await Promise.all([
      recordHistory(
        req.user._id,
        "transferred_workspace_ownership",
        "Workspace",
        workspaceId,
        {
          description: `Transferred workspace ownership to ${newOwnerMember.user?.name || 'new owner'}`,
          targetUser: newOwnerId
        }
      ),
      recordHistory(
        newOwnerId,
        "received_workspace_ownership",
        "Workspace",
        workspaceId,
        {
          description: `Received workspace ownership from ${req.user.name}`,
          targetUser: req.user._id
        }
      )
    ]);

    // 9. Populate para devolver el workspace actualizado
    const updatedWorkspace = await Workspace.findById(workspaceId)
      .populate('owner', 'name email profilePicture')
      .populate('members.user', 'name email profilePicture');

    res.status(200).json({
      workspace: updatedWorkspace
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // 1. Verificar que el workspace exista
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // 2. Verificar que el usuario es el owner del workspace
    const ownerMember = workspace.members.find(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.role === 'owner'
    );

    if (!ownerMember) {
      return res.status(403).json({
        message: "Only the workspace owner can delete the workspace",
      });
    }

    // 3. Obtener todos los proyectos del workspace
    const projects = await Project.find({ workspace: workspaceId });
    const projectIds = projects.map(project => project._id);

    // 4. Obtener todos los backlogs de estos proyectos
    const backlogs = await Backlog.find({ project: { $in: projectIds } });
    const backlogIds = backlogs.map(backlog => backlog._id);

    // 5. Obtener todas las actividades de estos backlogs
    const activities = await Activity.find({ backlog: { $in: backlogIds } });
    const activityIds = activities.map(activity => activity._id);

    // 6. Obtener todos los sprints de estos backlogs
    const sprints = await Sprint.find({ backlog: { $in: backlogIds } });
    const sprintIds = sprints.map(sprint => sprint._id);

    // 7. Obtener todos los comentarios de estas actividades
    const comments = await Comment.find({ activity: { $in: activityIds } });
    const commentIds = comments.map(comment => comment._id);

    // 8. Eliminar en cascada (en orden inverso para mantener referencias)
    await Promise.all([
      // Eliminar comentarios
      Comment.deleteMany({ _id: { $in: commentIds } }),

      // Eliminar actividades
      Activity.deleteMany({ _id: { $in: activityIds } }),

      // Eliminar sprints
      Sprint.deleteMany({ _id: { $in: sprintIds } }),

      // Eliminar backlogs
      Backlog.deleteMany({ _id: { $in: backlogIds } }),

      // Eliminar proyectos
      Project.deleteMany({ _id: { $in: projectIds } }),

      // Finalmente eliminar el workspace
      Workspace.deleteOne({ _id: workspaceId }),

      // Registrar en el historial
      recordHistory(
        req.user._id,
        "deleted_workspace",
        "Workspace",
        workspaceId,
        {
          description: `Deleted workspace: ${workspace.name} and all related data`,
        }
      )
    ]);

    res.status(200).json({
      message: "Workspace and all related data deleted successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// const getAchievedData = async (req, res) => {
//   try {
//     const { workspaceId } = req.params;

//     const workspace = await Workspace.findById(workspaceId);

//     if (!workspace) {
//       return res.status(404).json({
//         message: "Workspace not found",
//       });
//     }

//     const isMember = workspace.members.some(
//       (member) => member.user.toString() === req.user._id.toString()
//     );

//     if (!isMember) {
//       return res.status(403).json({
//         message: "You are not a member of this workspace",
//       });
//     }

//     // Obtener proyectos del workspace
//     const projects = await Project.find({
//       workspace: workspaceId,
//     })
//       .populate({
//         path: "backlog",
//         populate: [
//           {
//             path: "activities",
//             match: { isArchived: true },
//             populate: {
//               path: "assignees",
//               select: "name email profilePicture",
//             },
//           },
//           {
//             path: "sprints",
//             match: { isArchived: true },
//             populate: {
//               path: "activities",
//               populate: {
//                 path: "assignees",
//                 select: "name email profilePicture",
//               },
//             },
//           },
//         ],
//       })
//       .select("title description tags createdAt");

//     console.log(projects)

//     // Filtrar proyectos que tienen elementos archivados
//     const projectsWithArchivedData = projects
//       .map((project) => {
//         const archivedActivities = project.backlog?.activities || [];
//         const archivedSprints = project.backlog?.sprints || [];

//         // Solo incluir proyectos que tienen al menos un elemento archivado
//         if (archivedActivities.length > 0 || archivedSprints.length > 0) {
//           return {
//             _id: project._id,
//             title: project.title,
//             description: project.description,
//             tags: project.tags,
//             createdAt: project.createdAt,
//             archivedActivities,
//             archivedSprints,
//           };
//         }
//         return null;
//       })
//       .filter((project) => project !== null);

//     res.status(200).json({
//       workspace: {
//         _id: workspace._id,
//         name: workspace.name,
//       },
//       projects: projectsWithArchivedData,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// };

// Función auxiliar para obtener IDs de finishedSprints

async function getFinishedSprintsIds(backlogIds) {
  const backlogs = await Backlog.find({ _id: { $in: backlogIds } })
    .select("finishedSprints");
  return backlogs.flatMap(backlog => backlog.finishedSprints || []);
}

const getAchievedData = async (req, res) => {
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
        message: "You are not a member of this workspace",
      });
    }

    // Obtener proyectos del workspace con sus backlogs
    const projects = await Project.find({
      workspace: workspaceId,
    })
      .populate({
        path: "backlog",
        select: "activities sprints finishedSprints",
      })
      .select("title description tags createdAt");

    // Obtener todos los IDs de backlogs
    const backlogIds = projects
      .map(project => project.backlog?._id)
      .filter(id => id);

    // Buscar actividades archivadas directamente del backlog
    const archivedActivities = await Activity.find({
      backlog: { $in: backlogIds },
      isArchived: true
    }).populate({
      path: "assignees",
      select: "name email profilePicture",
    });

    // Buscar sprints archivados (tanto de sprints activos como finishedSprints)
    const archivedSprints = await Sprint.find({
      $or: [
        { backlog: { $in: backlogIds }, isArchived: true },
        { _id: { $in: await getFinishedSprintsIds(backlogIds) } }
      ]
    }).populate({
      path: "activities",
      populate: {
        path: "assignees",
        select: "name email profilePicture",
      },
    });

    // Organizar los datos por proyecto
    const projectsWithArchivedData = projects
      .map((project) => {
        if (!project.backlog) return null;

        const projectArchivedActivities = archivedActivities.filter(
          activity => activity.backlog.toString() === project.backlog._id.toString()
        );

        const projectArchivedSprints = archivedSprints.filter(
          sprint => sprint.backlog.toString() === project.backlog._id.toString()
        );

        // Solo incluir proyectos que tienen al menos un elemento archivado
        if (projectArchivedActivities.length > 0 || projectArchivedSprints.length > 0) {
          return {
            _id: project._id,
            title: project.title,
            description: project.description,
            tags: project.tags,
            createdAt: project.createdAt,
            archivedActivities: projectArchivedActivities,
            archivedSprints: projectArchivedSprints,
          };
        }
        return null;
      })
      .filter((project) => project !== null);

    res.status(200).json({
      workspace: {
        _id: workspace._id,
        name: workspace.name,
      },
      projects: projectsWithArchivedData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  createWorkspace,
  getWorkspaces,
  getAllWorkspaces,
  getPublicWorkspaceDetails,
  getPublicWorkspaceProjects,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaceStats,
  inviteUserToWorkspace,
  acceptGenerateInvite,
  acceptInviteByToken,
  joinRequestToWorkspace,
  acceptJoinRequestByToken,
  rejectJoinRequestByToken,
  getPendingJoinRequests,
  getPendingJoinRequest,
  updateWorkspace,
  transferWorkspaceOwner,
  deleteWorkspace,
  getAchievedData
};