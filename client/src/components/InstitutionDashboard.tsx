type Props = {
    data: any[];
};

function InstitutionDashboard({ data }: Props) {
    return (
        <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-bold mb-4">
                Institution Batches
            </h2>

            <pre className="overflow-auto text-sm">
                {JSON.stringify(data, null, 2)}
            </pre>

        </div>
    );
}

export default InstitutionDashboard;