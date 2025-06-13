import React from "react";
// Import AnalyticsPage as it's the content for the default dashboard view
import AnalyticsPage from "../pages/AnalyticsPage";

function AdminDashboard() {
  return (
    <div className="admin-dashboard-content">
      {/* AdminDashboard now directly renders the AnalyticsPage */}
      <AnalyticsPage />
    </div>
  );
}

export default AdminDashboard;
