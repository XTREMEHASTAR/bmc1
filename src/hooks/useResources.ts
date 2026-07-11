import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTraumaBays,
  updateBayStatus,
  assignPatientToBay,
  subscribeToTraumaBays,
  fetchAmbulances,
  updateAmbulanceGPS,
  subscribeToAmbulances,
  fetchIncidents,
  createIncident,
  fetchResources,
  updateResourceAvailability,
  subscribeToResources
} from '../services/resources';
import { TraumaBay, Ambulance, Incident, Resource } from '../types/emergency';

// Trauma Bays
export function useTraumaBays() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['traumaBays'],
    queryFn: fetchTraumaBays,
    staleTime: Infinity,
  });

  useEffect(() => {
    const unsubscribe = subscribeToTraumaBays(() => {
      queryClient.invalidateQueries({ queryKey: ['traumaBays'] });
    });
    return unsubscribe;
  }, [queryClient]);

  return query;
}

export function useUpdateBayStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bayId, status, notes }: { bayId: string; status: TraumaBay['status']; notes?: string }) =>
      updateBayStatus(bayId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traumaBays'] });
    }
  });
}

export function useAssignPatientToBay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bayId, registrationId, patientId, doctorId, nurseId }: { bayId: string; registrationId: string; patientId: string; doctorId?: string; nurseId?: string }) =>
      assignPatientToBay(bayId, registrationId, patientId, doctorId, nurseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traumaBays'] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    }
  });
}

// Ambulances
export function useAmbulances() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['ambulances'],
    queryFn: fetchAmbulances,
    staleTime: Infinity,
  });

  useEffect(() => {
    const unsubscribe = subscribeToAmbulances(() => {
      queryClient.invalidateQueries({ queryKey: ['ambulances'] });
    });
    return unsubscribe;
  }, [queryClient]);

  return query;
}

export function useUpdateAmbulanceGPS() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ambulanceId, lat, lng }: { ambulanceId: string; lat: number; lng: number }) =>
      updateAmbulanceGPS(ambulanceId, lat, lng),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulances'] });
    }
  });
}

// Incidents
export function useIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: fetchIncidents,
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['ambulances'] });
    }
  });
}

// Resources (Ventilators, Defibs, etc.)
export function useResources() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['resources'],
    queryFn: fetchResources,
    staleTime: Infinity,
  });

  useEffect(() => {
    const unsubscribe = subscribeToResources(() => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    });
    return unsubscribe;
  }, [queryClient]);

  return query;
}

export function useUpdateResourceAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ resourceId, available, inUse }: { resourceId: string; available: number; inUse: number }) =>
      updateResourceAvailability(resourceId, available, inUse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    }
  });
}
