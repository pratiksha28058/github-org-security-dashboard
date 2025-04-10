import React, { useEffect, useState } from "react";
//import GithubService from '@/GithubService.jsx';

import { fetchRepositories, fetchSecurityAlerts } from '@/GithubService.jsx';
import {
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { format, parseISO } from "date-fns";


const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [chartData, setChartData] = useState([]); // Add this line
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [selectedRepository, setSelectedRepository] = useState('all');
  const [org] = useState('pratiksha28058'); // Your organization name
  const [selectedRepo, setSelectedRepo] = useState('');


  
  // Fetch repositories
  useEffect(() => {
    async function getRepositories() {
      try {
        const repoNames = await fetchRepositories(org);
        setRepositories(repoNames);
        setSelectedRepo(repoNames[0] || ''); // Default to the first repository
      } catch (error) {
        console.error(error);
      }
    }
    getRepositories();
  }, [org]);

  
  useEffect(() => {
    async function getAlerts() {
      if (!selectedRepo) return;
      try {
        const data = await fetchSecurityAlerts(org, selectedRepo);
        setAlerts(data);
        setFilteredAlerts(data);
      } catch (error) {
        console.error(error);
      }
    }
    getAlerts();
  }, [org, selectedRepo]);


// Fetch alerts
useEffect(() => {
  async function getAlerts() {
    try {
      const data = await fetchSecurityAlerts();
      setAlerts(data);
      setFilteredAlerts(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  }
  getAlerts();
}, []);
  
  

  useEffect(() => {
    async function getAlerts() {
      const data = await fetchSecurityAlerts();
      const aggregatedData = aggregateAlertsByDateAndSeverity(data);
      console.log("GitHub Security Alerts:", data);
      setAlerts(data);
      setFilteredAlerts(data);
      setChartData(aggregatedData);
    }
    getAlerts();
  }, []);


  const aggregateAlertsByDateAndSeverity = (alerts) => {
    const counts = alerts.reduce((acc, alert) => {
      const date = alert.created_at.split("T")[0]; // Extract YYYY-MM-DD
      const timestamp = new Date(alert.created_at).getTime();
      const severity = alert.rule?.severity || "unknown";
  
      if (!acc[date]) {
        acc[date] = { date, timestamp: parseISO(date).getTime(), error: 0, warning: 0, note: 0, unknown: 0 };
      }
      acc[date][severity] += 1;
  
      return acc;
    }, {});
  
    return Object.values(counts).sort((a, b) => a.timestamp - b.timestamp);
  };
  
  
  useEffect(() => {
    async function getAlerts() {
      const data = await fetchSecurityAlerts();
      const aggregatedData = aggregateAlertsByDateAndSeverity(data);
      console.log("GitHub Security Alerts:", data);
      setAlerts(data);
      setFilteredAlerts(data);
      setChartData(aggregatedData);
    }
    getAlerts();
  }, []);


  useEffect(() => {
    const aggregatedData = aggregateAlertsByDateAndSeverity(filteredAlerts);
    setChartData(aggregatedData);
  }, [filteredAlerts]);

  

  const aggregateAlertsByDate = (alerts) => {
    const counts = alerts.reduce((acc, alert) => {
      //const date = alert.created_at.split("T")[0]; // Extract YYYY-MM-DD
      const timestamp = new Date(alert.created_at).getTime();
      const severity = alert.rule?.severity || "unknown";
      acc[date] = (acc[date] || 0) + 1;

      if (!acc[date]) {
        acc[date] = { date, timestamp: parseISO(date).getTime(), error: 0, warning: 0, note: 0, unknown: 0 };
      }
      acc[date][severity] += 1;

      return acc;
    }, {});

    return Object.values(counts).sort((a, b) => a.timestamp - b.timestamp);
  };

  //   return Object.keys(counts).map((date) => ({
  //      date,
  //      count: counts[date],
  //      timestamp: parseISO(date).getTime(),
  //    }));
  //  };

  const data = [
  { timestamp: 1617187200000, value: 100 }, // Example data point
  // Add more data points
];
  
  const formatXAxis = (tickItem) => {
    return format(new Date(tickItem), "MMM dd, yyyy HH:mm:ss");
  };

  useEffect(() => {
    if (filter === "all") {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter(alert => alert.rule?.severity === filter));
    }
  }, [filter, alerts]);

  // Count alerts by severity
  const severityCounts = alerts.reduce((acc, alert) => {
    const severity = alert.rule?.severity || "unknown";
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  //Convert counts to chart data
   const chartData1 = Object.keys(severityCounts).map((severity) => ({
     name: severity,
     count: severityCounts[severity],
   }));

  // Filter alerts based on selected filters
  useEffect(() => {
    let filtered = alerts;

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.rule?.severity === selectedSeverity);
    }

    if (selectedState !== 'all') {
      filtered = filtered.filter(alert => alert.state === selectedState);
    }

    if (selectedRepository !== 'all') {
      filtered = filtered.filter(alert => alert.repository?.name === selectedRepository);
    }

    setFilteredAlerts(filtered);
  }, [selectedSeverity, selectedState, selectedRepository, alerts]);
  
  

  return (
    <div>




<h2>Apply Filters</h2>


{/* Repository Filter Dropdown */}
<label htmlFor="repo-filter">Select Repository:</label>
      <select
        id="repo-filter"
        value={selectedRepo}
        onChange={(e) => setSelectedRepo(e.target.value)}
      >
        {repositories.map((repo) => (
          <option key={repo} value={repo}>
            {repo}
          </option>
        ))}
      </select>

<label htmlFor="severity-filter">Filter by Severity:</label>
<select
  id="severity-filter"
  value={selectedSeverity}
  onChange={(e) => setSelectedSeverity(e.target.value)}
>
  <option value="all">All</option>
  <option value="error">Errors</option>
  <option value="warning">Warnings</option>
  <option value="note">Notes</option>
  <option value="unknown">Unknown</option>
</select>

<label htmlFor="state-filter">Filter by State:</label>
<select
  id="state-filter"
  value={selectedState}
  onChange={(e) => setSelectedState(e.target.value)}
>
  <option value="all">All</option>
  <option value="open">Open</option>
  <option value="dismissed">Dismissed</option>
  <option value="fixed">Fixed</option>
</select>







      <h4>GitHub Security Alerts Over Time Line</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <XAxis
            dataKey="timestamp"
            type="number"
            //domain={["auto", "auto"]}
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatXAxis}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(label) => format(new Date(label), "MMM dd, yyyy HH:mm:ss")}
          />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
          <Line type="monotone" dataKey="error" stroke="#ff0000" name="Errors" />
          <Line type="monotone" dataKey="warning" stroke="#ffa500" name="Warnings" />
          <Line type="monotone" dataKey="note" stroke="#0000ff" name="Notes" />
          <Line type="monotone" dataKey="unknown" stroke="#808080" name="Unknown" />
        </LineChart>
      </ResponsiveContainer>


      <h3>GitHub Security Alerts Table</h3>

{filteredAlerts.length === 0 ? (
  <p>No security issues found! ✅</p>
) : (
  <table border="1">
    <thead>
      <tr>
        <th>ID</th>
        <th>Description</th>
        <th>Severity</th>
        <th>State</th>
        <th>Created</th>
        <th>Dismissed</th>
        <th>url</th>
        <th>Link</th>
      </tr>
    </thead>
    <tbody>
      {filteredAlerts.map((alert) => (
        <tr key={alert.id}>
          <td>{alert.number}</td>
          <td>{alert.rule?.description || "No Description"}</td>
          <td>{alert.rule?.severity}</td>
          <td>{alert.state}</td>
          <td>{alert.created_at}</td>
          <td>{alert.dismissed_at}</td>
          <td>{alert.html_url}</td>

          <td>
            <a
              href={alert.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}

      
      

    </div>
  );
};

export default Dashboard;
