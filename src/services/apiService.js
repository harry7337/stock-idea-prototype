// API service for handling search and filter requests

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Fetches search results from the API
 * @param {Object} filterData - The filter data to send in the request body
 * @param {number} pageNum - The page number to fetch
 * @param {Array} fields - The fields to include in the response
 * @param {number} limit - Number of results per page (default: 10)
 * @returns {Promise<Object>} The response data or error message
 */
export const fetchSearchResults = async (filterData, pageNum = 1, fields = [], limit = 10) => {
  try {
    const fieldsParam = fields.join(',');
    const offset = (pageNum - 1) * limit;
    
    const response = await fetch(
      `${API_BASE_URL}/search?fields=${fieldsParam}&limit=${limit}&offset=${offset}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filterData),
      }
    );
    
    const text = await response.text();
    let jsonData = null;
    
    try {
      jsonData = JSON.parse(text);
    } catch (parseError) {
      // If JSON parsing fails, return the text as is
      console.warn('Failed to parse response as JSON:', parseError);
    }
    
    return jsonData || text;
  } catch (error) {
    throw new Error(`API request failed: ${error.message}`);
  }
};

/**
 * Converts user text to filters using the text-to-filters endpoint
 * @param {string} userText - The user's text description
 * @returns {Promise<Object>} The extracted filters
 */
export const textToFilters = async (userText) => {
  try {
    const response = await fetch(`${API_BASE_URL}/text-to-filters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_text: userText }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.filters || {};
  } catch (error) {
    throw new Error(`Text-to-filters request failed: ${error.message}`);
  }
};
