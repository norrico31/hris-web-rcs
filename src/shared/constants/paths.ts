
export const taskSettingsPaths: Record<string, string> = {
    'ja01': 'activities',
    'ja02': 'activities',
    'ja03': 'activities',
    'ja04': 'activities',
    'jb01': 'types',
    'jb02': 'types',
    'jb03': 'types',
    'jb04': 'types',
    'jc01': 'sprints',
    'jc02': 'sprints',
    'jc03': 'sprints',
    'jc04': 'sprints',
}

export const hrSettingsPaths: Record<string, string> = {
    'ka01': 'bankdetails',
    'ka02': 'bankdetails',
    'ka03': 'bankdetails',
    'ka04': 'bankdetails',
    'kb01': 'benefits',
    'kb02': 'benefits',
    'kb03': 'benefits',
    'kb04': 'benefits',
    'kc01': 'holidays',
    'kc02': 'holidays',
    'kc03': 'holidays',
    'kc04': 'holidays',
    'kd01': 'holidaytypes',
    'kd02': 'holidaytypes',
    'kd03': 'holidaytypes',
    'kd04': 'holidaytypes',
    'ke01': 'dailyrates',
    'ke02': 'dailyrates',
    'ke03': 'dailyrates',
    'ke04': 'dailyrates',
    'kf01': 'employmentstatuses',
    'kf02': 'employmentstatuses',
    'kf03': 'employmentstatuses',
    'kf04': 'employmentstatuses',
    'kg01': 'departments',
    'kg02': 'departments',
    'kg03': 'departments',
    'kg04': 'departments',
    'kh01': 'teams',
    'kh02': 'teams',
    'kh03': 'teams',
    'kh04': 'teams',
    'ki01': 'positions',
    'ki02': 'positions',
    'ki03': 'positions',
    'ki04': 'positions',
    'kj01': 'leavestatuses',
    'kj02': 'leavestatuses',
    'kj03': 'leavestatuses',
    'kj04': 'leavestatuses',
    'kk01': 'leavedurations',
    'kk02': 'leavedurations',
    'kk03': 'leavedurations',
    'kk04': 'leavedurations',
    'kl01': 'leavetypes',
    'kl02': 'leavetypes',
    'kl03': 'leavetypes',
    'kl04': 'leavetypes',
    'km01': 'salaries',
    'kn01': 'schedules'
}

export const clientSettingsPaths = {
    'la01': 'clients',
    'la02': 'clients',
    'la03': 'clients',
    'la04': 'clients',
    'lb01': 'clientbranches',
    'lb02': 'clientbranches',
    'lb03': 'clientbranches',
    'lb04': 'clientbranches',
    'lc01': 'clientadjustments',
    'lc02': 'clientadjustments',
    'lc03': 'clientadjustments',
    'lc04': 'clientadjustments',
}

export const adminSettingsPaths = {
    'ia01': 'users',
    'ia02': 'users',
    'ia03': 'users',
    'ia04': 'users',
    'ib01': 'roles',
    'ib02': 'roles',
    'ib03': 'roles',
    'ib04': 'roles',
    'ic01': 'auditlogs',
    'ic02': 'auditlogs',
    'ic03': 'auditlogs',
    'ic04': 'auditlogs',
    'id01': 'systemlogs',
    'id02': 'systemlogs',
    'id03': 'systemlogs',
    'id04': 'systemlogs',
}

export const employeeFilesPaths = {
    'g01': 'employee',
    'g02': 'employee',
    'g03': 'employee',
    'g04': 'employee',
}

export const tasksPaths = {
    'e01': 'tasks',
    'e02': 'tasks',
    'e03': 'tasks',
    'e04': 'tasks',
}

export const leavesPaths = {
    'c01': 'leave',
    'c02': 'leave',
    'c03': 'leave',
    'c04': 'leave',
}

export const salaryAdjustmentsPaths = {
    'h01': 'salaryadjustments',
    'h02': 'salaryadjustments',
    'h03': 'salaryadjustments',
    'h04': 'salaryadjustments',
}

export const rootPaths = {
    'a01': 'dashboard',
    'd01': 'announcements',
    'd02': 'announcements',
    'd03': 'announcements',
    'd04': 'announcements',
    ...tasksPaths,
    'b01': 'timekeeping',
    ...employeeFilesPaths,
    ...leavesPaths,
    ...salaryAdjustmentsPaths,
}

export const allPaths = {
    ...taskSettingsPaths,
    ...hrSettingsPaths,
    ...clientSettingsPaths,
    ...adminSettingsPaths,
    ...employeeFilesPaths,
    ...tasksPaths,
    ...leavesPaths,
    ...salaryAdjustmentsPaths,
}