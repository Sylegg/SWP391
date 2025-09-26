import api from './api';

// Delete user by id
export async function deleteUser(id: number): Promise<void> {
	await api.delete(`/api/user/${id}`);
}

// Additional user helpers can be added here as needed
