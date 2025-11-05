import { useState, useEffect } from 'react'
import DashboardKpi from '@/pages/kpiStats/components/DashboardKpi';
import { baseURL } from '@/constant/baseURL';
import Loader from '@/component/Loader';

const KpiStats = () => {
    const [data, setData] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        fetch(`${baseURL}api/stats/organization/kpi`)
            .then((response) => response.json())
            .then((data) => setData(data))
            .catch((error) => console.error("Error fetching data:", error));

        setLoading(false)
    }, []);

    const refreshData = async () => {
        setLoading(true)

        fetch(`${baseURL}api/stats/organization/kpi`)
            .then((response) => response.json())
            .then((data) => setData(data))
            .catch((error) => console.error("Error fetching data:", error));

        setLoading(false)
    }
    // console.log(loading)
    // console.log(data)
    if (!data?.organization) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader />
        </div>
    );

    return (
        <div className="min-h-screen ">
            <DashboardKpi data={data} onRefresh={refreshData} loading={loading} />
        </div>
    )
}

export default KpiStats
