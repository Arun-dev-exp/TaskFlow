const API_BASE_URL = 'https://task-flow-vdrx.onrender.com/api/';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Task API functions
export const taskAPI = {
  // Get all tasks with optional filtering
  getAll: (params?: { filter?: string; category?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.filter) searchParams.append('filter', params.filter);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    
    return apiRequest<{ success: boolean; data: any[]; count: number }>(endpoint);
  },

  // Get a specific task
  getById: (id: string) => {
    return apiRequest<{ success: boolean; data: any }>(`/tasks/${id}`);
  },

  // Create a new task
  create: (taskData: any) => {
    return apiRequest<{ success: boolean; data: any; message: string }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Update a task
  update: (id: string, taskData: any) => {
    return apiRequest<{ success: boolean; data: any; message: string }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  // Toggle task completion
  toggle: (id: string) => {
    return apiRequest<{ success: boolean; data: any; message: string }>(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  // Delete a task
  delete: (id: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

// Category API functions
export const categoryAPI = {
  // Get all categories
  getAll: () => {
    return apiRequest<{ success: boolean; data: any[]; count: number }>('/categories');
  },

  // Get a specific category
  getById: (id: string) => {
    return apiRequest<{ success: boolean; data: any }>(`/categories/${id}`);
  },

  // Create a new category
  create: (categoryData: any) => {
    return apiRequest<{ success: boolean; data: any; message: string }>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  // Update a category
  update: (id: string, categoryData: any) => {
    return apiRequest<{ success: boolean; data: any; message: string }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  // Delete a category
  delete: (id: string) => {
    return apiRequest<{ success: boolean; message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Habit API functions
export const habitAPI = {
  // Get all habits
  getAll: () => {
    return apiRequest<{ success: boolean; data: any[]; count: number }>('/habits');
  },

  // Get a specific habit
  getById: (id: string) => {
    return apiRequest<{ success: boolean; data: any }>(`/habits/${id}`);
  },

  // Mark habit completion
  complete: (id: string, date: string) => {
    return apiRequest<{ success: boolean; data: any; message: string }>(`/habits/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  },

  // Get habit statistics
  getStats: (id: string) => {
    return apiRequest<{ success: boolean; data: any }>(`/habits/${id}/stats`);
  },

  // Get overview statistics
  getOverviewStats: () => {
    return apiRequest<{ success: boolean; data: any }>('/habits/stats/overview');
  },
};

export default {
  taskAPI,
  categoryAPI,
  habitAPI,
};
