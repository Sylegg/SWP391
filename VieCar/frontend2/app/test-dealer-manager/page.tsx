'use client';

import { useEffect, useState } from 'react';
import { getAvailableDealerManagers, UserRes, getUserProfile } from '@/lib/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestDealerManagerPage() {
  const [managers, setManagers] = useState<UserRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [testUserId, setTestUserId] = useState<number>(1);
  const [userProfile, setUserProfile] = useState<UserRes | null>(null);

  const loadManagers = async () => {
    try {
      setLoading(true);
      const data = await getAvailableDealerManagers();
      setManagers(data);
      console.log('✅ Available Dealer Managers:', data);
    } catch (error) {
      console.error('❌ Error loading managers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile(testUserId);
      setUserProfile(data);
      console.log('✅ User Profile:', data);
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, []);

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">🧪 Test API Dealer Manager</h1>

      {/* Test API 1: Get Available Dealer Managers */}
      <Card>
        <CardHeader>
          <CardTitle>API 1: Get Available Dealer Managers</CardTitle>
          <CardDescription>
            GET /api/user/available-dealer-managers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={loadManagers} disabled={loading}>
            {loading ? 'Loading...' : 'Load Available Managers'}
          </Button>

          {managers.length > 0 ? (
            <div className="space-y-2">
              <p className="font-semibold">Kết quả ({managers.length} managers):</p>
              <div className="bg-gray-100 p-4 rounded-lg space-y-2 max-h-96 overflow-y-auto">
                {managers.map((manager) => (
                  <div key={manager.id} className="bg-white p-3 rounded border">
                    <p><strong>ID:</strong> {manager.id}</p>
                    <p><strong>Name:</strong> {manager.name}</p>
                    <p><strong>Email:</strong> {manager.email}</p>
                    <p><strong>Phone:</strong> {manager.phone}</p>
                    <p><strong>Role:</strong> {manager.role}</p>
                    <p><strong>Status:</strong> {manager.status}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              {loading ? 'Loading...' : 'No managers found. Click button to load.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Test API 2: Get User Profile with Dealer Info */}
      <Card>
        <CardHeader>
          <CardTitle>API 2: Get User Profile (with Dealer Info)</CardTitle>
          <CardDescription>
            GET /api/user/Profile/{'{userId}'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={testUserId}
              onChange={(e) => setTestUserId(Number(e.target.value))}
              className="border rounded px-3 py-2 w-32"
              placeholder="User ID"
            />
            <Button onClick={loadUserProfile} disabled={loading}>
              {loading ? 'Loading...' : 'Load User Profile'}
            </Button>
          </div>

          {userProfile ? (
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="bg-white p-4 rounded border space-y-2">
                <p><strong>ID:</strong> {userProfile.id}</p>
                <p><strong>Name:</strong> {userProfile.name}</p>
                <p><strong>Email:</strong> {userProfile.email}</p>
                <p><strong>Phone:</strong> {userProfile.phone}</p>
                <p><strong>Address:</strong> {userProfile.address}</p>
                <p><strong>Role:</strong> {userProfile.role}</p>
                <p><strong>Status:</strong> {userProfile.status}</p>
                
                <hr className="my-2" />
                
                {userProfile.dealerId ? (
                  <div className="bg-green-50 p-3 rounded">
                    <p className="font-semibold text-green-700">🏪 Dealer Information:</p>
                    <p><strong>Dealer ID:</strong> {userProfile.dealerId}</p>
                    <p><strong>Dealer Name:</strong> {userProfile.dealerName}</p>
                    <p><strong>Dealer Address:</strong> {userProfile.dealerAddress}</p>
                  </div>
                ) : (
                  <p className="text-amber-600">⚠️ User chưa được gán dealer</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              Enter User ID and click button to load profile
            </p>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>📋 Hướng dẫn Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ol className="list-decimal list-inside space-y-2">
            <li>Click "Load Available Managers" để xem danh sách dealer managers chưa có đại lý</li>
            <li>Vào trang Admin → Quản lý Đại lý → Tạo đại lý mới</li>
            <li>Điền form và chọn một Dealer Manager từ dropdown</li>
            <li>Submit để tạo dealer</li>
            <li>Quay lại trang này và load lại managers → user đã chọn sẽ không còn trong list</li>
            <li>Nhập User ID của user đã chọn và click "Load User Profile"</li>
            <li>Kiểm tra user đó giờ có dealerId, dealerName, dealerAddress</li>
          </ol>
        </CardContent>
      </Card>

      {/* Console Log */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Console Log</CardTitle>
          <CardDescription>Mở Developer Tools (F12) để xem log chi tiết</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
