import HistoryLog from "../models/history.js"

const recordHistory = async (
    userId,
    action,
    resourceType,
    resourceId,
    details
) => {
    try {
        await HistoryLog.create({
            user: userId,
            action,
            resourceType,
            resourceId,
            details
        })
    } catch (error) {
        console.log(error)
    }
}

export { recordHistory };