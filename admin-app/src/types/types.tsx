export type AdminUser = {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
};

export type Auth = {
    accessToken: string;
    refreshToken: string;
};

export type AuditLog = {
    id: string;
    userId: string;
    action: string;
    targetResourceType: string;
    targetResourceId: string;
    timestamp: string;
};