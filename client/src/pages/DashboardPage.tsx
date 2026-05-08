import { useEffect, useState } from "react";

import API from "../api/axios";

import StudentDashboard from "../components/StudentDashboard";
import TrainerDashboard from "../components/TrainerDashboard";
import InstitutionDashboard from "../components/InstitutionDashboard";
import AdminDashboard from "../components/AdminDashboard";

function DashboardPage() {
    const [data, setData] = useState<any>(null);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            if (user.role === "trainer" || user.role === "student") {
                const response = await API.get("/sessions");
                setData(response.data);
            }

            else if (user.role === "institution") {
                const response = await API.get("/batches");
                setData(response.data);
            }

            else if (user.role === "programme_manager") {
                const response = await API.get("/summary/institutions");
                setData(response.data);
            }

            else {
                const response = await API.get("/summary/programme");
                setData(response.data);
            }
        }

        catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-8 space-y-6">

            <div className="flex justify-between items-center">

                <div>
                    <h1 className="text-3xl font-bold">
                        Dashboard
                    </h1>

                    <p>{user.name}</p>

                    <p className="text-sm text-gray-500">
                        {user.role}
                    </p>
                </div>

                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = "/";
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                    Logout
                </button>

            </div>

            {user.role === "student" && (
                <StudentDashboard data={data} />
            )}

            {user.role === "trainer" && (
                <TrainerDashboard data={data} />
            )}

            {user.role === "institution" && (
                <InstitutionDashboard data={data} />
            )}

            {(user.role === "programme_manager" ||
                user.role === "monitoring_officer") && (
                    <AdminDashboard data={data} />
                )}

        </div>
    );
}

export default DashboardPage;