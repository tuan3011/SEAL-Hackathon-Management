import React from 'react';

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
}

export function DataTable<T>({
    data,
    columns,
    keyExtractor,
    isLoading = false,
    emptyMessage = 'No data available.',
    onRowClick,
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="w-full bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden p-8 flex justify-center">
                <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-6 py-1">
                        <div className="h-2 bg-slate-200 rounded"></div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                            </div>
                            <div className="h-2 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse tabular-nums">
                    <thead className="bg-surface-container-lowest border-b border-outline-variant">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-12 text-center text-on-surface-variant text-sm font-medium"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr
                                    key={keyExtractor(item)}
                                    onClick={() => onRowClick?.(item)}
                                    className={`transition-colors duration-150 bg-white hover:bg-slate-50 ${
                                        onRowClick ? 'cursor-pointer' : ''
                                    }`}
                                >
                                    {columns.map((col, idx) => (
                                        <td
                                            key={idx}
                                            className={`px-6 py-4 text-sm text-on-surface ${col.className || ''}`}
                                        >
                                            {col.cell
                                                ? col.cell(item)
                                                : col.accessorKey
                                                ? (item[col.accessorKey] as React.ReactNode)
                                                : null}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
