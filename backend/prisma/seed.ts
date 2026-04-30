import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding FlowBoard database...\n");

  // ─── Clean existing data ──────────────────────────────
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // ─── Create Users ─────────────────────────────────────
  const passwordHash = await bcrypt.hash("Admin123!", 12);
  const memberHash = await bcrypt.hash("Member123!", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Alex Morgan",
      email: "admin@example.com",
      password: passwordHash,
      role: "ADMIN",
      avatarColor: "#6366f1",
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: "Jordan Lee",
      email: "member@example.com",
      password: memberHash,
      role: "MEMBER",
      avatarColor: "#8b5cf6",
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: "Sam Rivera",
      email: "sam@example.com",
      password: memberHash,
      role: "MEMBER",
      avatarColor: "#ec4899",
    },
  });

  const member3 = await prisma.user.create({
    data: {
      name: "Casey Kim",
      email: "casey@example.com",
      password: memberHash,
      role: "MEMBER",
      avatarColor: "#22c55e",
    },
  });

  console.log("✅ Users created");

  // ─── Create Projects ──────────────────────────────────
  const project1 = await prisma.project.create({
    data: {
      name: "FlowBoard v2.0",
      description: "Next-gen project management platform with real-time collaboration and AI features",
      color: "#6366f1",
      icon: "rocket",
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: member1.id, role: "MEMBER" },
          { userId: member2.id, role: "MEMBER" },
          { userId: member3.id, role: "MEMBER" },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Marketing Website",
      description: "Complete redesign of the company marketing website with new brand identity",
      color: "#f43f5e",
      icon: "globe",
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: member1.id, role: "MEMBER" },
          { userId: member2.id, role: "MEMBER" },
        ],
      },
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: "Mobile App",
      description: "iOS and Android mobile companion app for FlowBoard",
      color: "#22c55e",
      icon: "smartphone",
      ownerId: member1.id,
      members: {
        create: [
          { userId: member1.id, role: "ADMIN" },
          { userId: admin.id, role: "MEMBER" },
          { userId: member3.id, role: "MEMBER" },
        ],
      },
    },
  });

  console.log("✅ Projects created");

  // ─── Helper ───────────────────────────────────────────
  const daysFromNow = (d: number) => {
    const date = new Date();
    date.setDate(date.getDate() + d);
    return date;
  };

  // ─── Create Tasks for Project 1 ───────────────────────
  const tasks1 = [
    { title: "Design system overhaul", description: "Rebuild the entire design token system with CSS custom properties", status: "DONE" as const, priority: "HIGH" as const, dueDate: daysFromNow(-2), assigneeId: member2.id, position: 0 },
    { title: "Implement drag-and-drop Kanban", description: "Add dnd-kit for smooth drag-and-drop on the Kanban board", status: "IN_PROGRESS" as const, priority: "HIGH" as const, dueDate: daysFromNow(3), assigneeId: member1.id, position: 0 },
    { title: "Build notification center", description: "Real-time bell icon with dropdown showing unread notifications", status: "IN_PROGRESS" as const, priority: "MEDIUM" as const, dueDate: daysFromNow(5), assigneeId: admin.id, position: 1 },
    { title: "Add activity feed", description: "Timeline showing who did what and when across all projects", status: "TODO" as const, priority: "MEDIUM" as const, dueDate: daysFromNow(7), assigneeId: member1.id, position: 0 },
    { title: "Global search (⌘K)", description: "Command palette for searching projects, tasks, and members", status: "TODO" as const, priority: "LOW" as const, dueDate: daysFromNow(14), assigneeId: member3.id, position: 1 },
    { title: "Dashboard analytics charts", description: "Add donut, area, and workload charts to dashboard", status: "DONE" as const, priority: "HIGH" as const, dueDate: daysFromNow(-5), assigneeId: admin.id, position: 1 },
    { title: "User profile settings", description: "Allow users to change name, avatar color, and password", status: "TODO" as const, priority: "LOW" as const, dueDate: daysFromNow(10), assigneeId: member2.id, position: 2 },
    { title: "API rate limiting", description: "Add express-rate-limit to prevent abuse on auth routes", status: "DONE" as const, priority: "URGENT" as const, dueDate: daysFromNow(-7), assigneeId: admin.id, position: 2 },
    { title: "Fix overdue detection bug", description: "Tasks marked as DONE should not show as overdue", status: "IN_PROGRESS" as const, priority: "URGENT" as const, dueDate: daysFromNow(-1), assigneeId: member3.id, position: 2 },
    { title: "Write API documentation", description: "Document all REST endpoints with request/response examples", status: "TODO" as const, priority: "MEDIUM" as const, dueDate: daysFromNow(12), assigneeId: member1.id, position: 3 },
  ];

  for (const t of tasks1) {
    await prisma.task.create({
      data: { ...t, projectId: project1.id, createdById: admin.id },
    });
  }

  // ─── Create Tasks for Project 2 ───────────────────────
  const tasks2 = [
    { title: "Brand identity research", description: "Analyze competitor branding and create mood board", status: "DONE" as const, priority: "HIGH" as const, dueDate: daysFromNow(-10), assigneeId: member2.id, position: 0 },
    { title: "Wireframe hero section", description: "Create low-fidelity wireframes for the landing page hero", status: "DONE" as const, priority: "HIGH" as const, dueDate: daysFromNow(-8), assigneeId: member2.id, position: 1 },
    { title: "Implement responsive navbar", description: "Build mobile-first navigation with hamburger menu", status: "IN_PROGRESS" as const, priority: "MEDIUM" as const, dueDate: daysFromNow(2), assigneeId: member1.id, position: 0 },
    { title: "SEO optimization", description: "Add meta tags, sitemap, and structured data", status: "TODO" as const, priority: "HIGH" as const, dueDate: daysFromNow(-1), assigneeId: admin.id, position: 0 },
    { title: "Contact form with validation", description: "Build contact form with Zod validation and email integration", status: "TODO" as const, priority: "MEDIUM" as const, dueDate: daysFromNow(8), assigneeId: member1.id, position: 1 },
  ];

  for (const t of tasks2) {
    await prisma.task.create({
      data: { ...t, projectId: project2.id, createdById: admin.id },
    });
  }

  // ─── Create Tasks for Project 3 ───────────────────────
  const tasks3 = [
    { title: "Setup React Native project", description: "Initialize Expo project with TypeScript template", status: "DONE" as const, priority: "HIGH" as const, dueDate: daysFromNow(-15), assigneeId: member1.id, position: 0 },
    { title: "Auth screens", description: "Build login and signup screens with form validation", status: "IN_PROGRESS" as const, priority: "HIGH" as const, dueDate: daysFromNow(1), assigneeId: member3.id, position: 0 },
    { title: "Push notifications setup", description: "Configure Firebase Cloud Messaging for push notifications", status: "TODO" as const, priority: "MEDIUM" as const, dueDate: daysFromNow(6), assigneeId: member1.id, position: 0 },
    { title: "Offline task sync", description: "Implement offline-first architecture with background sync", status: "TODO" as const, priority: "LOW" as const, dueDate: daysFromNow(20), assigneeId: member3.id, position: 1 },
  ];

  for (const t of tasks3) {
    await prisma.task.create({
      data: { ...t, projectId: project3.id, createdById: member1.id },
    });
  }

  console.log("✅ Tasks created");

  // ─── Create some activities ───────────────────────────
  const activities = [
    { action: "CREATED" as const, entityType: "project", entityId: project1.id, entityTitle: project1.name, projectId: project1.id, userId: admin.id },
    { action: "MEMBER_ADDED" as const, entityType: "member", entityId: member1.id, entityTitle: member1.name, projectId: project1.id, userId: admin.id },
    { action: "CREATED" as const, entityType: "task", entityId: "seed", entityTitle: "Design system overhaul", projectId: project1.id, userId: admin.id },
    { action: "STATUS_CHANGED" as const, entityType: "task", entityId: "seed", entityTitle: "Design system overhaul", details: "TODO → DONE", projectId: project1.id, userId: member2.id },
    { action: "CREATED" as const, entityType: "task", entityId: "seed", entityTitle: "Implement drag-and-drop Kanban", projectId: project1.id, userId: admin.id },
    { action: "ASSIGNED" as const, entityType: "task", entityId: "seed", entityTitle: "Global search (⌘K)", details: "Assigned to Casey Kim", projectId: project1.id, userId: admin.id },
    { action: "COMMENTED" as const, entityType: "task", entityId: "seed", entityTitle: "Fix overdue detection bug", details: "Found the issue — we need to compare dates in UTC", projectId: project1.id, userId: member3.id },
  ];

  for (const a of activities) {
    await prisma.activity.create({ data: a });
  }

  console.log("✅ Activities created");

  // ─── Create some notifications ────────────────────────
  const notifications = [
    { type: "task_assigned", title: "Task assigned", message: "You were assigned 'Implement drag-and-drop Kanban'", entityId: project1.id, userId: member1.id },
    { type: "member_added", title: "Added to project", message: "You were added to 'FlowBoard v2.0'", entityId: project1.id, userId: member2.id },
    { type: "comment", title: "New comment", message: "Casey commented on 'Fix overdue detection bug'", entityId: project1.id, userId: admin.id },
    { type: "task_assigned", title: "Task assigned", message: "You were assigned 'Global search (⌘K)'", entityId: project1.id, userId: member3.id },
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }

  console.log("✅ Notifications created");

  console.log("\n🎉 Seed complete!\n");
  console.log("Test credentials:");
  console.log("  Admin: admin@example.com / Admin123!");
  console.log("  Member: member@example.com / Member123!");
  console.log("  Sam: sam@example.com / Member123!");
  console.log("  Casey: casey@example.com / Member123!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
