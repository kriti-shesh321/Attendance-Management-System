import "dotenv/config";

import bcrypt from "bcryptjs";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import {
    PrismaClient,
    Region,
    Role,
    AttendanceStatus,
} from "@prisma/client";

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({
    connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log("Starting seed...");

    const hashedPassword = await bcrypt.hash(
        "qwertyuiop",
        10
    );

    // =========================
    // Institutions
    // =========================

    const institutionData = [
        {
            name: "North Skill Academy",
            region: Region.north,
        },
        {
            name: "South Future Institute",
            region: Region.south,
        },
        {
            name: "East Tech Center",
            region: Region.east,
        },
    ];

    for (const institution of institutionData) {
        await prisma.institution.create({
            data: institution,
        });
    }

    console.log("Institutions seeded");

    const institutions =
        await prisma.institution.findMany();

    // =========================
    // Users
    // =========================

    const users = [
        // Institution Admins
        {
            name: "Institution Admin 1",
            email: "institution1@test.com",
            password_hash: hashedPassword,
            role: Role.institution,
            institution_id: institutions[0].id,
        },
        {
            name: "Institution Admin 2",
            email: "institution2@test.com",
            password_hash: hashedPassword,
            role: Role.institution,
            institution_id: institutions[1].id,
        },
        {
            name: "Institution Admin 3",
            email: "institution3@test.com",
            password_hash: hashedPassword,
            role: Role.institution,
            institution_id: institutions[2].id,
        },

        // Trainers
        {
            name: "Trainer 1",
            email: "trainer1@test.com",
            password_hash: hashedPassword,
            role: Role.trainer,
            institution_id: institutions[0].id,
        },
        {
            name: "Trainer 2",
            email: "trainer2@test.com",
            password_hash: hashedPassword,
            role: Role.trainer,
            institution_id: institutions[1].id,
        },
        {
            name: "Trainer 3",
            email: "trainer3@test.com",
            password_hash: hashedPassword,
            role: Role.trainer,
            institution_id: institutions[2].id,
        },
        {
            name: "Trainer 4",
            email: "trainer4@test.com",
            password_hash: hashedPassword,
            role: Role.trainer,
            institution_id: institutions[0].id,
        },
        {
            name: "Trainer 5",
            email: "trainer5@test.com",
            password_hash: hashedPassword,
            role: Role.trainer,
            institution_id: institutions[1].id,
        },

        // Programme Manager
        {
            name: "Programme Manager",
            email: "manager@test.com",
            password_hash: hashedPassword,
            role: Role.programme_manager,
        },

        // Monitoring Officer
        {
            name: "Monitoring Officer",
            email: "monitor@test.com",
            password_hash: hashedPassword,
            role: Role.monitoring_officer,
        },
    ];

    // Students
    for (let i = 1; i <= 15; i++) {
        users.push({
            name: `Student ${i}`,
            email: `student${i}@test.com`,
            password_hash: hashedPassword,
            role: Role.student,
            institution_id:
                institutions[(i - 1) % 3].id,
        } as any);
    }

    for (const user of users) {
        await prisma.user.upsert({
            where: {
                email: user.email,
            },
            update: {},
            create: user,
        });
    }

    console.log("Users seeded");

    // =========================
    // Fetch Users
    // =========================

    const trainers = await prisma.user.findMany({
        where: {
            role: Role.trainer,
        },
    });

    const students = await prisma.user.findMany({
        where: {
            role: Role.student,
        },
    });

    // =========================
    // Batches
    // =========================

    const batchData = [
        {
            name: "Batch 1",
            institution_id: institutions[0].id,
            created_by: trainers[0].id,
        },
        {
            name: "Batch 2",
            institution_id: institutions[1].id,
            created_by: trainers[1].id,
        },
        {
            name: "Batch 3",
            institution_id: institutions[2].id,
            created_by: trainers[2].id,
        },
        {
            name: "Batch 4",
            institution_id: institutions[0].id,
            created_by: trainers[3].id,
        },
        {
            name: "Batch 5",
            institution_id: institutions[1].id,
            created_by: trainers[4].id,
        },
    ];

    for (const batch of batchData) {
        await prisma.batch.upsert({
            where: {
                name: batch.name,
            },
            update: {},
            create: batch,
        });
    }

    console.log("Batches seeded");

    const batches = await prisma.batch.findMany();

    // =========================
    // Batch Students
    // =========================

    for (let i = 0; i < students.length; i++) {
        await prisma.batchStudent.upsert({
            where: {
                batch_id_student_id: {
                    batch_id: batches[i % 5].id,
                    student_id: students[i].id,
                },
            },
            update: {},
            create: {
                batch_id: batches[i % 5].id,
                student_id: students[i].id,
            },
        });
    }

    console.log("Batch students seeded");

    // =========================
    // Sessions
    // =========================

    const sessionData = [
        {
            batch_id: batches[0].id,
            trainer_id: trainers[0].id,
            title: "React Basics",
        },
        {
            batch_id: batches[1].id,
            trainer_id: trainers[1].id,
            title: "Node Fundamentals",
        },
        {
            batch_id: batches[2].id,
            trainer_id: trainers[2].id,
            title: "Database Design",
        },
        {
            batch_id: batches[3].id,
            trainer_id: trainers[3].id,
            title: "API Development",
        },
        {
            batch_id: batches[4].id,
            trainer_id: trainers[4].id,
            title: "Authentication Systems",
        },
    ];

    for (const session of sessionData) {
        await prisma.session.create({
            data: {
                ...session,
                date: new Date(),
                start_time: new Date(),
                end_time: new Date(
                    Date.now() + 60 * 60 * 1000
                ),
            },
        });
    }

    console.log("Sessions seeded");

    // =========================
    // Attendance
    // =========================

    const sessions = await prisma.session.findMany();

    for (let i = 0; i < 10; i++) {
        await prisma.attendance.create({
            data: {
                session_id:
                    sessions[i % sessions.length].id,
                student_id: students[i].id,
                status:
                    i % 3 === 0
                        ? AttendanceStatus.absent
                        : i % 2 === 0
                            ? AttendanceStatus.late
                            : AttendanceStatus.present,
            },
        });
    }

    console.log("Attendance seeded");

    console.log("✅ Seeding completed");
}

main()
    .then(async () => {
        await prisma.$disconnect();
        await pool.end();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });