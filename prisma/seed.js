const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Create roles
  const roles = [
    { id: 1, roleName: "Admin" },
    { id: 2, roleName: "Staff" },
    { id: 3, roleName: "Manager" },
  ];

  await prisma.role.createMany({ data: roles });

  // Create RoleType
  const roleTypes = [
    { roleID: 1, AccessCode: "G0" },
    { roleID: 1, AccessCode: "G1" },
    { roleID: 1, AccessCode: "S1" },
    { roleID: 1, AccessCode: "S2" },
    { roleID: 1, AccessCode: "S3" },
    { roleID: 2, AccessCode: "S1" },
    { roleID: 2, AccessCode: "S2" },
    { roleID: 2, AccessCode: "S3" },
    { roleID: 3, AccessCode: "G0" },
    { roleID: 3, AccessCode: "G1" },
    { roleID: 3, AccessCode: "S0" },
    { roleID: 3, AccessCode: "S1" },
    { roleID: 3, AccessCode: "S2" },
    { roleID: 3, AccessCode: "S3" },
  ];

  await prisma.roleType.createMany({ data: roleTypes });

  // Create departments
  const departments = [
    {
      departmentName: "Medical Department",
      departmentCode: 10100000,
      level: 2,
    },
    { departmentName: "General Practice", departmentCode: 10101000, level: 3 },
    { departmentName: "IT Services", departmentCode: 10301000, level: 3 },
    { departmentName: "HR Department", departmentCode: 10400000, level: 2 },
    {
      departmentName: "Finance Department",
      departmentCode: 10500000,
      level: 2,
    },
  ];

  await prisma.department.createMany({ data: departments });

  // Create positions
  const positions = [
    { jobTitle: "Department Head" },
    { jobTitle: "Team Leader" },
    { jobTitle: "Senior Staff" },
    { jobTitle: "Junior Staff" },
  ];

  await prisma.position.createMany({ data: positions });

  // Create user data
  const users = [
    {
      userName: "admin_user",
      password: "$2b$10$ITxfuSQAYcnDzQTgeUwTUeojkesNdmRM4pFvTiiXV2scjWk/ftQJe",
      email: "admin@example.com",
      roleID: 3,
      departmentName: "IT Services",
      jobTitle: "Department Head",
      accessCode: "G0",
    },
    {
      userName: "medical_manager",
      password: "$2b$10$ITxfuSQAYcnDzQTgeUwTUeojkesNdmRM4pFvTiiXV2scjWk/ftQJe",
      email: "medical.manager@example.com",
      roleID: 1,
      departmentName: "Medical Department",
      jobTitle: "Department Head",
      accessCode: "G1",
    },
    {
      userName: "staff_user",
      password: "$2b$10$ITxfuSQAYcnDzQTgeUwTUeojkesNdmRM4pFvTiiXV2scjWk/ftQJe",
      email: "staff@example.com",
      roleID: 2,
      departmentName: "General Practice",
      jobTitle: "Senior Staff",
      accessCode: "S2",
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.create({
      data: {
        userName: userData.userName,
        password: userData.password,
        email: userData.email,
        createTime: new Date(),
        updateTime: new Date(),
      },
    });

    // Assign role and RoleType to user
    await prisma.userRole.create({
      data: {
        User: { connect: { id: user.id } },
        Role: { connect: { id: userData.roleID } },
      },
    });

    // Assign department to user
    const department = await prisma.department.findFirst({
      where: { departmentName: userData.departmentName },
    });

    await prisma.userDepartment.create({
      data: {
        User: { connect: { id: user.id } },
        Department: { connect: { id: department.id } },
      },
    });

    // Assign position to user
    const position = await prisma.position.findFirst({
      where: { jobTitle: userData.jobTitle },
    });

    await prisma.userPositions.create({
      data: {
        User: { connect: { id: user.id } },
        Position: { connect: { id: position.id } },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
