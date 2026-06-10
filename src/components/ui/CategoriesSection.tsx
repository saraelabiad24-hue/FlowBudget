"use client";

import { useState } from "react";
import type { Profile, Category } from "@/types/database";
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
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@heroui/react";
import { deleteAnyCategory, updateAnyCategory } from "@/services/services";

export function CategoriesSection({
  categories,
  onUpdated,
  setError,
}: {
  categories: (Category & { profiles?: Pick<Profile, "full_name" | "email"> })[];
  onUpdated: () => void;
  setError: (err: string | null) => void;
}) {
  const [editingCategory, setEditingCategory] = useState<
    (Category & { profiles?: Pick<Profile, "full_name" | "email"> }) | null
  >(null);

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Delete this category?")) return;
    setError(null);
    const { error: err } = await deleteAnyCategory(categoryId);
    if (err) {
      setError(err);
      return;
    }
    onUpdated();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    setError(null);
    const { error: err } = await updateAnyCategory(editingCategory.id, {
      name: data.get("name") as string,
      type: data.get("type") as "income" | "expense",
      icon: (data.get("icon") as string) || null,
      color: (data.get("color") as string) || null,
    });
    if (err) {
      setError(err);
      return;
    }
    setEditingCategory(null);
    onUpdated();
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Table removeWrapper aria-label="Categories table">
          <TableHeader>
            <TableColumn>ICON</TableColumn>
            <TableColumn>NAME</TableColumn>
            <TableColumn>TYPE</TableColumn>
            <TableColumn>OWNER</TableColumn>
            <TableColumn align="center">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No categories found">
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <span className="text-lg">{c.icon}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-gray-900">
                    {c.name}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={c.type === "income" ? "success" : "danger"}
                  >
                    {c.type}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500">
                    {c.profiles?.full_name || "Unknown"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-center">
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => setEditingCategory(c)}
                      isIconOnly
                    >
                      ✏️
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => handleDelete(c.id)}
                      isIconOnly
                    >
                      🗑️
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        placement="center"
      >
        <ModalContent>
          <form onSubmit={handleSave}>
            <ModalHeader>Edit Category</ModalHeader>
            <ModalBody className="space-y-4">
              <Input
                label="Name"
                name="name"
                defaultValue={editingCategory?.name}
                isRequired
                variant="bordered"
              />
              <Select
                label="Type"
                name="type"
                defaultSelectedKeys={[editingCategory?.type ?? "expense"]}
                variant="bordered"
                disallowEmptySelection
              >
                <SelectItem key="expense">Expense</SelectItem>
                <SelectItem key="income">Income</SelectItem>
              </Select>
              <Input
                label="Icon"
                name="icon"
                defaultValue={editingCategory?.icon ?? ""}
                placeholder="e.g. 🍕"
                variant="bordered"
              />
              <Input
                label="Color"
                name="color"
                defaultValue={editingCategory?.color ?? ""}
                placeholder="e.g. #ef4444"
                variant="bordered"
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setEditingCategory(null)}>
                Cancel
              </Button>
              <Button color="primary" type="submit">
                Save
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
