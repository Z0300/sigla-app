export interface SessionAttendanceStat {
  sessionTitle: string;
  eventTitle: string;
  checkInCount: number;
  capacity: number;
}

export interface DailyRegistrationStat {
  date: string;
  count: number;
}

export interface OrganizerStats {
  totalEvents: number;
  activeEvents: number;
  totalRegistrations: number;
  totalCheckIns: number;
  checkInRate: number;
  attendeeStatusCounts: Record<string, number>;
  topSessions: SessionAttendanceStat[];
  registrationTrend: DailyRegistrationStat[];
}
