export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  targetResourceType: string;
  targetResourceId: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

// class AdminContext {
//   private currentAdminUser: any = null;
//   private isAuthenticated: boolean = false;

//   setCurrentAdminUser(adminUser: any) {
//       this.currentAdminUser = adminUser;
//       this.isAuthenticated = true;
//   }

//   getCurrentAdminUser() {
//       return this.currentAdminUser;
//   }

//   isUserAuthenticated() {
//       return this.isAuthenticated;
//   }

//   logout() {
//       this.currentAdminUser = null;
//       this.isAuthenticated = false;
//   }
// }