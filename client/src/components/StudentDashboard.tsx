import { useState } from "react";
import API from "../api/axios";

type Props = {
    data: any[];
};

function StudentDashboard({
    data,
}: Props) {

    const [inviteToken, setInviteToken] = useState("");

    const uniqueBatches = data
        ? [
            ...new Map(
                data.map((session: any) => [
                    session.batch.id,
                    session.batch,
                ])
            ).values(),
        ]
        : [];

    const handleJoinBatch = async () => {
        try {
            await API.post(
                "/batches/join",
                {
                    token: inviteToken,
                }
            );

            alert("Joined batch successfully");

            window.location.reload();
        }

        catch (error) {
            console.error(error);

            alert("Failed to join batch");
        }
    };

    return (
        <div className="space-y-6">

            <div className="bg-white rounded-xl shadow p-6 space-y-4">

                <h2 className="text-xl font-bold">
                    Join Batch
                </h2>

                <input
                    placeholder="Invite Token"
                    value={inviteToken}
                    onChange={(e) =>
                        setInviteToken(e.target.value)
                    }
                    className="w-full border p-3 rounded-lg"
                />

                <button
                    onClick={handleJoinBatch}
                    className="bg-black text-white px-4 py-2 rounded-lg"
                >
                    Join Batch
                </button>

            </div>

            {uniqueBatches.length > 0 && (

                <div className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-xl font-bold mb-4">
                        Joined Batches
                    </h2>

                    <div className="space-y-3">

                        {uniqueBatches.map(
                            (batch: any) => (

                                <div
                                    key={batch.id}
                                    className="border rounded-lg p-4"
                                >
                                    <p className="font-semibold">
                                        {batch.name}
                                    </p>
                                </div>
                            )
                        )}

                    </div>

                </div>
            )}

            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-xl font-bold mb-4">
                    Sessions
                </h2>

                <pre className="overflow-auto text-sm">
                    {JSON.stringify(data, null, 2)}
                </pre>

            </div>

        </div>
    );
}

export default StudentDashboard;