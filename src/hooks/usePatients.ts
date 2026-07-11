import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRegistrations,
  registerEmergencyPatient,
  updatePatientStatus,
  confirmTriage,
  recordVitals,
  subscribeToRegistrations
} from '../services/patients';
import { RegisterPatientForm, EmergencyRegistration, TriageCategory, PatientVitals } from '../types/emergency';

export function useRegistrations() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['registrations'],
    queryFn: fetchRegistrations,
    staleTime: Infinity, // Rely on real-time subscriptions for updates
  });

  useEffect(() => {
    const unsubscribe = subscribeToRegistrations((newRegistrations) => {
      queryClient.setQueryData(['registrations'], newRegistrations);
    });
    return unsubscribe;
  }, [queryClient]);

  return query;
}

export function useRegisterPatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerEmergencyPatient,
    onSuccess: (data) => {
      queryClient.setQueryData(['registrations'], (old: any) => {
        if (!old) return [data];
        return [data, ...old];
      });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    }
  });
}

export function useUpdatePatientStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registrationId, status }: { registrationId: string; status: EmergencyRegistration['status'] }) =>
      updatePatientStatus(registrationId, status),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['registrations'], (old: EmergencyRegistration[] | undefined) => {
        if (!old) return old;
        return old.map(r => r.id === variables.registrationId ? { ...r, status: variables.status } : r);
      });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    }
  });
}

export function useConfirmTriage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registrationId, category, doctorId }: { registrationId: string; category: TriageCategory; doctorId?: string }) =>
      confirmTriage(registrationId, category, doctorId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    }
  });
}

export function useRecordVitals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, registrationId, vitals }: { patientId: string; registrationId: string; vitals: Partial<PatientVitals> }) =>
      recordVitals(patientId, registrationId, vitals),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    }
  });
}
