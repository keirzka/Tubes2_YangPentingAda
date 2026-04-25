// Queue<T> 

class QueueNode<T> {
  next: QueueNode<T> | null = null;
  constructor(public readonly value: T) { }
}

export class Queue<T> {
  private head: QueueNode<T> | null = null;
  private tail: QueueNode<T> | null = null;
  private count = 0;

  enqueue(value: T): void {
    const node = new QueueNode(value);
    if (this.tail === null) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.count++;
  }

  dequeue(): T | undefined {
    if (this.head === null) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head === null) this.tail = null;
    this.count--;
    return value;
  }

  peek(): T | undefined {
    return this.head?.value;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  get size(): number {
    return this.count;
  }
}