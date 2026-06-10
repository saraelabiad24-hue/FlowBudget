"use client";

import type { Profile, UserRole } from "@/types/database";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
  Button,
  Spinner,
} from "@heroui/react";
import { formatDate } from "./formatDate";

export function UsersTable({
  profiles,
  updatingRoles,
  onRoleChange,
  onDelete,
}: {
  profiles: Profile[];
  updatingRoles: Set<string>;
  onRoleChange: (userId: string, role: UserRole) => void;
  onDelete: (userId: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <Table removeWrapper aria-label="Users table">
        <TableHeader>
          <TableColumn>FULL NAME</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn>REGISTERED</TableColumn>
          <TableColumn align="center">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No users found">
          {profiles.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <span className="text-sm font-medium text-gray-900">
                  {p.full_name}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-500">{p.email}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Select
                    size="sm"
                    selectedKeys={[p.role]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string | undefined;
                      if (value && value !== p.role) {
                        onRoleChange(p.id, value as UserRole);
                      }
                    }}
                    disallowEmptySelection
                    variant="flat"
                    className="min-w-[100px]"
                    isDisabled={updatingRoles.has(p.id)}
                    aria-label="Select role"
                  >
                    <SelectItem key="user">User</SelectItem>
                    <SelectItem key="admin">Admin</SelectItem>
                  </Select>
                  {updatingRoles.has(p.id) && <Spinner size="sm" />}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-500">
                  {formatDate(p.created_at)}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  onPress={() => onDelete(p.id)}
                  isIconOnly
                >
                  🗑️
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
