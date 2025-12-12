"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Undo, Trash2 } from "lucide-react";

interface Column {
    header: string;
    accessorKey: string;
    cell?: (item: any) => React.ReactNode;
}

interface TrashTableProps {
    data: any[];
    columns: Column[];
    onRestore: (id: number) => void;
    onDelete?: (id: number) => void; // Optional permanent delete if we want to add it later
    resourceName: string;
}

export function TrashTable({ data, columns, onRestore, onDelete, resourceName }: TrashTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col, index) => (
                            <TableHead key={index}>{col.header}</TableHead>
                        ))}
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((item) => (
                            <TableRow key={item.id}>
                                {columns.map((col, index) => (
                                    <TableCell key={index}>
                                        {col.cell ? col.cell(item) : item[col.accessorKey]}
                                    </TableCell>
                                ))}
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onRestore(item.id)}
                                        title="Restore"
                                        className="h-8 px-2 lg:px-3 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                    >
                                        <Undo className="h-4 w-4 mr-2" />
                                        Restore
                                    </Button>
                                    {/* Permanent Delete can be added here if needed */}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                No deleted {resourceName} found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
