'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Download } from 'lucide-react';
import { TestDriveRes } from '@/lib/testDriveApi';
import { API_BASE_URL } from '@/lib/config';

interface AddToCalendarButtonProps {
  testDrive: TestDriveRes;
}

export function AddToCalendarButton({ testDrive }: AddToCalendarButtonProps) {
  const [downloading, setDownloading] = useState(false);

  // Format date for calendar URLs
  const formatDateForCalendar = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Format date for end time (2 hours later)
  const getEndTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    date.setHours(date.getHours() + 2);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startTime = formatDateForCalendar(testDrive.scheduleDate);
  const endTime = getEndTime(testDrive.scheduleDate);
  
  const title = `Lái thử ${testDrive.productName}`;
  const location = `${testDrive.dealer.name}`;
  const description = `Lái thử xe ${testDrive.productName} tại ${testDrive.dealer.name}. ${testDrive.notes || ''}`;

  // Google Calendar URL
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;

  // Outlook Calendar URL
  const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${startTime}&enddt=${endTime}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;

  // Office 365 Calendar URL
  const office365Url = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${startTime}&enddt=${endTime}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;

  // Download ICS file
  const downloadIcsFile = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/testdrives/${testDrive.id}/calendar.ics`);
      
      if (!response.ok) {
        throw new Error('Failed to download calendar file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-drive-${testDrive.id}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading ICS file:', error);
      alert('Không thể tải file lịch. Vui lòng thử lại sau.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Calendar className="mr-2 h-4 w-4" />
          Thêm vào lịch
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => window.open(googleCalendarUrl, '_blank')}>
          <Calendar className="mr-2 h-4 w-4" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(outlookCalendarUrl, '_blank')}>
          <Calendar className="mr-2 h-4 w-4" />
          Outlook.com
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(office365Url, '_blank')}>
          <Calendar className="mr-2 h-4 w-4" />
          Office 365
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadIcsFile} disabled={downloading}>
          <Download className="mr-2 h-4 w-4" />
          {downloading ? 'Đang tải...' : 'Tải file .ics (Apple Calendar)'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
