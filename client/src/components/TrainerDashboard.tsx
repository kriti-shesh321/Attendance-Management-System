import { useState } from "react";
import API from "../api/axios";

type Props = {
    data: any[];
};

type Batch = {
    id: string;
    name: string;
    token?: string;
};

function TrainerDashboard({ data, }: Props) {

    const [batchName, setBatchName] = useState("");

    const [batches, setBatches] = useState<Batch[]>([]);

    const [loading, setLoading] = useState(false);

    const handleCreateBatch = async () => {

        if (!batchName) {
            return alert("Batch name required");
        }

        try {
            setLoading(true);

            const response = await API.post(
                "/batches",
                {
                    name: batchName,
                }
            );

            const newBatch = {
                id: response.data.id,
                name: response.data.name,
            };

            setBatches([...batches, newBatch,]);

            setBatchName("");

            alert("Batch created successfully");
        }

        catch (error) {
            console.error(error);

            alert("Failed to create batch");
        }

        finally {
            setLoading(false);
        }
    };

    const handleGenerateInvite =
        async (
            batchId: string
        ) => {

            try {

                const response =
                    await API.post(`/batches/${batchId}/invite`);

                const updatedBatches =
                    batches.map(
                        (batch) => {

                            if (
                                batch.id === batchId
                            ) {
                                return {
                                    ...batch,
                                    token:
                                        response.data.token,
                                };
                            }

                            return batch;
                        }
                    );

                setBatches(updatedBatches);

                alert("Invite token generated");
            }

            catch (error) {
                console.error(error);

                alert("Failed to generate token");
            }
        };

    return (
        <div className="space-y-6">

            <div className="bg-white rounded-xl shadow p-6 space-y-4">

                <h2 className="text-xl font-bold">
                    Create Batch
                </h2>

                <input
                    placeholder="Batch Name"
                    value={batchName}
                    onChange={(e) =>
                        setBatchName(
                            e.target.value
                        )
                    }
                    className="w-full border p-3 rounded-lg"
                />

                <button
                    onClick={
                        handleCreateBatch
                    }
                    disabled={loading}
                    className="bg-black text-white px-4 py-2 rounded-lg"
                >
                    {loading
                        ? "Creating..."
                        : "Create Batch"}
                </button>

            </div>

            {batches.length > 0 && (

                <div className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-xl font-bold mb-4">
                        Your Batches
                    </h2>

                    <div className="space-y-4">

                        {batches.map(
                            (batch) => (

                                <div
                                    key={batch.id}
                                    className="border rounded-lg p-4 space-y-3"
                                >

                                    <div className="flex justify-between items-center">

                                        <div>
                                            <p className="font-semibold">
                                                {batch.name}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {batch.id}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() =>
                                                handleGenerateInvite(
                                                    batch.id
                                                )
                                            }
                                            className="bg-black text-white px-4 py-2 rounded-lg"
                                        >
                                            Generate Invite
                                        </button>

                                    </div>

                                    {batch.token && (

                                        <div className="bg-gray-100 p-3 rounded-lg">

                                            <p className="text-sm text-gray-500 mb-2">
                                                Invite Token
                                            </p>

                                            <p className="font-mono break-all">
                                                {batch.token}
                                            </p>

                                        </div>
                                    )}

                                </div>
                            )
                        )}

                    </div>

                </div>
            )}

            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-xl font-bold mb-4">
                    Trainer Sessions
                </h2>

                <pre className="overflow-auto text-sm">
                    {JSON.stringify(data, null, 2)}
                </pre>

            </div>

        </div>
    );
}

export default TrainerDashboard;