import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Incident,
  License,
  LocationShare,
  Metrics,
  SOSAlert,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      phone,
      neighborhood,
      licenseCode,
    }: {
      name: string;
      phone: string;
      neighborhood: string;
      licenseCode: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.registerUser(name, phone, neighborhood, licenseCode);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useIncidents(incidentType?: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Incident[]>({
    queryKey: ["incidents", incidentType ?? null],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listIncidents(incidentType ?? null);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useCreateIncident() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userName,
      incidentType,
      description,
      lat,
      lng,
      neighborhood,
    }: {
      userName: string;
      incidentType: string;
      description: string;
      lat: number;
      lng: number;
      neighborhood: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createIncident(
        userName,
        incidentType,
        description,
        lat,
        lng,
        neighborhood,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}

export function useConfirmIncident() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.confirmIncident(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incidents"] }),
  });
}

export function useFlagIncident() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.flagFalseIncident(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incidents"] }),
  });
}

export function useCreateSOS() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      userName,
      lat,
      lng,
      neighborhood,
    }: {
      userName: string;
      lat: number;
      lng: number;
      neighborhood: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createSOS(userName, lat, lng, neighborhood);
    },
  });
}

export function useUpdateSOS() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      id,
      lat,
      lng,
    }: { id: string; lat: number; lng: number }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateSOSLocation(id, lat, lng);
    },
  });
}

export function useResolveSOS() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.resolveSOS(id);
    },
  });
}

export function useActiveSOSAlerts() {
  const { actor, isFetching } = useActor();
  return useQuery<SOSAlert[]>({
    queryKey: ["sos-alerts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveSOSAlerts();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useOwnLocationShares() {
  const { actor, isFetching } = useActor();
  return useQuery<LocationShare[]>({
    queryKey: ["location-shares"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOwnActiveShareSessions();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useCreateLocationShare() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ownerName,
      lat,
      lng,
      shareLink,
      description,
    }: {
      ownerName: string;
      lat: number;
      lng: number;
      shareLink: string;
      description: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createLocationShare(
        ownerName,
        lat,
        lng,
        shareLink,
        description,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["location-shares"] }),
  });
}

export function useUpdateLocationShare() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      id,
      lat,
      lng,
    }: { id: string; lat: number; lng: number }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateLocationShare(id, lat, lng);
    },
  });
}

export function useDeactivateLocationShare() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deactivateLocationShare(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["location-shares"] }),
  });
}

export function useGetLocationShare(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<LocationShare>({
    queryKey: ["location-share", id],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getLocationShare(id);
    },
    enabled: !!actor && !isFetching && !!id,
    refetchInterval: 30000,
  });
}

export function useAllLicenses() {
  const { actor, isFetching } = useActor();
  return useQuery<License[]>({
    queryKey: ["licenses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllLicenses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMetrics() {
  const { actor, isFetching } = useActor();
  return useQuery<Metrics>({
    queryKey: ["metrics"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getMetrics();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useCreateLicense() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      code,
      clientName,
      phone,
    }: { code: string; clientName: string; phone: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createLicense(code, clientName, phone);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["licenses"] }),
  });
}

export function useActivateLicense() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("No actor");
      return actor.activateLicense(code);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["licenses"] }),
  });
}

export function useRenewLicense() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("No actor");
      return actor.renewLicense(code);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["licenses"] }),
  });
}

export function useBlockLicense() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("No actor");
      return actor.blockLicense(code);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["licenses"] }),
  });
}

export function useBlockUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error("No actor");
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.blockUser(Principal.fromText(userId));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUnblockUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error("No actor");
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.unblockUser(Principal.fromText(userId));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useValidateIncident() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.validateIncident(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incidents"] }),
  });
}

export function useRemoveIncident() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.removeIncident(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incidents"] }),
  });
}

export function useSetAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.setAdmin();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["isAdmin"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// Format bigint nanoseconds to locale date string
export function formatDate(ns: bigint): string {
  return new Date(Number(ns / 1_000_000n)).toLocaleDateString("pt-PT");
}

export function formatDateTime(ns: bigint): string {
  return new Date(Number(ns / 1_000_000n)).toLocaleString("pt-PT");
}

export function timeAgo(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  const diff = Date.now() - ms;
  if (diff < 60000) return "agora mesmo";
  if (diff < 3600000) return `há ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `há ${Math.floor(diff / 3600000)} h`;
  return `há ${Math.floor(diff / 86400000)} dias`;
}
