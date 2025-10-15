"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Users, Building, Star } from "lucide-react";
import { RoleName } from "@/types/auth";

interface RoleBadgeProps {
  role?: string;
  showIcon?: boolean;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  showIcon = true, 
  className = "" 
}) => {
  const { user } = useAuth();
  const userRole = role || user?.role?.name;

  if (!userRole) return null;

  const getRoleConfig = (roleName: string) => {
    switch (roleName as RoleName) {
      case 'Customer':
        return {
          icon: User,
          color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
          label: 'Khách hàng'
        };
      case 'Admin':
        return {
          icon: Shield,
          color: 'bg-red-100 text-red-800 hover:bg-red-200',
          label: 'Quản trị viên'
        };
      case 'EVM Staff':
        return {
          icon: Star,
          color: 'bg-green-100 text-green-800 hover:bg-green-200',
          label: 'Nhân viên EVM'
        };
      case 'Dealer Manager':
        return {
          icon: Building,
          color: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
          label: 'Quản lý đại lý'
        };
      case 'Dealer Staff':
        return {
          icon: Users,
          color: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
          label: 'Nhân viên đại lý'
        };
      default:
        return {
          icon: User,
          color: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
          label: roleName
        };
    }
  };

  const config = getRoleConfig(userRole);
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} ${className}`}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
};

export const UserRoleDisplay: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Xin chào,</span>
      <span className="font-medium">{user.username}</span>
      <RoleBadge />
    </div>
  );
};