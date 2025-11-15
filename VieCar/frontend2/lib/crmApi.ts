import { API_BASE_URL } from './config';

// ===== Types =====

export interface CustomerNoteReq {
  userId: number;
  dealerId: number;
  content: string;
  createdBy: string;
}

export interface CustomerNoteRes {
  id: number;
  userId: number;
  userName: string;
  dealerId: number;
  dealerName: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface CustomerTagReq {
  userId: number;
  dealerId: number;
  tag: string;
  color: string;
}

export interface CustomerTagRes {
  id: number;
  userId: number;
  userName: string;
  dealerId: number;
  dealerName: string;
  tag: string;
  color: string;
  createdAt: string;
}

export interface CustomerStats {
  totalTestDrives: number;
  completedTestDrives: number;
  canceledTestDrives: number;
  pendingTestDrives: number;
  averageRating: number;
  totalConversions: number;
  leadScore: number;
}

export interface CustomerProfileRes {
  user: {
    userId: number;
    username: string;
    email: string;
    phone: string;
    address: string;
  };
  testDrives: any[];
  notes: CustomerNoteRes[];
  tags: CustomerTagRes[];
  stats: CustomerStats;
}

// ===== API Functions =====

export async function getCustomerProfile(userId: number): Promise<CustomerProfileRes> {
  const response = await fetch(`${API_BASE_URL}/api/crm/customers/${userId}/profile`);
  if (!response.ok) {
    throw new Error('Failed to fetch customer profile');
  }
  return response.json();
}

export async function createNote(data: CustomerNoteReq): Promise<CustomerNoteRes> {
  const response = await fetch(`${API_BASE_URL}/api/crm/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create note');
  }
  return response.json();
}

export async function getNotesByUserId(userId: number): Promise<CustomerNoteRes[]> {
  const response = await fetch(`${API_BASE_URL}/api/crm/notes/user/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }
  return response.json();
}

export async function deleteNote(noteId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/crm/notes/${noteId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete note');
  }
}

export async function createTag(data: CustomerTagReq): Promise<CustomerTagRes> {
  const response = await fetch(`${API_BASE_URL}/api/crm/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create tag');
  }
  return response.json();
}

export async function getTagsByUserId(userId: number): Promise<CustomerTagRes[]> {
  const response = await fetch(`${API_BASE_URL}/api/crm/tags/user/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }
  return response.json();
}

export async function deleteTag(tagId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/crm/tags/${tagId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete tag');
  }
}
