const { TaskData, MemberData, TeamData } = require("../data");

const computeReadinessMetrics = async () => {
    const teams = await TeamData.getAll();
    const members = await MemberData.getAllWithTeams();
    const tasks = await TaskData.getAllWithMembers();

    if (!members.length || !tasks.length || !teams.length) {
        return {
            overallReadiness: 0,
            atRiskTeams: [],
            atRiskMembers: [],
            bottleneckTasks: [],
        };
    }

    const totalTasks = tasks.length;
    const readyTasks = tasks.filter((t) => !t.overdue).length;
    const overallReadiness = Math.round((readyTasks / totalTasks) * 100);

    // Member readiness
    const memberMap = {};
    members.forEach((m) => {
        memberMap[m.id] = { name: m.name, teamId: m.team_id, readinessTasks: [] };
    });

    tasks.forEach((t) => {
        const member = memberMap[t.member_id];
        if (!member) return;
        member.readinessTasks.push(!t.overdue ? 1 : 0);
    });

    const atRiskMembers = Object.values(memberMap)
        .map((m) => ({
            name: m.name,
            readiness: m.readinessTasks.length
                ? Math.round(
                      (m.readinessTasks.reduce((a, b) => a + b, 0) / m.readinessTasks.length) * 100
                  )
                : 0,
        }))
        .sort((a, b) => a.readiness - b.readiness)
        .slice(0, 5);

    // Team readiness
    const teamMap = {};
    teams.forEach((team) => {
        teamMap[team.id] = { name: team.name, readinessList: [] };
    });

    Object.values(memberMap).forEach((m) => {
        if (teamMap[m.teamId]) {
            teamMap[m.teamId].readinessList.push(
                m.readinessTasks.length
                    ? Math.round(
                          (m.readinessTasks.reduce((a, b) => a + b, 0) / m.readinessTasks.length) *
                              100
                      )
                    : 0
            );
        }
    });

    const atRiskTeams = Object.values(teamMap)
        .map((t) => ({
            name: t.name,
            readiness: t.readinessList.length
                ? Math.round(t.readinessList.reduce((a, b) => a + b, 0) / t.readinessList.length)
                : 0,
        }))
        .sort((a, b) => a.readiness - b.readiness)
        .slice(0, 5);

    // Bottleneck tasks
    const bottleneckTasksMap = {};
    tasks.forEach((t) => {
        if (t.overdue) {
            bottleneckTasksMap[t.name] = (bottleneckTasksMap[t.name] || 0) + 1;
        }
    });

    const bottleneckTasks = Object.entries(bottleneckTasksMap).map(([name, count]) => ({
        name,
        count,
    }));

    return {
        overallReadiness,
        atRiskTeams,
        atRiskMembers,
        bottleneckTasks,
    };
};

module.exports = {
    computeReadinessMetrics,
};
