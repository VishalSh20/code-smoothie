import { ExecutionStatus } from "@prisma/client"

export default async function getStatuses(req,res){
    const statuses = Object.values(ExecutionStatus);
    return res.status(200).json({
        statuses
    })
}