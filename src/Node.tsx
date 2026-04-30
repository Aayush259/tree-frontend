import { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { MdDelete, MdEdit } from "react-icons/md";

interface NodeProps {
    node: INode;
    onUpdate: (node: Partial<INode>) => void;
    onAdd: (node: Partial<INode>) => void;
    onDelete: (node: INode) => void;
    fetchNodes: (parentId?: number) => void;
}

const Node: React.FC<NodeProps> = ({ node, onUpdate, onAdd, onDelete, fetchNodes }) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editableNode, setEditableNode] = useState<INode>(node);
    const [isAddingChild, setIsAddingChild] = useState<boolean>(false);
    const [childNode, setChildNode] = useState<Partial<INode> | null>(null);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const handleAdd = () => {
        onAdd(childNode);
        setChildNode(null);
        setIsAddingChild(false);
    }

    const handleUpdate = () => {
        onUpdate(editableNode);
        setIsEditing(false);
        setEditableNode(node);
    }

    const handleCancel = () => {
        setIsEditing(false);
        setEditableNode(node);
        setIsAddingChild(false);
        setChildNode(null);
    }

    useEffect(() => {
        if (node.children && node.children?.length > 0 && typeof node.children[0] === "number" && isExpanded) {
            fetchNodes(node.id);
        }
    }, [node, fetchNodes, isExpanded]);

    return (
        <div className="my-2">
            {isEditing ? (
                <div className="flex items-center border border-slate-300 rounded-lg gap-4 py-2 px-4 flex-wrap">
                    <input
                        type="text"
                        className="border border-slate-300 px-4 py-2 outline-none active:ring-2 active:ring-blue-200 focus:ring-2 focus:ring-blue-200 flex-grow rounded-full"
                        value={editableNode?.name}
                        onChange={(e) => setEditableNode({ ...editableNode, name: e.target.value })}
                        placeholder="Enter node name"
                        onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                    />

                    <div className="flex items-center gap-2">
                        <button className="btn" onClick={handleUpdate}>
                            Update
                        </button>
                        <button
                            className="px-4 py-2 bg-slate-200 rounded-full hover:opacity-80"
                            onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-4 border border-slate-300 rounded-lg py-2 px-4 flex-wrap">
                        <div className="flex-grow flex items-center cursor-pointer">
                            {node.children && node.children.length > 0 && (
                                <button onClick={() => setIsExpanded(!isExpanded)}>
                                    <IoIosArrowDown size={18} className={`hover:text-blue-500 transition-all duration-300 ${isExpanded ? "" : "-rotate-90"}`} />
                                </button>
                            )}
                            <div className="px-4 py-2 flex-grow" onClick={() => setIsExpanded(!isExpanded)}>
                                {node.name}
                            </div>
                        </div>

                        {!isAddingChild && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsEditing(true)}>
                                    <MdEdit className="text-blue-500" size={18} />
                                </button>

                                <button className="btn text-sm px-3 py-1" onClick={() => {
                                    setIsAddingChild(true)
                                    setChildNode({ name: "", parent: node.id })
                                }}>
                                    Add Child
                                </button>

                                <button className="btn text-sm px-3 py-1" onClick={() => {
                                    setIsAddingChild(true)
                                    setChildNode({ name: "", parent: node.id })
                                }}>
                                    Add Data
                                </button>

                                <button onClick={() => onDelete(node)}>
                                    <MdDelete className="text-red-500" size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    {isAddingChild && (
                        <div className="flex items-center gap-4 pl-4 py-2">
                            <input
                                type="text"
                                className="border border-slate-300 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200 flex-grow"
                                value={childNode?.name}
                                onChange={(e) => setChildNode({ ...childNode, name: e.target.value })}
                                placeholder="Enter tree name"
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            />

                            <div className="flex items-center gap-2">
                                <button className="btn" onClick={handleAdd}>
                                    Add
                                </button>
                                <button
                                    className="px-4 py-2 bg-slate-200 rounded-full hover:opacity-80"
                                    onClick={handleCancel}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {(node.children && node.children.length > 0 && typeof node.children[0] === "object" && isExpanded) && (
                        <div className="ml-4">
                            {node.children.map(child => (
                                <Node
                                    key={child.id}
                                    node={child}
                                    onUpdate={onUpdate}
                                    onAdd={onAdd}
                                    onDelete={onDelete}
                                    fetchNodes={fetchNodes}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Node;
