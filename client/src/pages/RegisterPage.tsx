import { useEffect, useState, } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function RegisterPage() {

    const navigate = useNavigate();

    const [institutions, setInstitutions] = useState<any[]>([]);

    const [formData, setFormData] =
        useState({
            name: "",
            email: "",
            password: "",
            role: "student",
            institution_id: "",
        });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const fetchInstitutions = async () => {
        try {
            const response = await API.get("/institutions");

            setInstitutions(response.data);
        }

        catch (error) {
            console.error(error);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLSelectElement
        >
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (
        e: React.SyntheticEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        try {
            setLoading(true);

            const payload: any = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            };

            if (
                formData.role === "student" ||
                formData.role === "trainer" ||
                formData.role === "institution"
            ) {
                payload.institution_id =
                    formData.institution_id;
            }

            await API.post(
                "/auth/register",
                payload
            );

            alert(
                "Registration successful"
            );

            navigate("/");
        }

        catch (error) {
            console.error(error);

            alert(
                "Registration failed"
            );
        }

        finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4"
            >

                <h1 className="text-2xl font-bold text-center">
                    Register
                </h1>

                <input
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                />

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                />

                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                >

                    <option value="student">
                        Student
                    </option>

                    <option value="trainer">
                        Trainer
                    </option>

                    <option value="institution">
                        Institution
                    </option>

                    <option value="programme_manager">
                        Programme Manager
                    </option>

                    <option value="monitoring_officer">
                        Monitoring Officer
                    </option>

                </select>

                {(formData.role === "student" ||
                    formData.role === "trainer" ||
                    formData.role === "institution") && (

                        <select
                            name="institution_id"
                            value={formData.institution_id}
                            onChange={handleChange}
                            className="w-full border p-3 rounded-lg"
                        >

                            <option value="">
                                Select Institution
                            </option>

                            {institutions.map(
                                (institution) => (

                                    <option
                                        key={institution.id}
                                        value={institution.id}
                                    >
                                        {institution.name}
                                    </option>
                                )
                            )}

                        </select>
                    )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white p-3 rounded-lg"
                >
                    {loading
                        ? "Loading..."
                        : "Register"}
                </button>

            </form>

        </div>
    );
}

export default RegisterPage;