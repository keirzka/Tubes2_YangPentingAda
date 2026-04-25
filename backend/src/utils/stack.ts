// Stack<T>
// LIFO data structure dengan linked list

class StackNode<T> {
  next: StackNode<T> | null = null;
  constructor(public readonly value: T) {}
}

export class Stack<T> {
  private top: StackNode<T> | null = null;
  private count = 0;

  push(value: T): void {
    const node = new StackNode(value);
    node.next = this.top;
    this.top = node;
    this.count++;
  }

  pop(): T | undefined {
    if (this.top === null) return undefined;
    const value = this.top.value;
    this.top = this.top.next;
    this.count--;
    return value;
  }

  peek(): T | undefined {
    return this.top?.value;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  get size(): number {
    return this.count;
  }
}