// features/logs/logService.js
const API_URL = "http://localhost:5000/api/logs";

const getLogs = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await fetch(API_URL, config);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || response.statusText);
  }
  return response.json();
};

const logService = { getLogs };
export default logService;
