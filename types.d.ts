
interface INode {
    id: number;
    name: string;
    data: string;
    parent: number | null;
    children: number[] | INode[];
    created_at: string;
    updated_at: string;
}
