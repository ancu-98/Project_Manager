import mongoose from "mongoose";

const workspaceModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: { type: String, trim: true },
    color: { type: String, default: "#FF5733" },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [
        {
            user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
            role: {
                type: String,
                enum: ['owner', 'member', 'admin', 'viewer'],
                default: 'member'
            },
            joinedAt: {type: Date, default: Date.now}
        },
    ],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project'}]

},{ timestamps: true });

const Workspace = mongoose.model('Workspace', workspaceModel);

export default  Workspace;