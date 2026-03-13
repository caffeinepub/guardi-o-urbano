import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface License {
    status: string;
    clientName: string;
    expiryDate: bigint;
    code: string;
    activationDate: bigint;
    assignedPhone: string;
}
export interface SOSAlert {
    id: string;
    lat: number;
    lng: number;
    status: string;
    userName: string;
    activatedAt: bigint;
    userId: Principal;
    neighborhood: string;
    lastLocationUpdate: bigint;
}
export interface Incident {
    id: string;
    lat: number;
    lng: number;
    confirmations: bigint;
    status: string;
    userName: string;
    userId: Principal;
    neighborhood: string;
    createdAt: bigint;
    description: string;
    adminValidated: boolean;
    falseReports: bigint;
    incidentType: string;
}
export interface LocationShare {
    id: string;
    lat: number;
    lng: number;
    ownerName: string;
    ownerId: Principal;
    lastUpdate: bigint;
    description?: string;
    isActive: boolean;
    shareLink: string;
}
export interface UserProfile {
    id: Principal;
    licenseStatus: string;
    name: string;
    licenseCode: string;
    isAdmin: boolean;
    registrationDate: bigint;
    licenseExpiry: bigint;
    licenseStart: bigint;
}
export interface Metrics {
    expiredLicenses: bigint;
    activeLicenses: bigint;
    activeSOSCount: bigint;
    totalUsers: bigint;
    totalSOSCount: bigint;
    totalIncidents: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    activateLicense(code: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockLicense(code: string): Promise<void>;
    blockUser(userId: Principal): Promise<void>;
    checkLicenseValidity(code: string): Promise<string>;
    confirmIncident(id: string): Promise<void>;
    createIncident(userName: string, incidentType: string, description: string, lat: number, lng: number, neighborhood: string): Promise<string>;
    createLicense(code: string, clientName: string, phone: string): Promise<void>;
    createLocationShare(ownerName: string, lat: number, lng: number, shareLink: string, description: string | null): Promise<string>;
    createSOS(userName: string, lat: number, lng: number, neighborhood: string): Promise<string>;
    deactivateLocationShare(id: string): Promise<void>;
    flagFalseIncident(id: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getIncidentById(id: string): Promise<Incident>;
    getLocationShare(id: string): Promise<LocationShare>;
    getMetrics(): Promise<Metrics>;
    getProfile(): Promise<UserProfile | null>;
    getSOSById(id: string): Promise<SOSAlert>;
    getUser(userId: Principal): Promise<UserProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listActiveSOSAlerts(): Promise<Array<SOSAlert>>;
    listAllLicenses(): Promise<Array<License>>;
    listAllUsers(): Promise<Array<UserProfile>>;
    listIncidents(incidentType: string | null): Promise<Array<Incident>>;
    listOwnActiveShareSessions(): Promise<Array<LocationShare>>;
    registerUser(name: string, phone: string, neighborhood: string, licenseCode: string): Promise<void>;
    removeIncident(id: string): Promise<void>;
    renewLicense(code: string): Promise<void>;
    resolveSOS(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAdmin(): Promise<void>;
    unblockUser(userId: Principal): Promise<void>;
    updateLocationShare(id: string, lat: number, lng: number): Promise<void>;
    updateSOSLocation(id: string, lat: number, lng: number): Promise<void>;
    validateIncident(id: string): Promise<void>;
}
