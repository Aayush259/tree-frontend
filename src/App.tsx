import { useCallback, useEffect, useState } from "react";
import Node from "./Node";

const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL

function App() {
    const [nodes, setNodes] = useState<INode[]>([]);
    const [addingTree, setAddingTree] = useState<boolean>(false);
    const [newTree, setNewTree] = useState<Partial<INode> | null>(null);

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

    const fetchNodes = useCallback(async (parentId?: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tree/${parentId ? `?parent_id=${parentId}` : ""}`);
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
                if (!data.data.parent) {
                    setNodes(prev => [...prev, data.data]);
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
    }, [fetchNodes]);

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
            } else {
                throw new Error("Failed to update node")
            }
        } catch (error) {
            console.log(error)
        }
    }, []);

    const deleteNode = useCallback(async (node: INode) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tree/?id=${node.id}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (data?.status === "success") {
                fetchNodes();
            } else {
                throw new Error("Failed to delete node")
            }
        } catch (error) {
            console.log(error)
        }
    }, []);

    useEffect(() => {
        fetchNodes();
    }, [fetchNodes]);
    return (
        <div className="flex flex-col max-w-6xl mx-auto p-6 md:p-10 lg:p-20">
            <button className="ml-auto btn mb-10" onClick={() => {
                setAddingTree(true);
                setNewTree({ name: "", parent: null });
            }}>
                Add Tree
            </button>

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

            {nodes.length == 0 && <div className="text-center text-gray-400">No nodes found. Please add a node.</div>}

            {nodes.map(node => (
                <Node
                    key={node.id}
                    node={node}
                    onUpdate={updateNode}
                    onAdd={addNode}
                    onDelete={deleteNode}
                    fetchNodes={fetchNodes}
                />
            ))}
        </div>
    )
}

export default App
