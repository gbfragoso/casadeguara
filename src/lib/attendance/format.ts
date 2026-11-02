import type { AttendancePeriod } from './dates';

export const ATTENDANCE_READY_LABEL = 'Lista de frequência pronta para impressão.';

export const ATTENDANCE_NOTICE = 'OBS.: Caso seu nome não esteja nesta lista, favor escrevê-lo ao final.';

export const buildAttendanceFileName = ({ start, end }: AttendancePeriod): string => `frequencia-${start}-a-${end}.pdf`;
