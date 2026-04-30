import { useCallback, useEffect, useMemo, useState } from "react";
import Node from "./Node";

const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL

function App() {
    const [nodes, setNodes] = useState<INode[]>([]);
    const [addingTree, setAddingTree] = useState<boolean>(false);
    const [newTree, setNewTree] = useState<Partial<INode> | null>(null);
    const [isExported, setIsExported] = useState<boolean>(false);
    const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
    const [isExporting, setIsExporting] = useState<boolean>(false);

    const simplifyNode = useCallback((node: INode): any => {
        const simplified: any = { name: node.name };
        if (node.data && node.data.trim() !== "") {
            simplified.data = node.data;
        }
        if (node.children && node.children.length > 0 && typeof node.children[0] === 'object') {
            simplified.children = (node.children as INode[]).map(simplifyNode);
        }
        return simplified;
    }, []);

    const exportedJSON = useMemo(() => {
        if (nodes.length === 0) return "[]";
        const result = nodes.map(node => ({ tree: simplifyNode(node) }));
        return JSON.stringify(result, null, 2);
    }, [nodes, simplifyNode]);

    const updateNestedNodes = (nodes: INode[], parentId: number, updatedChildren: INode[]): INode[] => {
        return nodes.map(node => {
            if (node.id === parentId) {
                return { ...node, children: updatedChildren };
            }
            if (node.children && node.children.length > 0 && typeof node.children[0] === "object") {
                return { ...node, children: updateNestedNodes(node.children as INode[], parentId, updatedChildren) };
            }
            return node;
        });
    };

    const fetchNodes = useCallback(async (parentId?: number, all?: boolean) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tree/${parentId ? `?parent_id=${parentId}` : (all ? "?all=true" : "")}`);
            const data = await response.json();

            if (data?.status === "success" && data?.data) {
                if (parentId) {
                    setNodes(prev => updateNestedNodes(prev, parentId, data.data));
                } else {
                    setNodes(data.data);
                }
            } else {
                throw new Error("Failed to fetch nodes")
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsInitialLoading(false);
            setIsExporting(false);
        }
    }, []);

    const addNode = useCallback(async (node: Partial<INode>) => {
        try {
            const { children, ...rest } = node;
            const response = await fetch(`${API_BASE_URL}/api/tree/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(rest)
            });
            const data = await response.json();

            if (data?.status === "success" && data?.data) {
                if (isExported || !data.data.parent) {
                    fetchNodes(undefined, isExported);
                } else {
                    fetchNodes(data.data.parent);
                }
            } else {
                throw new Error("Failed to create node")
            }
        } catch (error) {
            console.log(error)
        } finally {
            setNewTree(null);
            setAddingTree(false);
        }
    }, [fetchNodes, isExported]);

    const updateNode = useCallback(async (node: Partial<INode>) => {
        try {
            const { children, ...rest } = node;
            const response = await fetch(`${API_BASE_URL}/api/tree/?id=${node.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(rest)
            });
            const data = await response.json();

            if (data?.status === "success" && data?.data) {
                if (isExported) {
                    fetchNodes(undefined, true);
                } else {
                    const recursiveUpdate = (list: INode[]): INode[] => {
                        return list.map(n => {
                            if (n.id === data.data.id) {
                                return { ...data.data, children: n.children };
                            }
                            if (n.children && n.children.length > 0 && typeof n.children[0] === "object") {
                                return { ...n, children: recursiveUpdate(n.children as INode[]) };
                            }
                            return n;
                        });
                    };
                    setNodes(prev => recursiveUpdate(prev));
                }
            } else {
                throw new Error("Failed to update node")
            }
        } catch (error) {
            console.log(error)
        }
    }, [isExported, fetchNodes]);

    const deleteNode = useCallback(async (node: INode) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tree/?id=${node.id}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (data?.status === "success") {
                fetchNodes(undefined, isExported);
            } else {
                throw new Error("Failed to delete node")
            }
        } catch (error) {
            console.log(error)
        }
    }, [fetchNodes, isExported]);

    useEffect(() => {
        fetchNodes();
    }, [fetchNodes]);
    return (
        <div className="flex flex-col max-w-6xl mx-auto p-6 md:p-10 lg:p-20">
            <div className="flex gap-4 mb-10 ml-auto">
                <button className="btn" disabled={isExporting} onClick={() => {
                    setIsExported(true);
                    fetchNodes(undefined, true);
                }}>
                    {isExporting ? "Exporting..." : "Export"}
                </button>
                <button className="btn" onClick={() => {
                    setAddingTree(true);
                    setNewTree({ name: "", parent: null });
                }}>
                    Add Tree
                </button>
            </div>

            {addingTree && (
                <div className="flex items-center gap-4 flex-wrap">
                    <input type="text" className="border border-slate-300 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200 flex-grow" value={newTree?.name} onChange={(e) => setNewTree({ ...newTree, name: e.target.value })} placeholder="Enter tree name" onKeyDown={(e) => e.key === "Enter" && addNode(newTree)} />

                    <div className="flex items-center gap-2">
                        <button className="btn" onClick={() => addNode(newTree)}>Add</button>
                        <button
                            className="px-4 py-2 bg-slate-200 rounded-full hover:opacity-80"
                            onClick={() => {
                                setAddingTree(false);
                                setNewTree(null);
                            }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {isInitialLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="text-slate-500 font-medium animate-pulse">Loading tree structure...</div>
                </div>
            )}

            {!isInitialLoading && nodes.length == 0 && <div className="text-center text-gray-400">No nodes found. Please add a node.</div>}

            {!isInitialLoading && nodes.map(node => (
                <Node
                    key={node.id}
                    node={node}
                    onUpdate={updateNode}
                    onAdd={addNode}
                    onDelete={deleteNode}
                    fetchNodes={fetchNodes}
                />
            ))}

            {isExported && (
                <div className="mt-10 relative">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-700">Exported JSON</h3>
                        <button className="text-sm text-blue-500 hover:underline" onClick={() => setIsExported(false)}>Close</button>
                    </div>
                    {isExporting ? (
                        <div className="p-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                                <span className="text-slate-500">Generating JSON...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-slate-200 rounded-2xl font-mono text-sm overflow-x-auto">
                            <pre>{exportedJSON}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default App
