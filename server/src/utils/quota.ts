export const checkUserQuota = async (userId: string, fileSize: number): Promise<boolean> => {
    try {
    
        const totalUsedSpace = usedSpace[0]?.totalSize || 0;
    
        // Check if adding the new file exceeds the user's quota
        return (totalUsedSpace + fileSize) <= userPlan.quota;
    } catch (error) {
        console.error("Error checking user quota:", error);
        throw error;
    }
}