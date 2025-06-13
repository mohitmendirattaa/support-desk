// src/pages/SystemSettings.jsx
import React, { useState } from "react";
import {
  Settings,
  Save,
  Ticket,
  Clock,
  Mail,
  Users,
  CalendarDays,
} from "lucide-react";
import { toast } from "react-toastify"; // Make sure you have react-toastify installed for notifications

function SystemSettings() {
  // Demo data for system settings
  // In a real application, this would be fetched from your backend API
  const [settings, setSettings] = useState({
    general: {
      appName: "My Ticketing System",
      defaultTimeZone: "Asia/Kolkata", // Reflects current context
      defaultLanguage: "en",
    },
    ticketManagement: {
      defaultStatusNew: "New",
      defaultStatusClosed: "Closed",
      autoCloseAfterDays: 7, // Auto-close tickets after 7 days if solved
      allowReopenClosed: true,
      defaultPriority: "Medium",
      customFieldsEnabled: true,
      ticketNumberPrefix: "TKT-",
    },
    sla: {
      enableSLA: true,
      defaultResponseTimeHrs: 4, // Default response time for new tickets
      defaultResolutionTimeHrs: 24, // Default resolution time
      businessHoursStart: "09:00",
      businessHoursEnd: "17:00",
      excludeWeekendsFromSLA: true,
    },
    email: {
      smtpHost: "smtp.yourcompany.com",
      smtpPort: 587,
      fromEmailAddress: "support@yourcompany.com",
      sendTicketReceivedEmail: true,
      sendTicketSolvedEmail: true,
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  // Generic handler for input changes
  const handleChange = (e, category, field) => {
    const value =
      e.target.type === "checkbox" || e.target.type === "radio"
        ? e.target.checked
        : e.target.value;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [field]: value,
      },
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    console.log("Attempting to save settings:", settings);

    try {
      // Simulate an API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center rounded-t-2xl flex items-center justify-center">
        <Settings size={48} className="mr-4 opacity-90" />
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          System Settings
        </h1>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-b-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* General Settings Section */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <Users size={28} className="mr-3 text-blue-500" />
              General Application Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="appName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Application Name
                </label>
                <input
                  type="text"
                  id="appName"
                  name="appName"
                  value={settings.general.appName}
                  onChange={(e) => handleChange(e, "general", "appName")}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="defaultTimeZone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Default Time Zone
                </label>
                <select
                  id="defaultTimeZone"
                  name="defaultTimeZone"
                  value={settings.general.defaultTimeZone}
                  onChange={(e) =>
                    handleChange(e, "general", "defaultTimeZone")
                  }
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">
                    America/New_York (EST)
                  </option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  {/* Add more common time zones */}
                </select>
              </div>

              <div>
                <label
                  htmlFor="defaultLanguage"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Default Language
                </label>
                <select
                  id="defaultLanguage"
                  name="defaultLanguage"
                  value={settings.general.defaultLanguage}
                  onChange={(e) =>
                    handleChange(e, "general", "defaultLanguage")
                  }
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="gu">Gujarati</option>
                  {/* Add more languages */}
                </select>
              </div>
            </div>
          </section>

          {/* Ticket Management Settings Section */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <Ticket size={28} className="mr-3 text-emerald-500" />
              Ticket Management
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-4 md:space-y-0">
              <div>
                <label
                  htmlFor="defaultStatusNew"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Default Status for New Tickets
                </label>
                <input
                  type="text"
                  id="defaultStatusNew"
                  name="defaultStatusNew"
                  value={settings.ticketManagement.defaultStatusNew}
                  onChange={(e) =>
                    handleChange(e, "ticketManagement", "defaultStatusNew")
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="defaultStatusClosed"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status for Closed Tickets
                </label>
                <input
                  type="text"
                  id="defaultStatusClosed"
                  name="defaultStatusClosed"
                  value={settings.ticketManagement.defaultStatusClosed}
                  onChange={(e) =>
                    handleChange(e, "ticketManagement", "defaultStatusClosed")
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="autoCloseAfterDays"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Auto-Close Resolved Tickets After (Days)
                </label>
                <input
                  type="number"
                  id="autoCloseAfterDays"
                  name="autoCloseAfterDays"
                  value={settings.ticketManagement.autoCloseAfterDays}
                  onChange={(e) =>
                    handleChange(e, "ticketManagement", "autoCloseAfterDays")
                  }
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Tickets marked "Resolved" will automatically close after this
                  many days if no further customer interaction.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  id="allowReopenClosed"
                  name="allowReopenClosed"
                  type="checkbox"
                  checked={settings.ticketManagement.allowReopenClosed}
                  onChange={(e) =>
                    handleChange(e, "ticketManagement", "allowReopenClosed")
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="allowReopenClosed"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Allow customers to re-open closed tickets
                </label>
              </div>

              <div>
                <label
                  htmlFor="defaultPriority"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Default Priority for New Tickets
                </label>
                <select
                  id="defaultPriority"
                  name="defaultPriority"
                  value={settings.ticketManagement.defaultPriority}
                  onChange={(e) =>
                    handleChange(e, "ticketManagement", "defaultPriority")
                  }
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="ticketNumberPrefix"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ticket Number Prefix
                </label>
                <input
                  type="text"
                  id="ticketNumberPrefix"
                  name="ticketNumberPrefix"
                  value={settings.ticketManagement.ticketNumberPrefix}
                  onChange={(e) =>
                    handleChange(e, "ticketManagement", "ticketNumberPrefix")
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., TKT-"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Prefix for auto-generated ticket IDs (e.g., TKT-12345).
                </p>
              </div>

              <div className="flex items-center col-span-full">
                <input
                  id="customFieldsEnabled"
                  name="customFieldsEnabled"
                  type="checkbox"
                  checked={settings.ticketManagement.customFieldsEnabled}
                  onChange={(e) =>
                    handleChange(e, "ticketManagement", "customFieldsEnabled")
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="customFieldsEnabled"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Enable Custom Fields for Tickets (manage elsewhere)
                </label>
              </div>
            </div>
          </section>

          {/* SLA & Business Hours Section */}
          <section className="border-b border-gray-200 pb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <Clock size={28} className="mr-3 text-purple-500" />
              SLA & Business Hours
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="enableSLA"
                  name="enableSLA"
                  type="checkbox"
                  checked={settings.sla.enableSLA}
                  onChange={(e) => handleChange(e, "sla", "enableSLA")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="enableSLA"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Enable Service Level Agreements (SLA)
                </label>
              </div>

              {settings.sla.enableSLA && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label
                      htmlFor="defaultResponseTimeHrs"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Default First Response Time (Hours)
                    </label>
                    <input
                      type="number"
                      id="defaultResponseTimeHrs"
                      name="defaultResponseTimeHrs"
                      value={settings.sla.defaultResponseTimeHrs}
                      onChange={(e) =>
                        handleChange(e, "sla", "defaultResponseTimeHrs")
                      }
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="defaultResolutionTimeHrs"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Default Resolution Time (Hours)
                    </label>
                    <input
                      type="number"
                      id="defaultResolutionTimeHrs"
                      name="defaultResolutionTimeHrs"
                      value={settings.sla.defaultResolutionTimeHrs}
                      onChange={(e) =>
                        handleChange(e, "sla", "defaultResolutionTimeHrs")
                      }
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="businessHoursStart"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Business Hours Start
                    </label>
                    <input
                      type="time"
                      id="businessHoursStart"
                      name="businessHoursStart"
                      value={settings.sla.businessHoursStart}
                      onChange={(e) =>
                        handleChange(e, "sla", "businessHoursStart")
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="businessHoursEnd"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Business Hours End
                    </label>
                    <input
                      type="time"
                      id="businessHoursEnd"
                      name="businessHoursEnd"
                      value={settings.sla.businessHoursEnd}
                      onChange={(e) =>
                        handleChange(e, "sla", "businessHoursEnd")
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex items-center col-span-full">
                    <input
                      id="excludeWeekendsFromSLA"
                      name="excludeWeekendsFromSLA"
                      type="checkbox"
                      checked={settings.sla.excludeWeekendsFromSLA}
                      onChange={(e) =>
                        handleChange(e, "sla", "excludeWeekendsFromSLA")
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="excludeWeekendsFromSLA"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Exclude weekends from SLA calculations
                    </label>
                  </div>
                  {/* You'd typically have a separate page or modal for managing a Holiday Calendar */}
                  <div className="col-span-full">
                    <p className="mt-2 text-sm text-gray-500 flex items-center">
                      <CalendarDays size={16} className="mr-2 text-gray-400" />
                      Holiday Calendar management is typically handled in a
                      dedicated section.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Email & Notifications Section */}
          <section className="pb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <Mail size={28} className="mr-3 text-yellow-600" />
              Email & Notifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="smtpHost"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  SMTP Host
                </label>
                <input
                  type="text"
                  id="smtpHost"
                  name="smtpHost"
                  value={settings.email.smtpHost}
                  onChange={(e) => handleChange(e, "email", "smtpHost")}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  The hostname of your outgoing mail server.
                </p>
              </div>
              <div>
                <label
                  htmlFor="smtpPort"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  SMTP Port
                </label>
                <input
                  type="number"
                  id="smtpPort"
                  name="smtpPort"
                  value={settings.email.smtpPort}
                  onChange={(e) => handleChange(e, "email", "smtpPort")}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="fromEmailAddress"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  "From" Email Address
                </label>
                <input
                  type="email"
                  id="fromEmailAddress"
                  name="fromEmailAddress"
                  value={settings.email.fromEmailAddress}
                  onChange={(e) => handleChange(e, "email", "fromEmailAddress")}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  This address will appear as the sender for system emails.
                </p>
              </div>

              <div className="col-span-full space-y-2 mt-4">
                <p className="block text-sm font-medium text-gray-700">
                  Automated Customer Emails:
                </p>
                <div className="flex items-center">
                  <input
                    id="sendTicketReceivedEmail"
                    name="sendTicketReceivedEmail"
                    type="checkbox"
                    checked={settings.email.sendTicketReceivedEmail}
                    onChange={(e) =>
                      handleChange(e, "email", "sendTicketReceivedEmail")
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="sendTicketReceivedEmail"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Send "Ticket Received" confirmation email to customers
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="sendTicketSolvedEmail"
                    name="sendTicketSolvedEmail"
                    type="checkbox"
                    checked={settings.email.sendTicketSolvedEmail}
                    onChange={(e) =>
                      handleChange(e, "email", "sendTicketSolvedEmail")
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="sendTicketSolvedEmail"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Send "Ticket Solved" notification email to customers
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out ${
                isSaving ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="-ml-1 mr-3 h-5 w-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SystemSettings;
