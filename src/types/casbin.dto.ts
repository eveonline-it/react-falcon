/**
 * Casbin Data Transfer Objects based on OpenAPI specification
 * All DTOs follow the exact structure defined in the backend OpenAPI spec
 */

// Base interfaces matching OpenAPI schemas

export interface CharacterInfo {
  character_id: number;
  character_name: string;
  scopes: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  valid: boolean;
}

export interface UserResponse {
  character_id: number;
  user_id: string;
  enabled: boolean;
  banned: boolean;
  invalid: boolean;
  scopes: string;
  position: number;
  notes: string;
  created_at: string;
  updated_at: string;
  last_login: string;
  character_name: string;
  valid: boolean;
}

export interface UserQueryParams {
  query?: string; // Search by character name or ID (max 100 characters)
  enabled?: boolean; // Filter by enabled status
  banned?: boolean; // Filter by banned status
  invalid?: boolean; // Filter by invalid status
  position?: number; // Filter by position value
  page?: number; // Page number (minimum 1)
  page_size?: number; // Items per page (maximum 100)
  sort_by?: string; // Sort field
  sort_order?: 'asc' | 'desc'; // Sort order
}

export interface UserListResponse {
  users: UserResponse[] | null; // Can be null according to OpenAPI spec
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RoleInfo {
  assigned_at: string; // date-time
  domain: string;
  role: string;
  character_id?: number; // Optional for character-specific roles
}

export interface RoleListResponse {
  roles: string[][]; // Array of arrays: [user_id, role, domain]
  count: number;
}

export interface PolicyInfo {
  subject: string;
  resource: string;
  action: string;
  domain: string;
  effect: string;
}

export interface PolicyListResponse {
  policies: string[][]; // Array of arrays: [subject, resource, action, domain, effect]
  count: number;
}

export interface RoleAssignmentRequest {
  user_id: string;
  role: string;
  domain?: string; // Optional, default: global
  character_id?: number; // Optional for character-specific role
}

export interface RoleAssignmentResponse {
  success: boolean;
  message: string;
  assignment?: RoleInfo;
}

export interface BulkRoleAssignmentRequest {
  assignments: RoleAssignmentRequest[];
}

export interface BulkRoleAssignmentResponse {
  successful_assignments: number;
  failed_assignments: RoleAssignmentRequest[];
  results: RoleAssignmentResponse[];
}

export interface RoleRemovalRequest {
  character_id: number;
  role: string;
  domain: string;
}

export interface PolicyAssignmentRequest {
  subject: string;
  resource: string;
  action: string;
  domain: string;
  effect?: string;
}

export interface PolicyAssignmentResponse {
  success: boolean;
  message: string;
  policy?: PolicyInfo;
}

export interface PolicyRemovalRequest {
  subject: string;
  resource: string;
  action: string;
  domain: string;
}

export interface PermissionCheckRequestWithChar {
  character_id: number;
  resource: string;
  action: string;
  domain?: string;
}

export interface PermissionCheckResponseWithChar {
  allowed: boolean;
  character_id: number;
  resource: string;
  action: string;
  domain: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  user_id: string;
  character_id: number | null;
  character_name: string | null;
  characters: CharacterInfo[];
  character_ids: number[];
  corporation_ids: number[];
  alliance_ids: number[];
  permissions: string[];
}

// DTO Classes for data transformation and validation

export class UserDTO {
  public readonly id: string;
  public readonly characterId: number;
  public readonly characterName: string;
  public readonly enabled: boolean;
  public readonly banned: boolean;
  public readonly invalid: boolean;
  public readonly scopes: string[];
  public readonly position: number;
  public readonly notes: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly lastLogin: Date | null;
  public readonly valid: boolean;

  constructor(apiData: UserResponse) {
    this.validateUserResponse(apiData);
    
    this.id = apiData.user_id;
    this.characterId = apiData.character_id;
    this.characterName = apiData.character_name;
    this.enabled = apiData.enabled;
    this.banned = apiData.banned;
    this.invalid = apiData.invalid;
    this.scopes = this.parseScopes(apiData.scopes);
    this.position = apiData.position;
    this.notes = apiData.notes || '';
    this.createdAt = new Date(apiData.created_at);
    this.updatedAt = new Date(apiData.updated_at);
    this.lastLogin = apiData.last_login ? new Date(apiData.last_login) : null;
    this.valid = apiData.valid;
  }

  private validateUserResponse(data: UserResponse): void {
    if (!data) throw new Error('UserResponse data is required');
    if (typeof data.character_id !== 'number') throw new Error('character_id must be a number');
    if (typeof data.user_id !== 'string') throw new Error('user_id must be a string');
    if (typeof data.character_name !== 'string') throw new Error('character_name must be a string');
    if (typeof data.enabled !== 'boolean') throw new Error('enabled must be a boolean');
    if (typeof data.banned !== 'boolean') throw new Error('banned must be a boolean');
    if (typeof data.valid !== 'boolean') throw new Error('valid must be a boolean');
  }

  private parseBooleanField(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  }

  private parseScopes(scopes: string): string[] {
    if (!scopes) return [];
    return scopes.split(',').map(scope => scope.trim()).filter(Boolean);
  }

  public toDisplayFormat() {
    return {
      id: this.id,
      characterId: this.characterId,
      characterName: this.characterName,
      enabled: this.enabled,
      banned: this.banned,
      invalid: this.invalid,
      scopes: this.scopes,
      position: this.position,
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      lastLogin: this.lastLogin?.toISOString() || null,
      valid: this.valid,
      status: this.getStatus()
    };
  }

  public toApiUpdateFormat(): Partial<UserResponse> {
    return {
      character_name: this.characterName,
      enabled: this.enabled,
      notes: this.notes
    };
  }

  private getStatus(): 'active' | 'disabled' | 'banned' | 'invalid' {
    if (this.banned) return 'banned';
    if (this.invalid) return 'invalid';
    if (!this.enabled) return 'disabled';
    return 'active';
  }

  public hasScope(scope: string): boolean {
    return this.scopes.includes(scope);
  }

  public isActive(): boolean {
    return this.enabled && !this.banned && this.valid && !this.invalid;
  }
}

export class RoleDTO {
  public readonly name: string;
  public readonly domain: string;
  public readonly characterId?: number;
  public readonly assignedAt?: Date;

  constructor(apiData: RoleInfo) {
    this.validateRoleInfo(apiData);
    
    this.name = apiData.role;
    this.domain = apiData.domain;
    this.characterId = apiData.character_id;
    this.assignedAt = apiData.assigned_at ? new Date(apiData.assigned_at) : undefined;
  }

  private validateRoleInfo(data: RoleInfo): void {
    if (!data) throw new Error('RoleInfo data is required');
    if (typeof data.role !== 'string' || !data.role.trim()) throw new Error('role must be a non-empty string');
    if (typeof data.domain !== 'string' || !data.domain.trim()) throw new Error('domain must be a non-empty string');
    if (data.character_id !== undefined && typeof data.character_id !== 'number') {
      throw new Error('character_id must be a number or undefined');
    }
  }

  public toDisplayFormat() {
    return {
      name: this.name,
      domain: this.domain,
      characterId: this.characterId,
      assignedAt: this.assignedAt?.toISOString(),
      isSystemRole: this.isSystemRole()
    };
  }

  public toAssignmentRequest(characterId: number): RoleAssignmentRequest {
    return {
      character_id: characterId,
      role: this.name,
      domain: this.domain
    };
  }

  public toRemovalRequest(characterId: number): RoleRemovalRequest {
    return {
      character_id: characterId,
      role: this.name,
      domain: this.domain
    };
  }

  private isSystemRole(): boolean {
    return ['admin', 'user', 'guest'].includes(this.name.toLowerCase());
  }

  public canBeDeleted(): boolean {
    return !this.isSystemRole();
  }
}

export class PolicyDTO {
  public readonly subject: string;
  public readonly resource: string;
  public readonly action: string;
  public readonly domain: string;
  public readonly effect: string;

  constructor(apiData: PolicyInfo) {
    this.validatePolicyInfo(apiData);
    
    this.subject = apiData.subject;
    this.resource = apiData.resource;
    this.action = apiData.action;
    this.domain = apiData.domain;
    this.effect = apiData.effect;
  }

  private validatePolicyInfo(data: PolicyInfo): void {
    if (!data) throw new Error('PolicyInfo data is required');
    if (typeof data.subject !== 'string' || !data.subject.trim()) throw new Error('subject must be a non-empty string');
    if (typeof data.resource !== 'string' || !data.resource.trim()) throw new Error('resource must be a non-empty string');
    if (typeof data.action !== 'string' || !data.action.trim()) throw new Error('action must be a non-empty string');
    if (typeof data.domain !== 'string' || !data.domain.trim()) throw new Error('domain must be a non-empty string');
    if (typeof data.effect !== 'string' || !data.effect.trim()) throw new Error('effect must be a non-empty string');
  }

  public toDisplayFormat() {
    return {
      subject: this.subject,
      resource: this.resource,
      action: this.action,
      domain: this.domain,
      effect: this.effect,
      permission: this.getPermissionString(),
      isRoutePolicy: this.isRoutePolicy(),
      isAllowPolicy: this.isAllowPolicy(),
      isDenyPolicy: this.isDenyPolicy()
    };
  }

  public toAssignmentRequest(): PolicyAssignmentRequest {
    return {
      subject: this.subject,
      resource: this.resource,
      action: this.action,
      domain: this.domain,
      effect: this.effect
    };
  }

  public toRemovalRequest(): PolicyRemovalRequest {
    return {
      subject: this.subject,
      resource: this.resource,
      action: this.action,
      domain: this.domain
    };
  }

  public getPermissionString(): string {
    return `${this.resource}:${this.action}`;
  }

  public isRoutePolicy(): boolean {
    return this.resource.startsWith('route:');
  }

  public isAllowPolicy(): boolean {
    return this.effect.toLowerCase() === 'allow';
  }

  public isDenyPolicy(): boolean {
    return this.effect.toLowerCase() === 'deny';
  }

  public matchesRoute(path: string, method: string): boolean {
    if (!this.isRoutePolicy()) return false;
    const routeResource = `route:${path}:${method}`;
    return this.resource === routeResource;
  }

  public appliesToUser(characterId: number): boolean {
    return this.subject === characterId.toString() || 
           this.subject === `user:${characterId}` ||
           this.subject === '*';
  }

  public appliesToRole(roleName: string): boolean {
    return this.subject === roleName;
  }
}

export class AuthStatusDTO {
  public readonly authenticated: boolean;
  public readonly userId: string;
  public readonly characterId: number | null;
  public readonly characterName: string | null;
  public readonly characters: CharacterInfo[];
  public readonly characterIds: number[];
  public readonly corporationIds: number[];
  public readonly allianceIds: number[];
  public readonly permissions: string[];

  constructor(apiData: AuthStatusResponse) {
    this.validateAuthStatusResponse(apiData);
    
    this.authenticated = apiData.authenticated;
    this.userId = apiData.user_id;
    this.characterId = apiData.character_id;
    this.characterName = apiData.character_name;
    this.characters = apiData.characters || [];
    this.characterIds = apiData.character_ids || [];
    this.corporationIds = apiData.corporation_ids || [];
    this.allianceIds = apiData.alliance_ids || [];
    this.permissions = apiData.permissions || [];
  }

  private validateAuthStatusResponse(data: AuthStatusResponse): void {
    if (!data) throw new Error('AuthStatusResponse data is required');
    if (typeof data.authenticated !== 'boolean') throw new Error('authenticated must be a boolean');
    if (typeof data.user_id !== 'string') throw new Error('user_id must be a string');
  }

  public toDisplayFormat() {
    return {
      authenticated: this.authenticated,
      userId: this.userId,
      characterId: this.characterId,
      characterName: this.characterName,
      characters: this.characters,
      characterIds: this.characterIds,
      corporationIds: this.corporationIds,
      allianceIds: this.allianceIds,
      permissions: this.permissions,
      hasCharacters: this.hasCharacters(),
      isValid: this.isValid(),
      primaryCharacter: this.getPrimaryCharacter()
    };
  }

  public hasCharacters(): boolean {
    return this.characters.length > 0;
  }

  public isValid(): boolean {
    return this.authenticated && this.hasCharacters();
  }

  public getPrimaryCharacter(): CharacterInfo | null {
    if (!this.hasCharacters()) return null;
    
    // Find character by current character_id or return first
    const primaryChar = this.characterId 
      ? this.characters.find(char => char.character_id === this.characterId)
      : null;
      
    return primaryChar || this.characters[0];
  }

  public hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  public hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  public isAdmin(): boolean {
    return this.hasAnyPermission(['admin:*', '*:*', '*:admin', 'admin:admin']);
  }

  public getValidCharacters(): CharacterInfo[] {
    return this.characters.filter(char => char.valid);
  }
}

// Factory functions for creating DTOs from API responses

export class CasbinDTOFactory {
  static createUser(apiData: UserResponse): UserDTO {
    return new UserDTO(apiData);
  }

  static createUsers(apiData: UserListResponse): {
    users: UserDTO[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    return {
      users: apiData.users ? apiData.users.map(user => new UserDTO(user)) : [],
      total: apiData.total,
      page: apiData.page,
      pageSize: apiData.page_size,
      totalPages: apiData.total_pages
    };
  }

  static createRole(apiData: RoleInfo): RoleDTO {
    return new RoleDTO(apiData);
  }

  static createRoles(apiData: RoleListResponse): {
    roles: RoleDTO[];
    total: number;
  } {
    return {
      roles: apiData.roles.map((roleArray: string[]) => {
        // Convert array format [user_id, role, domain] to RoleInfo object
        const [_subject, role, domain] = roleArray; // prefix with underscore to indicate unused
        const roleInfo: RoleInfo = {
          role: role.startsWith('role:') ? role.substring(5) : role, // Remove 'role:' prefix if present
          domain: domain || 'global',
          assigned_at: new Date().toISOString(), // Default to current time since not provided
          character_id: undefined // Not available in this endpoint format
        };
        return new RoleDTO(roleInfo);
      }),
      total: apiData.count
    };
  }

  static createPolicy(apiData: PolicyInfo): PolicyDTO {
    return new PolicyDTO(apiData);
  }

  static createPolicies(apiData: PolicyListResponse): {
    policies: PolicyDTO[];
    total: number;
  } {
    return {
      policies: apiData.policies.map((policyArray: string[]) => {
        // Convert array format [subject, resource, action, domain, effect] to PolicyInfo object
        const [subject, resource, action, domain, effect] = policyArray;
        const policyInfo: PolicyInfo = {
          subject: subject.startsWith('role:') ? subject.substring(5) : subject, // Remove 'role:' prefix if present for consistency
          resource: resource,
          action: action,
          domain: domain || 'global',
          effect: effect || 'allow'
        };
        return new PolicyDTO(policyInfo);
      }),
      total: apiData.count
    };
  }

  static createAuthStatus(apiData: AuthStatusResponse): AuthStatusDTO {
    return new AuthStatusDTO(apiData);
  }

  // Create user roles response from API data
  static createUserRoles(apiData: { roles?: RoleInfo[]; total?: number }): {
    roles: RoleDTO[];
    total: number;
  } {
    return {
      roles: apiData.roles ? apiData.roles.map((role: RoleInfo) => {
        // Ensure consistent role name format (remove 'role:' prefix if present)
        const normalizedRole: RoleInfo = {
          ...role,
          role: role.role.startsWith('role:') ? role.role.substring(5) : role.role
        };
        return new RoleDTO(normalizedRole);
      }) : [],
      total: apiData.total || 0
    };
  }

  // Create role policies response from API data
  static createRolePolicies(apiData: { policies?: PolicyInfo[]; total?: number }): {
    policies: PolicyDTO[];
    total: number;
  } {
    return {
      policies: apiData.policies ? apiData.policies.map((policy: PolicyInfo) => new PolicyDTO(policy)) : [],
      total: apiData.total || 0
    };
  }

  // Helper methods for creating request DTOs
  static createRoleAssignmentRequest(userId: string, role: string, domain: string = 'global', characterId?: number): RoleAssignmentRequest {
    // Ensure role has 'role:' prefix format
    const roleWithPrefix = role.startsWith('role:') ? role : `role:${role}`;
    
    const request: RoleAssignmentRequest = {
      user_id: userId,
      role: roleWithPrefix,
      domain
    };
    
    if (characterId) {
      request.character_id = characterId;
    }
    
    return request;
  }

  static createPolicyAssignmentRequest(
    subject: string, 
    resource: string, 
    action: string, 
    domain: string = 'default',
    effect: string = 'allow'
  ): PolicyAssignmentRequest {
    return {
      subject,
      resource,
      action,
      domain,
      effect
    };
  }

  static createPermissionCheckRequest(
    characterId: number,
    resource: string,
    action: string,
    domain: string = 'default'
  ): PermissionCheckRequestWithChar {
    return {
      character_id: characterId,
      resource,
      action,
      domain
    };
  }
}

// Type guards for runtime type checking
export const isUserResponse = (data: any): data is UserResponse => {
  return data && 
         typeof data.character_id === 'number' &&
         typeof data.user_id === 'string' &&
         typeof data.character_name === 'string' &&
         typeof data.enabled === 'boolean';
};

export const isRoleInfo = (data: any): data is RoleInfo => {
  return data && 
         typeof data.role === 'string' &&
         typeof data.domain === 'string';
};

export const isPolicyInfo = (data: any): data is PolicyInfo => {
  return data && 
         typeof data.subject === 'string' &&
         typeof data.resource === 'string' &&
         typeof data.action === 'string' &&
         typeof data.domain === 'string' &&
         typeof data.effect === 'string';
};

export const isAuthStatusResponse = (data: any): data is AuthStatusResponse => {
  return data && 
         typeof data.authenticated === 'boolean' &&
         typeof data.user_id === 'string' &&
         Array.isArray(data.characters);
};