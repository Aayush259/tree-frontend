
interface INode {
    id: number;
    name: string;
    data: string;
    parent: number;
    children: number[] | INode[];
    created_at: string;
    updated_at: string;
}
