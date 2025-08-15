// utils/apiClient.js
export async function apiClient(url, { method = "GET", data, headers = {} } = {}) {
    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };
  
      if (data) {
        options.body = JSON.stringify(data);
      }
  
      const res = await fetch(url, options);
      let json;
      try {
        json = await res.json();
      } catch {
        // If not JSON, treat as server failure
        return { success: false, message: "Invalid response from server", data: null };
      }
      return json;
    } catch (error) {
      return { success: false, message: "Unable to connect to server", data: null };
    }
  }
  